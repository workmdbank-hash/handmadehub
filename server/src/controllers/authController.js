// authController.js
import prisma from '../prisma.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// REGISTER LOGIC
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // 1. Check if user already exists
    const userExists = await prisma.user.findUnique({ where: { email } });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // 2. Scramble the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3. Determine role and approval status
    // If role is SELLER, set isApproved to false. Otherwise, true.
    const userRole = role === 'SELLER' ? 'SELLER' : 'CUSTOMER';
    const isApproved = userRole === 'SELLER' ? false : true;

    // 4. Save user to database
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: userRole,
        isApproved: isApproved
      },
    });

    res.status(201).json({ message: 'Account created successfully!', userId: user.id });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// LOGIN LOGIC
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Find the user
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // 2. Check if password is correct
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // 3. NEW: Check if seller is approved
    if (user.role === 'SELLER' && !user.isApproved) {
      return res.status(403).json({ message: 'Your seller account is pending Admin approval.' });
    }

    // 4. Give them a token (ID card)
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.status(200).json({ 
      message: 'Login successful!', 
      token, 
      role: user.role, 
      name: user.name, 
      email: user.email, 
      profileImage: user.profileImage, 
      id: user.id 
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
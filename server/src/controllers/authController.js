// authController.js
import prisma from '../prisma.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// REGISTER LOGIC
export const registerUser = async (req, res) => {
  try {
    const { 
      name, email, password, role, 
      phone, country, city, nrc, shopAddress, 
      shopName, shopDescription, shopCategory, about, shippingPolicy, returnPolicy 
    } = req.body;

    // 1. Check if user already exists
    const userExists = await prisma.user.findUnique({ where: { email } });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // 2. Scramble the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3. Determine role and approval status
    const userRole = role === 'SELLER' ? 'SELLER' : 'CUSTOMER';
    const isApproved = userRole === 'SELLER' ? false : true;

    // 4. Save user to database (with new personal info)
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: userRole,
        isApproved: isApproved,
        phone,
        country,
        city,
        nrc,
        shopAddress
      },
    });

    // 5. If registering as a Seller, create their Shop automatically!
    if (userRole === 'SELLER' && shopName) {
      const generateSlug = (name) => {
        return name.toString().toLowerCase()
          .replace(/\s+/g, '-').replace(/[^\w\-]+/g, '').replace(/\-\-+/g, '-')
          .replace(/^-+/, '').replace(/-+$/, '');
      };

      await prisma.sellerShop.create({
        data: {
          sellerId: user.id,
          name: shopName,
          slug: generateSlug(shopName),
          description: shopDescription,
          category: shopCategory,
          about: about,
          shippingPolicy: shippingPolicy,
          returnPolicy: returnPolicy
        }
      });
    }

    res.status(201).json({ message: 'Account created successfully! Please wait for Admin approval to login.', userId: user.id });
  } catch (error) {
    console.log(error);
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

    // 3. Check if seller is approved
    if (user.role === 'SELLER' && !user.isApproved) {
      return res.status(403).json({ message: 'Your seller account is pending Admin approval.' });
    }

    // 4. Give them a token (ID card)
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    // 5. Fetch the seller's shop slug if they have one
    const shop = await prisma.sellerShop.findUnique({ 
      where: { sellerId: user.id }, 
      select: { slug: true } 
    });

    res.status(200).json({ 
      message: 'Login successful!', 
      token, 
      role: user.role, 
      name: user.name, 
      email: user.email, 
      profileImage: user.profileImage, 
      id: user.id,
      shopSlug: shop?.slug || null 
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
// productController.js
import prisma from '../prisma.js';

// GET ALL PRODUCTS (with search and sorting)
export const getProducts = async (req, res) => {
  try {
    const { search, category, sort } = req.query;
    let whereClause = {};
    let orderBy = { createdAt: 'desc' };
    
    if (sort === 'price_asc') {
      orderBy = { price: 'asc' };
    } else if (sort === 'price_desc') {
      orderBy = { price: 'desc' };
    } else if (sort === 'newest') {
      orderBy = { createdAt: 'desc' };
    }

    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (category && category !== 'All') {
      whereClause.category = category;
    }

    const products = await prisma.product.findMany({
      where: whereClause,
      include: { user: true },
      orderBy: orderBy
    });
    
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// GET ALL UNIQUE CATEGORIES
export const getCategories = async (req, res) => {
  try {
    const categories = await prisma.product.groupBy({
      by: ['category'],
      _count: { category: true },
    });
    
    const result = categories.map(c => c.category);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// GET A SINGLE PRODUCT BY ID
export const getProductById = async (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { 
        user: true,
        reviews: { include: { user: true } } 
      }
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// CREATE A PRODUCT
export const createProduct = async (req, res) => {
  try {
    const { name, description, price, category, stock } = req.body;
    const userId = req.userId; 

    // NEW: Map over req.files to create an array of URLs
    let images = [];
    if (req.files && req.files.length > 0) {
      images = req.files.map(file => `/images/${file.filename}`);
    } else {
      images = ['https://placehold.co/400x300?text=No+Image']; // Default placeholder
    }

    const product = await prisma.product.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        images, // NEW: Save the array of URLs
        category, 
        stock: parseInt(stock) || 0,
        userId
      }
    });

    res.status(201).json({ message: 'Product created!', product });
  } catch (error) {
    console.log("THE EXACT ERROR IS:", error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// UPDATE A PRODUCT
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, category, stock } = req.body;
    const userId = req.userId;

    const product = await prisma.product.findUnique({ where: { id: parseInt(id) } });
    if (!product) return res.status(404).json({ message: 'Product not found' });

    if (product.userId !== userId && req.userRole !== 'ADMIN') {
      return res.status(403).json({ message: 'Not authorized to edit this product' });
    }

    // NEW: Handle images. If new files uploaded, replace. Otherwise, keep old ones.
    let images = product.images;
    if (req.files && req.files.length > 0) {
      images = req.files.map(file => `/images/${file.filename}`);
    }
    
    // If the frontend sent a JSON array of existing images (for deleting one), respect it
    if (req.body.images) {
      try {
        images = JSON.parse(req.body.images);
      } catch (e) {
        // Ignore parse error
      }
    }

    const updatedProduct = await prisma.product.update({
      where: { id: parseInt(id) },
      data: {
        name,
        description,
        price: parseFloat(price),
        category,
        stock: parseInt(stock) || 0,
        images
      }
    });

    res.status(200).json({ message: 'Product updated!', product: updatedProduct });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// DELETE A PRODUCT
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const product = await prisma.product.findUnique({ where: { id: parseInt(id) } });
    if (!product) return res.status(404).json({ message: 'Product not found' });

    if (product.userId !== userId && req.userRole !== 'ADMIN') {
      return res.status(403).json({ message: 'Not authorized to delete this product' });
    }

    await prisma.$transaction([
      prisma.review.deleteMany({ where: { productId: parseInt(id) } }),
      prisma.wishlist.deleteMany({ where: { productId: parseInt(id) } }),
      prisma.orderItem.deleteMany({ where: { productId: parseInt(id) } }),
      prisma.product.delete({ where: { id: parseInt(id) } })
    ]);

    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
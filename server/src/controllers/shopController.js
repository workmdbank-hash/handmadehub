// shopController.js
import prisma from '../prisma.js';

// Helper to generate URL slug (e.g., "My Cool Shop" -> "my-cool-shop")
const generateSlug = (name) => {
  return name.toString().toLowerCase()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    .replace(/\-\-+/g, '-')         // Replace multiple - with single -
    .replace(/^-+/, '')             // Trim - from start of text
    .replace(/-+$/, '');            // Trim - from end of text
};

// CREATE OR UPDATE SELLER SHOP
export const upsertShop = async (req, res) => {
  try {
    const sellerId = req.userId;
    const { name, description, about, shippingPolicy, returnPolicy, processingTime } = req.body;

    // Check if shop exists
    let shop = await prisma.sellerShop.findUnique({ where: { sellerId } });

    // NEW: Handle File Uploads for Logo and Banner
    const logoUrl = req.files && req.files['logo'] ? `/images/${req.files['logo'][0].filename}` : shop?.logo || null;
    const bannerUrl = req.files && req.files['banner'] ? `/images/${req.files['banner'][0].filename}` : shop?.banner || null;

    const shopData = {
      name,
      slug: generateSlug(name),
      description,
      logo: logoUrl,
      banner: bannerUrl,
      about,
      shippingPolicy,
      returnPolicy,
      processingTime
    };

    if (shop) {
      // Update existing shop
      shop = await prisma.sellerShop.update({
        where: { sellerId },
        data: shopData
      });
    } else {
      // Create new shop
      shop = await prisma.sellerShop.create({
        data: { sellerId, ...shopData }
      });
    }

    res.status(200).json(shop);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// GET SELLER'S OWN SHOP
export const getMyShop = async (req, res) => {
  try {
    const sellerId = req.userId;
    const shop = await prisma.sellerShop.findUnique({ where: { sellerId } });
    res.status(200).json(shop);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// GET PUBLIC SHOP BY SLUG
export const getPublicShop = async (req, res) => {
  try {
    const { slug } = req.params;
    const shop = await prisma.sellerShop.findUnique({
      where: { slug },
      include: {
        // Fetch products through the seller relation, AND include the user for each product!
        seller: {
          select: {
            name: true,
            createdAt: true,
            profileImage: true,
            products: {
              include: {
                user: {
                  select: { 
                    id: true, 
                    name: true, 
                    shop: { select: { slug: true, name: true } } 
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!shop) {
      return res.status(404).json({ message: 'Shop not found' });
    }

    res.status(200).json(shop);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
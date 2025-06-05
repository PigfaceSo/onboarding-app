// GET /api/items endpoint
const db = require("../models");
const Item = db.items;
const Category = db.categories;

// Initialize database connection
const initializeDb = async () => {
  try {
    await db.sequelize.authenticate();
    console.log('Database connection established');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    throw error;
  }
};

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle OPTIONS request (CORS preflight)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Only allow GET method for this endpoint
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    await initializeDb();
    console.log('Fetching categories with items...');
    
    // First, check if we have any categories
    const categoryCount = await Category.count();
    console.log(`Found ${categoryCount} categories in database`);
    
    if (categoryCount === 0) {
      console.log('No categories found, attempting to create default category');
      // Create at least one default category if none exist
      const defaultCategory = await Category.create({
        name: 'General Facilities'
      });
      console.log(`Created default category: ${defaultCategory.name}`);
    }
    
    const categories = await Category.findAll({
      include: [{
        model: Item,
        as: 'items',
        attributes: ['id', 'name', 'is_present', 'notes'] // Specify item attributes to include
      }],
      order: [
        ['name', 'ASC'], // Order categories by name
        [{ model: Item, as: 'items' }, 'name', 'ASC'] // Order items within each category by name
      ]
    });
    
    console.log(`Returning ${categories.length} categories with their items`);
    return res.status(200).json(categories);
  } catch (err) {
    console.error('Error in findAllItems:', err);
    return res.status(500).json({
      message: err.message || "Some error occurred while retrieving items."
    });
  }
};

// GET /api/seed-data endpoint for initializing the database from CSV
const db = require("./models");
const { seedDatabaseFromCSV } = require('./utils/csvParser');

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
    
    // Ensure DB is synced before seeding
    await db.sequelize.sync();
    console.log('Database synced. Proceeding to seed data...');
    
    const result = await seedDatabaseFromCSV();
    if (result.success) {
      return res.status(200).json({ 
        message: result.message, 
        details: { 
          categories: result.categoriesCreated, 
          items: result.itemsCreated 
        } 
      });
    } else {
      return res.status(500).json({ message: result.message });
    }
  } catch (error) {
    console.error('Error during data seeding process:', error);
    return res.status(500).json({
      message: `Failed to seed data: ${error.message}`
    });
  }
};

// /api/villas/[id]/documents endpoint - get all documents for a villa
const db = require("../../../models");

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
    
    const { id } = req.query; // In Vercel, route params are in req.query
    
    const documents = await db.villaDocument.findAll({ 
      where: { villa_id: id } 
    });
    
    return res.status(200).json(documents);
  } catch (error) {
    console.error(`Error retrieving documents for villa ${req.query.id}:`, error);
    return res.status(500).json({ 
      error: 'Failed to retrieve villa documents', 
      details: error.message
    });
  }
};

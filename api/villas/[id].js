// /api/villas/[id] endpoint - get, update, or delete a villa
const db = require("../models");
const Villa = db.villa;
const Owner = db.owner;

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
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle OPTIONS request (CORS preflight)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    await initializeDb();
    
    const { id } = req.query; // In Vercel, route params are in req.query
    
    if (req.method === 'GET') {
      // Get a villa by ID
      const villa = await Villa.findByPk(id, {
        include: [{ model: Owner, as: 'owner' }]
      });
      
      if (!villa) {
        return res.status(404).json({ error: 'Villa not found' });
      }
      
      return res.status(200).json(villa);
    } 
    else if (req.method === 'PUT') {
      // Update a villa
      const { villa, owner } = req.body;
      
      const existingVilla = await Villa.findByPk(id);
      if (!existingVilla) {
        return res.status(404).json({ error: 'Villa not found' });
      }
      
      if (owner && existingVilla.owner_id) {
        await Owner.update(owner, { where: { id: existingVilla.owner_id } });
      }
      await existingVilla.update(villa);
      
      return res.status(200).json(existingVilla);
    }
    else if (req.method === 'DELETE') {
      // Delete a villa
      const villa = await Villa.findByPk(id);
      if (!villa) {
        return res.status(404).json({ error: 'Villa not found' });
      }
      
      await villa.destroy();
      return res.status(204).end(); // No content
    }
    else {
      return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error(`Error processing villa ${req.query.id} request:`, error);
    return res.status(500).json({ error: error.message });
  }
};

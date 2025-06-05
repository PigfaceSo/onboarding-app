// /api/villas/[id]/checklist endpoint - update villa checklist items
const db = require("../../../models");
const VillaChecklistItem = db.villaChecklistItem;

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
  res.setHeader('Access-Control-Allow-Methods', 'POST, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle OPTIONS request (CORS preflight)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow PUT/POST methods for this endpoint
  if (req.method !== 'PUT' && req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    await initializeDb();
    
    const { id } = req.query; // In Vercel, route params are in req.query
    const { item_id, is_present, notes, checked_by } = req.body;

    if (!item_id) {
      return res.status(400).json({ error: 'item_id is required' });
    }

    // Find or create the checklist item
    const [checklistItem, created] = await VillaChecklistItem.findOrCreate({
      where: { villa_id: id, item_id: item_id },
      defaults: {
        is_present: is_present,
        notes: notes,
        checked_by: checked_by,
        checked_at: new Date()
      }
    });

    // If it exists, update it
    if (!created) {
      await checklistItem.update({
        is_present: is_present,
        notes: notes,
        checked_by: checked_by,
        checked_at: new Date()
      });
    }

    return res.status(200).json(checklistItem);
  } catch (error) {
    console.error(`Error updating checklist item for villa ${req.query.id}:`, error);
    return res.status(500).json({ 
      error: 'Failed to update checklist item', 
      details: error.message
    });
  }
};

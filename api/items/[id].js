// PUT /api/items/:id endpoint for updating items
const db = require("../models");
const Item = db.items;

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
  res.setHeader('Access-Control-Allow-Methods', 'PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle OPTIONS request (CORS preflight)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Only allow PUT method for this endpoint
  if (req.method !== 'PUT') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { id } = req.query; // In Vercel, route params are in req.query

  // Validate request body
  if (req.body.is_present === undefined && req.body.notes === undefined) {
    return res.status(400).json({
      message: "Content for update (is_present or notes) cannot be empty!"
    });
  }

  const updateData = {};
  if (req.body.is_present !== undefined) {
    updateData.is_present = req.body.is_present;
  }
  if (req.body.notes !== undefined) {
    updateData.notes = req.body.notes;
  }

  try {
    await initializeDb();
    
    const num = await Item.update(updateData, {
      where: { id: id }
    });

    if (num == 1) {
      return res.status(200).json({
        message: "Item was updated successfully."
      });
    } else {
      return res.status(404).json({
        message: `Cannot update Item with id=${id}. Maybe Item was not found or req.body is empty!`
      });
    }
  } catch (err) {
    console.error('Error updating item:', err);
    return res.status(500).json({
      message: "Error updating Item with id=" + id
    });
  }
};

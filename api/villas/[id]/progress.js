// /api/villas/[id]/progress endpoint - update onboarding step progress
const db = require("../../../models");
const OnboardingProgress = db.onboardingProgress;

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
    const { step_name, status, notes, completed_by } = req.body;

    if (!step_name) {
      return res.status(400).json({ error: 'step_name is required' });
    }

    // Find or create the progress entry
    const [progressStep, created] = await OnboardingProgress.findOrCreate({
      where: { villa_id: id, step_name: step_name },
      defaults: {
        status: status || 'completed',
        notes: notes,
        completed_by: completed_by,
        completed_at: new Date()
      }
    });

    // If it exists, update it
    if (!created) {
      await progressStep.update({
        status: status || 'completed',
        notes: notes,
        completed_by: completed_by,
        completed_at: new Date()
      });
    }

    return res.status(200).json(progressStep);
  } catch (error) {
    console.error(`Error updating progress for villa ${req.query.id}:`, error);
    return res.status(500).json({ 
      error: 'Failed to update onboarding progress', 
      details: error.message
    });
  }
};

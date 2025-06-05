// /api/villas endpoint - list all villas (GET) or create new villa (POST)
const db = require("../models");
const Villa = db.villa;
const Owner = db.owner;
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
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle OPTIONS request (CORS preflight)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    await initializeDb();
    
    if (req.method === 'GET') {
      // List all villas
      const villas = await Villa.findAll({
        include: [{ model: Owner, as: 'owner' }]
      });
      return res.status(200).json(villas);
    } 
    else if (req.method === 'POST') {
      // Create a new villa with owner
      const { villa, owner } = req.body;
      
      // Check if owner with this email already exists
      let newOwner;
      if (owner.email) {
        const existingOwner = await Owner.findOne({ where: { email: owner.email } });
        
        if (existingOwner) {
          // Update existing owner with new info
          await existingOwner.update(owner);
          newOwner = existingOwner;
        } else {
          // Create new owner
          newOwner = await Owner.create(owner);
        }
      } else {
        // No email provided, create new owner
        newOwner = await Owner.create(owner);
      }
      
      // Create villa with owner reference
      const newVilla = await Villa.create({
        ...villa,
        owner_id: newOwner.id
      });
  
      // Initialize onboarding steps
      const onboardingSteps = [
        'basic_info', 'owner_details', 'facilities_check', 
        'documents_upload', 'photos_upload', 'final_review'
      ];
      
      const progressEntries = onboardingSteps.map(step => ({
        villa_id: newVilla.id,
        step_name: step,
        status: step === 'basic_info' ? 'completed' : 'pending' // Mark basic_info as completed initially
      }));
      
      await OnboardingProgress.bulkCreate(progressEntries);
  
      return res.status(201).json(newVilla);
    }
    else {
      return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error("Error processing villa request:", error);
    return res.status(500).json({ error: error.message });
  }
};

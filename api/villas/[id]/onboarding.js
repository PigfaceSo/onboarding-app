// /api/villas/[id]/onboarding endpoint - get comprehensive villa onboarding data
const db = require("../../../models");
const Villa = db.villa;
const Owner = db.owner;
const VillaChecklistItem = db.villaChecklistItem;
const OnboardingProgress = db.onboardingProgress;
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
    console.log(`Getting onboarding data for villa ID: ${id}`);
    
    // First get the basic villa data
    const villa = await Villa.findByPk(id);
    
    if (!villa) {
      console.log(`Villa with ID ${id} not found`);
      return res.status(404).json({ error: 'Villa not found' });
    }
    
    // Create a response object to build incrementally
    const response = villa.toJSON();

    // Get owner data
    try {
      const owner = await Owner.findByPk(villa.owner_id);
      if (owner) {
        response.owner = owner;
      } else {
        console.log(`Owner not found for villa ${id} (owner ID: ${villa.owner_id})`);
        response.owner = null;
      }
    } catch (ownerError) {
      console.error(`Error fetching owner for villa ${id}:`, ownerError);
      response.owner = null;
    }

    // Get onboarding progress steps
    try {
      const progressSteps = await OnboardingProgress.findAll({
        where: { villa_id: id }
      });
      response.progressSteps = progressSteps;
    } catch (progressError) {
      console.error(`Error fetching progress steps for villa ${id}:`, progressError);
      response.progressSteps = [];
    }

    // Get villa documents
    try {
      const documents = await db.villaDocument.findAll({
        where: { villa_id: id }
      });
      response.documents = documents;
    } catch (docsError) {
      console.error(`Error fetching documents for villa ${id}:`, docsError);
      response.documents = [];
    }

    // Get checklist items
    try {
      const checklistItems = await VillaChecklistItem.findAll({
        where: { villa_id: id },
        include: [{
          model: Item,
          as: 'item'
        }]
      });
      response.checklistItems = checklistItems;
    } catch (checklistError) {
      console.error(`Error fetching checklist items for villa ${id}:`, checklistError);
      response.checklistItems = [];
    }

    console.log(`Successfully retrieved onboarding data for villa ID: ${id}`);
    return res.status(200).json(response);
    
  } catch (error) {
    console.error(`Error getting onboarding data for villa ${req.query.id}:`, error);
    return res.status(500).json({ 
      error: 'Failed to retrieve villa onboarding data', 
      details: error.message
    });
  }
};

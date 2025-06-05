const db = require("../models");
const Villa = db.villa;
const Owner = db.owner;
const VillaChecklistItem = db.villaChecklistItem;
const OnboardingProgress = db.onboardingProgress; // Added OnboardingProgress
const Item = db.item;
const Category = db.category;

// Create villa with owner
exports.create = async (req, res) => {
  try {
    const { villa, owner } = req.body;
    
    // Check if owner with this email already exists
    let newOwner;
    if (owner.email) {
      const existingOwner = await Owner.findOne({ where: { email: owner.email } });
      
      if (existingOwner) {
        // Update existing owner with new info instead of creating
        await existingOwner.update(owner);
        newOwner = existingOwner;
        console.log(`Using existing owner with email ${owner.email} (ID: ${existingOwner.id})`);
      } else {
        // Create new owner if no existing one found
        newOwner = await Owner.create(owner);
        console.log(`Created new owner with email ${owner.email} (ID: ${newOwner.id})`);
      }
    } else {
      // No email provided, create new owner
      newOwner = await Owner.create(owner);
      console.log('Created new owner without email');
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

    res.status(201).json(newVilla);
  } catch (error) {
    console.error("Error creating villa:", error);
    res.status(500).json({ error: error.message });
  }
};

// Get all villas (basic list)
exports.findAll = async (req, res) => {
  try {
    const villas = await Villa.findAll({
      include: [{ model: Owner, as: 'owner' }]
    });
    res.json(villas);
  } catch (error) {
    console.error("Error finding all villas:", error);
    res.status(500).json({ error: error.message });
  }
};

// Get a single villa by ID (basic info)
exports.findOne = async (req, res) => {
  try {
    const villaId = req.params.id;
    const villa = await Villa.findByPk(villaId, {
      include: [{ model: Owner, as: 'owner' }]
    });
    if (!villa) {
      return res.status(404).json({ error: 'Villa not found' });
    }
    res.json(villa);
  } catch (error) {
    console.error("Error finding villa by ID:", error);
    res.status(500).json({ error: error.message });
  }
};

// Update a villa
exports.update = async (req, res) => {
  try {
    const villaId = req.params.id;
    const { villa, owner } = req.body;

    const existingVilla = await Villa.findByPk(villaId);
    if (!existingVilla) {
      return res.status(404).json({ error: 'Villa not found' });
    }

    if (owner && existingVilla.owner_id) {
      await Owner.update(owner, { where: { id: existingVilla.owner_id } });
    }
    await existingVilla.update(villa);

    res.json(existingVilla);
  } catch (error) {
    console.error("Error updating villa:", error);
    res.status(500).json({ error: error.message });
  }
};

// Delete a villa
exports.delete = async (req, res) => {
  try {
    const villaId = req.params.id;
    const villa = await Villa.findByPk(villaId);
    if (!villa) {
      return res.status(404).json({ error: 'Villa not found' });
    }
    // Associated owner is not deleted by default, handle if necessary
    await villa.destroy();
    res.status(204).send(); // No content
  } catch (error) {
    console.error("Error deleting villa:", error);
    res.status(500).json({ error: error.message });
  }
};

// Get villa onboarding data (comprehensive)
exports.getOnboardingData = async (req, res) => {
  try {
    const villaId = req.params.id;
    console.log(`Getting onboarding data for villa ID: ${villaId}`);
    
    // First get the basic villa data
    const villa = await Villa.findByPk(villaId);
    
    if (!villa) {
      console.log(`Villa with ID ${villaId} not found`);
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
        console.log(`Owner not found for villa ${villaId} (owner ID: ${villa.owner_id})`);
        response.owner = null;
      }
    } catch (ownerError) {
      console.error(`Error fetching owner for villa ${villaId}:`, ownerError);
      response.owner = null;
    }

    // Get onboarding progress steps
    try {
      const progressSteps = await OnboardingProgress.findAll({
        where: { villa_id: villaId }
      });
      response.progressSteps = progressSteps;
    } catch (progressError) {
      console.error(`Error fetching progress steps for villa ${villaId}:`, progressError);
      response.progressSteps = [];
    }

    // Get villa documents
    try {
      const documents = await db.villaDocument.findAll({
        where: { villa_id: villaId }
      });
      response.documents = documents;
    } catch (docsError) {
      console.error(`Error fetching documents for villa ${villaId}:`, docsError);
      response.documents = [];
    }

    // Get checklist items
    try {
      const checklistItems = await VillaChecklistItem.findAll({
        where: { villa_id: villaId },
        include: [{
          model: Item,
          as: 'item'
        }]
      });
      response.checklistItems = checklistItems;
    } catch (checklistError) {
      console.error(`Error fetching checklist items for villa ${villaId}:`, checklistError);
      response.checklistItems = [];
    }

    console.log(`Successfully retrieved onboarding data for villa ID: ${villaId}`);
    res.json(response);
  } catch (error) {
    console.error(`Error getting onboarding data for villa ${req.params.id}:`, error);
    res.status(500).json({ 
      error: 'Failed to retrieve villa onboarding data', 
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Complete an onboarding step
exports.completeOnboardingStep = async (req, res) => {
  try {
    const villaId = req.params.id;
    const { step_name, status, notes, completed_by } = req.body;

    const [progressStep, created] = await OnboardingProgress.findOrCreate({
      where: { villa_id: villaId, step_name: step_name },
      defaults: {
        status: status || 'completed',
        notes: notes,
        completed_by: completed_by,
        completed_at: new Date()
      }
    });

    if (!created) {
      await progressStep.update({
        status: status || 'completed',
        notes: notes,
        completed_by: completed_by,
        completed_at: new Date()
      });
    }
    res.json(progressStep);
  } catch (error) {
    console.error("Error completing onboarding step:", error);
    res.status(500).json({ error: error.message });
  }
};

// Update checklist item
exports.updateChecklistItem = async (req, res) => {
  try {
    const villaId = req.params.id; // villa_id from path
    const { item_id, is_present, notes, checked_by } = req.body;
    
    const [checklistItem, created] = await VillaChecklistItem.findOrCreate({
      where: { villa_id: villaId, item_id: item_id },
      defaults: {
        is_present: is_present,
        notes: notes,
        checked_by: checked_by,
        checked_at: new Date()
      }
    });

    if (!created) {
      await checklistItem.update({
        is_present: is_present,
        notes: notes,
        checked_by: checked_by,
        checked_at: new Date()
      });
    }

    res.json(checklistItem);
  } catch (error) {
    console.error("Error updating checklist item:", error);
    res.status(500).json({ error: error.message });
  }
};

// Upload a document
exports.uploadDocument = async (req, res) => {
  try {
    const villaId = req.params.id;
    const { document_type, description, uploaded_by, is_required } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: 'No file uploaded.' });
    }

    const newDocument = await db.villaDocument.create({
      villa_id: villaId,
      document_type: document_type,
      file_name: file.filename,
      file_path: file.path,
      file_size: file.size,
      mime_type: file.mimetype,
      uploaded_by: uploaded_by || 'System',
      is_required: is_required || false,
      description: description
    });

    res.status(201).json(newDocument);
  } catch (error) {
    console.error("Error uploading document:", error);
    res.status(500).json({ error: error.message });
  }
};

// Get all documents for a villa
exports.getDocuments = async (req, res) => {
  try {
    const villaId = req.params.id;
    const documents = await db.villaDocument.findAll({ where: { villa_id: villaId } });
    res.json(documents);
  } catch (error) {
    console.error("Error getting documents:", error);
    res.status(500).json({ error: error.message });
  }
};

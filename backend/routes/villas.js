const express = require('express');
const router = express.Router();
const villaController = require('../controllers/villaController');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir); // Use absolute path
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = file.originalname.split('.').pop();
    cb(null, file.fieldname + '-' + uniqueSuffix + '.' + extension);
  }
});

const upload = multer({ storage: storage });

// Villa CRUD routes
router.post('/', villaController.create);
router.get('/', villaController.findAll);
router.get('/:id', villaController.findOne);
router.put('/:id', villaController.update);
router.delete('/:id', villaController.delete);

// Onboarding specific routes for a villa
router.get('/:id/onboarding', villaController.getOnboardingData);
router.post('/:id/onboarding/step', villaController.completeOnboardingStep);
router.post('/:id/checklist', villaController.updateChecklistItem); // Note: path parameter is :id for villa_id

// Document routes for a villa
router.post('/:id/documents', upload.single('file'), villaController.uploadDocument);
router.get('/:id/documents', villaController.getDocuments);

module.exports = router;

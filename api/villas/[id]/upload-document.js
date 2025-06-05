// /api/villas/[id]/upload-document endpoint - upload a document for a villa
const { IncomingForm } = require('formidable');
const fs = require('fs');
const path = require('path');
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

// Ensure upload directory exists
const createUploadDir = () => {
  // For Vercel serverless, we'll use the /tmp directory which is writable
  const uploadDir = path.join('/tmp', 'uploads');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
  return uploadDir;
};

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle OPTIONS request (CORS preflight)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST method for this endpoint
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    await initializeDb();
    const { id } = req.query; // In Vercel, route params are in req.query

    // Create upload directory
    const uploadDir = createUploadDir();

    // Parse form with files
    const form = new IncomingForm({ 
      uploadDir,
      keepExtensions: true,
      maxFileSize: 10 * 1024 * 1024, // 10MB limit
    });

    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error('Error parsing form:', err);
        return res.status(500).json({ error: 'Error processing file upload', details: err.message });
      }

      try {
        const file = files.file[0]; // formidable v4 returns arrays
        const { document_type, description, uploaded_by, is_required } = fields;
        
        if (!file) {
          return res.status(400).json({ error: 'No file uploaded.' });
        }

        // In serverless environments, file storage should be handled differently
        // Ideally, we'd upload to S3 or similar cloud storage
        // For now, we'll just record the file info in the database
        
        const newDocument = await db.villaDocument.create({
          villa_id: id,
          document_type: document_type?.[0] || 'other',
          file_name: file.originalFilename,
          file_path: file.filepath, // This will be in /tmp and is temporary in serverless
          file_size: file.size,
          mime_type: file.mimetype,
          uploaded_by: uploaded_by?.[0] || 'System',
          is_required: is_required?.[0] === 'true' || false,
          description: description?.[0] || ''
        });

        // Note: In a production serverless environment,
        // we would upload the file to S3 or another persistent storage here
        // For now, we'll just acknowledge that this is a limitation

        return res.status(201).json({
          ...newDocument.toJSON(),
          note: "In serverless environments, file storage is temporary. In production, implement upload to S3 or similar."
        });
      } catch (dbError) {
        console.error('Error saving document to database:', dbError);
        return res.status(500).json({ 
          error: 'Error saving document record', 
          details: dbError.message 
        });
      }
    });
  } catch (error) {
    console.error(`Error uploading document for villa ${req.query.id}:`, error);
    return res.status(500).json({ 
      error: 'Failed to process document upload', 
      details: error.message
    });
  }
};

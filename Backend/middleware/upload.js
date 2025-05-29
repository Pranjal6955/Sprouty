const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { uploadFile } = require('../services/firebaseService');

// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure memory storage for local file processing
const storage = multer.memoryStorage();

// File filter - only allow images
const fileFilter = (req, file, cb) => {
  // Accept only image files
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

// Initialize multer upload
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5 MB max file size
  },
  fileFilter: fileFilter
});

// Local upload middleware
const uploadToLocal = async (req, res, next) => {
  try {
    if (!req.file && !req.files) return next();
    
    // For single file upload
    if (req.file) {
      const fileBuffer = req.file.buffer;
      const timestamp = Date.now();
      const filename = `${timestamp}-${req.file.originalname.replace(/\s+/g, '-')}`;
      const filePath = `${req.user.id}/${filename}`;
      
      // Upload to local storage
      const fileUrl = await uploadFile(fileBuffer, filePath, { 
        contentType: req.file.mimetype 
      });
      
      // Add URL to request
      req.file.localUrl = fileUrl;
    }
    
    // For multiple files upload
    if (req.files && req.files.length > 0) {
      const uploadPromises = req.files.map(async (file) => {
        const fileBuffer = file.buffer;
        const timestamp = Date.now();
        const filename = `${timestamp}-${file.originalname.replace(/\s+/g, '-')}`;
        const filePath = `${req.user.id}/${filename}`;
        
        // Upload to local storage
        const fileUrl = await uploadFile(fileBuffer, filePath, { 
          contentType: file.mimetype 
        });
        
        // Add URL to file object
        file.localUrl = fileUrl;
        return file;
      });
      
      await Promise.all(uploadPromises);
    }
    
    next();
  } catch (err) {
    next(err);
  }
};

// Export upload middlewares
module.exports = {
  // For single image upload
  single: [upload.single('image'), uploadToLocal],
  
  // For multiple image upload, max 5 images
  multiple: [upload.array('images', 5), uploadToLocal],
  
  // Custom handler for upload errors
  handleUploadError: (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
      // Multer-specific error
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          error: 'File too large. Maximum size is 5MB.'
        });
      }
      return res.status(400).json({
        success: false,
        error: `Upload error: ${err.message}`
      });
    } else if (err) {
      // Other errors
      return res.status(400).json({
        success: false,
        error: err.message
      });
    }
    next();
  }
};

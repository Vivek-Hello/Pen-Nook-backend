import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinaryConfig from './cloudinary.js';

const storage = new CloudinaryStorage({
  cloudinary: cloudinaryConfig,
  params: (req, file) => ({
    folder: 'Blog',
    allowed_formats: ['jpeg', 'png', 'jpg', 'webp'],
    public_id: `${Date.now()}-${file.originalname.split('.')[0]}`,
    resource_type: 'auto'
  })
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only images are allowed!'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

const handleUploadErrors = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    // Handle specific Multer errors
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ 
        success: false,
        message: 'File size too large (max 5MB)'
      });
    }
    return res.status(400).json({ 
      success: false,
      message: err.message 
    });
  } else if (err) {
    // Handle other errors
    return res.status(400).json({ 
      success: false,
      message: err.message 
    });
  }
  next();
};

export { upload, handleUploadErrors };
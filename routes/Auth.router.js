import express from 'express';
import {
  DeleteUser,
  LogInUser,
  logOutUser,
  registerUser,
  updateUserProfile
} from '../controllers/Auth.controller.js';
import { upload, handleUploadErrors } from '../middleware/multer.js'; // Import error handler
import { authMiddleware } from '../middleware/auth.middleware.js';


const authRouter = express.Router();

// Registration Route
authRouter.post('/register', 
  upload.single("image"),
  handleUploadErrors, // Add upload error handling
  registerUser
);

// Login Route
authRouter.post('/login', LogInUser);

// Logout Route (should be POST)
authRouter.get('/logout', authMiddleware ,logOutUser);

// Update Profile Route
authRouter.put('/edit',
  upload.single("image"),
  authMiddleware,
  handleUploadErrors,
  updateUserProfile
);

// Delete User Route (should be DELETE method)
authRouter.delete('/delete', authMiddleware,DeleteUser);

export default authRouter;
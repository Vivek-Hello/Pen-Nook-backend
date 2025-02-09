import { User } from "../models/User.model.js";
import dotenv from 'dotenv'
import jwt from 'jsonwebtoken'
dotenv.config();
export const authMiddleware = async (req, res, next) => {
    try {
      const token = req.cookies.token;
      if (!token) throw new Error('Authentication required');
  
      const decoded = jwt.verify(token, process.env.ACCESSTOKEN);
      const user = await User.findById(decoded.userID).select('-password');
      
      if (!user) throw new Error('User not found');
      
      req.user = user;
      next();
    } catch (error) {
      res.status(401).json({ 
        success: false,
        message: error.message || 'Authentication failed'
      });
    }
  };
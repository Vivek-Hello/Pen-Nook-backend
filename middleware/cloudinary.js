import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config()

const cloudinaryConfig = () => {
  try {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure: true // Always use HTTPS
    });
    console.log('Cloudinary connected successfully');
    return cloudinary;
  } catch (error) {
    console.error('Cloudinary config error:', error);
    process.exit(1);
  }
};

export default cloudinaryConfig();
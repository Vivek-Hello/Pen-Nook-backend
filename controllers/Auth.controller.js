
import { User } from "../models/User.model.js"
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
dotenv.config()


// Register User
export const registerUser = async (req, res) => {
  try {
 
    // Validate required fields
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields (username, email, password) are required"
      });
    }

    // Validate file upload exists
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Profile image is required"
      });
    }

    // Check for existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User already exists with this email"
      });
    }

    // Create user with image
    const user = await User.create({
      username,
      email,
      password,
      image: req.file.path // Directly use file path from Cloudinary
    });

    // Generate tokens
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    // Set secure HTTP-only cookie
    res.cookie("token", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 3 * 24 * 60 * 60 * 1000
    });

    // Return success response
    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        image: user.image
      },
      refreshToken
    });

  } catch (error) {
    console.error("Registration Error:", error);

    // Handle Mongoose validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }

    // Handle duplicate email error
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Email already exists"
      });
    }

    // Handle file upload errors
    if (error instanceof multer.MulterError) {
      return res.status(400).json({
        success: false,
        message: `File upload error: ${error.message}`
      });
    }

    // Generic server error
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};


// login User


export const LogInUser = async (req, res) => {



  
    const { email, password } = req.body;
     
      

      try {
      let user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
  
      const passwordCheck = await user.isPasswordCorrect(password);
      if (!passwordCheck) {
        return res.status(403).json({ message: "Incorrect password" });
      }
  
      const refreshToken = await user.generateRefreshToken();
      const accessToken = await user.generateAccessToken();
  
      // Set token in cookies
      res.cookie("token", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict", // For CSRF protection
        maxAge: 3 * 24 * 60 * 60 * 1000, // 3 days
      });
  
      // Respond to the client
      return res.status(200).json({
        message: "Login successful",
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          image:user.image
        },
      });
    } catch (error) {
      console.log("Server error during login", error);
      return res.status(500).json({ message: "Server error during login" });
    }
  };
  


  

// logout User
export const logOutUser = async (req, res) => {
  try {
    // Clear the token cookie

    
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax"
    });
    req.user = null;

    // Respond to the client confirming the logout
    return res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    console.log("Server error during logout", error);
    return res.status(500).json({ message: "Server error during logout" });
  }
};


export const updateUserProfile = async (req, res) => {
  try {
  
    // Ensure the user is authenticated
    if (!req.user) {
      return res.status(401).json({ success: false, message: "User not authenticated" });
    }

    const { _id } = req.user; // Correct way to get user ID from auth middleware
    

    // Build the update object dynamically
    const updateData = {};
    if (req.body.username) updateData.username = req.body.username;
    if (req.body.email) updateData.email = req.body.email;
    if (req.file) updateData.image = req.file.path; 

    // Handle password update securely (hash the password before saving)
   

    console.log("🔹 Updating User with Data:", updateData);

    // Update user and return new data
    const updatedUser = await User.findByIdAndUpdate(
      _id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select("-password"); // Exclude password from response

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser,
    });

  } catch (error) {
    console.error("❌ Update Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error during update",
    });
  }
};






export const DeleteUser = async (req, res) => {
  try {
      const token = req.cookies.token;

      // Ensure the token exists
      if (!token) {
          return res.status(401).json({ message: "No token provided, authorization denied" });
      }

      // Verify the token and extract the user ID
      const { userID } = jwt.verify(token, process.env.ACCESSTOKEN);

      // Attempt to delete the user
      const deletedUser = await User.findByIdAndDelete(userID);

      // Clear the authentication cookie
      res.clearCookie("token", {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
      });

      // Handle case where the user was not found
      if (!deletedUser) {
          return res.status(404).json({ message: "User not found" });
      }

      // Respond with success if user is deleted
      return res.status(203).json({ message: "The user is deleted" });

  } catch (error) {
      console.error("Error deleting user profile:", error);
      return res.status(500).json({ message: "Server error while deleting profile" });
  }
};


export const getSingleUser = async (req, res) => {
  try {
    const token = req.cookies.token;

    // Ensure the token exists
    if (!token) {
      return res.status(401).json({ message: "No token provided, authorization denied" });
    }

    // Verify the token to extract the user ID
    const { userID } = jwt.verify(token, process.env.ACCESSTOKEN);

    // Fetch the user by ID
    const user = await User.findById(userID).select("-password -refreshToken");

    // Check if user exists
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Send the user details as response
    return res.status(200).json({ message: "User fetched successfully", user });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return res.status(500).json({ message: "Server error while fetching user profile" });
  }
};





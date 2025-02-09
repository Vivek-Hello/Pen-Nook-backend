import { Blog } from "../models/Blog.model.js";
import { User } from "../models/User.model.js";



export const CreateBlog = async (req, res) => {
  try {
   

    const { title, description, category } = req.body;

    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized: User not found" });
    }

    const userId = req.user._id;

    // ✅ Ensure title, description, and image are provided
    if (!title || !description) {
      return res.status(400).json({ message: "Title and description are required" });
    }

    // ✅ Check if the image is uploaded correctly
    const image = req.file ? req.file.path : null;
    if (!image) {
      return res.status(400).json({ message: "Image is required" });
    }

    // ✅ Check if blog already exists
    const existBlog = await Blog.findOne({ title});
    if (existBlog) { 
      return res.status(406).json({ message: "The Blog already exists" });
    }

    // ✅ Create new blog
    const blog = await Blog.create({ title, description, category, image, user: userId });

    if (!blog) {
      return res.status(500).json({ message: "Blog not created" });
    }

    // ✅ Update the user's blogs array
    await User.findByIdAndUpdate(userId, { $push: { blog: blog._id } });

    return res.status(201).json({ message: "The Blog is created", blog });
  } catch (error) {
    console.log("❌ Server error while creating the blog:", error);
    return res.status(500).json({ message: "Server Error", error });
  }
};





export const DeleteBlog = async (req, res) => {
  try {
    const { id } = req.params;

    // Find and delete the blog
    const blog = await Blog.findByIdAndDelete(id);
    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    // Find the user who created the blog
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Remove the blog reference from the user's blog array (corrected from 'blogs' to 'blog')
    user.blogs = user.blogs.filter((blogId) => blogId.toString() !== id);
    await user.save();

    return res.status(200).json({ message: "Blog deleted successfully" });
  } catch (error) {
    console.error("❌ Server error while deleting the blog:", error);
    return res.status(500).json({ message: "Server error", error });
  }
};

  export const UpdateBlog = async (req, res) => {
    try {
      const { id } = req.params;
  
  
      // Find the blog first
      let blog = await Blog.findById(id);
      if (!blog) {
        return res.status(404).json({ message: "Blog not found" });
      }
  
      // Check if the logged-in user is the owner of the blog
      if (blog.user.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: "Unauthorized to update this blog" });
      }
  
      // Create an update object dynamically
      const updateData = {};
  
      if (req.body.title) updateData.title = req.body.title;
      if (req.body.category) {
        updateData.category = Array.isArray(req.body.category)
          ? req.body.category
          : req.body.category.split(",");
      }
      if (req.body.description) updateData.description = req.body.description;
  
      // Handle image update (if provided)
      if (req.file) {
        updateData.image = req.file.path; // Cloudinary/Multer image path
      }
  
      // Update the blog
      blog = await Blog.findByIdAndUpdate(id, { $set: updateData }, { new: true, runValidators: true });
  
      return res.status(200).json({ message: "Blog updated successfully", blog });
  
    } catch (error) {
      console.error("❌ Server error while updating the blog:", error);
      return res.status(500).json({ message: "Server error", error });
    }
  };
  

  export const getAllBlog = async (req, res) => {
    try {
      const blogs = await Blog.find().populate("user", "username email image");
  
      if (blogs.length === 0) {
        return res.status(200).json({ message: "No blogs available" });
      }
  
      return res.status(200).json({ message: "Blogs fetched successfully", blogs });
  
    } catch (error) {
      console.error("❌ Server error while fetching blogs:", error);
      return res.status(500).json({ message: "Server error", error });
    }
  };
  

  export const getMyblog = async (req, res) => {
    try {
      const user = await User.findById(req.user._id).populate("blogs");
  
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
  
      if (user.blogs.length === 0) {
        return res.status(200).json({ message: `${user.username} has not written any blogs` });
      }
  
      return res.status(200).json({ message: "Blogs fetched successfully", blogs: user.blogs });
  
    } catch (error) {
      console.error("❌ Server error while fetching my blogs:", error);
      return res.status(500).json({ message: "Server error", error });
    }
  };
  
  
  export const singleBlog = async (req, res) => {
    try {
      const { id } = req.params;
  
      // Fetch blog with author details
      const blog = await Blog.findById(id).populate("user", "username email image");
  
      if (!blog) {
        return res.status(404).json({ message: "Blog not found" });
      }
  
      return res.status(200).json({ message: "Blog fetched successfully", blog });
  
    } catch (error) {
      console.error("❌ Server error while fetching blog:", error);
      return res.status(500).json({ message: "Server error", error });
    }
  };
  
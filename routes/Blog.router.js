import express from "express";
import {
  CreateBlog,
  DeleteBlog,
  getAllBlog,
  getMyblog,
  UpdateBlog,
  singleBlog,
} from "../controllers/Blog.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { upload, handleUploadErrors } from "../middleware/multer.js";
const blogRouter = express.Router();

blogRouter.post(
  "/createblog",
  authMiddleware,
  upload.single("image"),
  handleUploadErrors,
  CreateBlog
); 
blogRouter.delete("/deleteblog/:id", authMiddleware, DeleteBlog);
blogRouter.put(
  "/updateblog/:id",
  authMiddleware,
  upload.single("image"),
  handleUploadErrors,
  UpdateBlog
);
blogRouter.get("/getallblog", getAllBlog);
blogRouter.get("/getmyblog", authMiddleware, getMyblog);
blogRouter.get("/singleblog/:id", singleBlog);

export default blogRouter;

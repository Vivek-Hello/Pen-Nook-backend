import mongoose from "mongoose";

const BlogSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: { 
        type: String,
        required: true,
    },
    image: {
        type: String,
        required: true,
    },
    category: { 
        type: Array,
    },
    user: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", 
        required: true, 
    },
}, { timestamps: true });

export const Blog = mongoose.model("Blog", BlogSchema);

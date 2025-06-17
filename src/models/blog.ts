import mongoose, { Schema } from "mongoose";

import { IBlog } from "../typs/blog.interface";
import { ref } from "process";
import { timeStamp } from "console";

const BlogSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    author: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    numberLikes: { type: Number, default: 0 },
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
  },
  { timestamps: true }
);

const Blog = mongoose.model<IBlog>("Blog", BlogSchema);
export default Blog;

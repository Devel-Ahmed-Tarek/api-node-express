import mongoose, { Document } from "mongoose";

export interface IBlog extends Document {
  title: string;
  content: string;
  author: string;
  createdAt: Date;
  numberLikes: number;
  category: mongoose.Types.ObjectId;
}

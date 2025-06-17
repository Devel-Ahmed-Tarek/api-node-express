// models/Category.ts
import mongoose, { Schema, Document } from "mongoose";

export interface ICategory extends Document {
  name: string;
}

const CategorySchema: Schema = new Schema(
  {
    name: { type: String, required: true },
  },
  { timestamps: true }
);

const Category = mongoose.model<ICategory>("Category", CategorySchema);
export default Category;

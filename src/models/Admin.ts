import mongoose from "mongoose";

const adminSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model("Admin", adminSchema);

export interface IAdmin extends mongoose.Document {
  name: string;
  email: string;
  password: string;
  createdAt?: Date;
  updatedAt?: Date;
}

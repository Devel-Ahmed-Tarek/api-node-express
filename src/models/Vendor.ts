import mongoose from "mongoose";

const vendorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model("Vendor", vendorSchema);

export interface IVendor extends mongoose.Document {
  name: string;
  email: string;
  password: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// models/Product.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IProduct extends Document {
  name: any;
  description: any;
  price: number;
  image?: string;
  getTranslatableAttributes(): string[];
  setTranslation(field: string, locale: string, value: string): void;
}

const ProductSchema: Schema = new Schema({
  name: { type: Object, default: {} },
  description: { type: Object, default: {} },
  price: { type: Number, required: true },
  image: { type: String },
});

const translatableFields = ["name", "description"];

ProductSchema.methods.getTranslatableAttributes = function (): string[] {
  return translatableFields;
};

ProductSchema.methods.setTranslation = function (
  field: string,
  locale: string,
  value: string
): void {
  if (!this[field]) this[field] = {};
  this[field][locale] = value;
};

const Product = mongoose.model<IProduct>("Product", ProductSchema);
export default Product;

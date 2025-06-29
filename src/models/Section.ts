import mongoose, { Document, Schema } from "mongoose";

interface FieldDefinition {
  key: string;
  type: "text" | "image" | "multiImage" | "number" | "group" | "repeater";
  translatable: boolean;
  required: boolean;
  children?: FieldDefinition[];
}

export interface ISection extends Document {
  name: string;
  fields: FieldDefinition[];
  data: Record<string, any>;
  createdAt?: Date;
  updatedAt?: Date;
}

const FieldSchema = new Schema<FieldDefinition>(
  {
    key: { type: String, required: true },
    type: {
      type: String,
      enum: ["text", "image", "multiImage", "number", "group", "repeater"],
      required: true,
    },
    translatable: { type: Boolean, default: false },
    required: { type: Boolean, default: false },
  },
  { _id: false }
);

FieldSchema.add({
  children: [FieldSchema],
});

const SectionSchema = new Schema<ISection>(
  {
    name: { type: String, required: true, unique: true },
    fields: [FieldSchema],
    data: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

const Section = mongoose.model<ISection>("section", SectionSchema);
export default Section;

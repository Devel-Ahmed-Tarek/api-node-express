import { Request, Response } from "express";
import Section from "../models/Section";
import { sendResponse } from "../helpers/function";
import { uploadFile, formatSectionData } from "../helpers/function";
import { UploadedFile } from "express-fileupload";
import { AppConfig } from "../config";

export const createSection = async (req: Request, res: Response) => {
  try {
    const { name, fields } = req.body;

    if (!name || !fields || !Array.isArray(fields)) {
      return sendResponse(res, 400, "Name and fields are required");
    }

    const validTypes = ["text", "image", "multiImage", "number"];

    for (const field of fields) {
      const { key, type, translatable, required } = field;

      if (!key || !type) {
        return sendResponse(res, 400, "Each field must have key and type");
      }

      if (!validTypes.includes(type)) {
        return sendResponse(res, 400, `Invalid field type: ${type}`);
      }

      if (typeof translatable !== "boolean" || typeof required !== "boolean") {
        return sendResponse(
          res,
          400,
          "translatable and required must be boolean"
        );
      }
    }

    //Search for existing section by name
    let section = await Section.findOne({ name });

    if (section) {
      const existingKeys = section.fields.map((f: any) => f.key);

      //Validate new fields against existing ones
      const newFields = fields.filter(
        (field: any) => !existingKeys.includes(field.key)
      );

      if (newFields.length === 0) {
        return sendResponse(res, 200, "No new fields to add", section);
      }

      //merge new fields with existing ones
      section.fields = [...section.fields, ...newFields];
      await section.save();

      return sendResponse(res, 200, "New fields added to section", section);
    } else {
      //Create new section
      section = await Section.create({ name, fields });
      return sendResponse(res, 201, "Section created successfully", section);
    }
  } catch (err: any) {
    console.error("Error creating section:", err);
    return sendResponse(res, 500, "Failed to create section", {
      error: err.message,
    });
  }
};

export const addSectionData = async (req: Request, res: Response) => {
  try {
    const { sectionName } = req.params;
    const body = req.body;

    const section = await Section.findOne({ name: sectionName });
    if (!section) {
      return sendResponse(res, 404, "Section not found");
    }

    const existingData: any = section.data || {};
    const updatedData: any = { ...existingData }; // Start with existing data

    for (const field of section.fields) {
      const { key, type, translatable } = field;

      if (translatable) {
        if (!updatedData[key]) updatedData[key] = {};

        for (const lang of AppConfig.SUPPORTED_LANGUAGES) {
          const fieldKey = `${key}[${lang}]`;
          if (body[fieldKey]) {
            updatedData[key][lang] = body[fieldKey];
          }
        }
      } else if (type === "image") {
        if (req.files && req.files[key]) {
          const uploadedImage = req.files[key] as UploadedFile;
          const imagePath = await uploadFile("sections", uploadedImage);
          updatedData[key] = imagePath;
        } else if (body[key]) {
          updatedData[key] = body[key];
        }
      } else if (type === "multiImage") {
        if (req.files && req.files[key]) {
          const files = Array.isArray(req.files[key])
            ? req.files[key]
            : [req.files[key]];
          const paths = await Promise.all(
            files.map((file) => uploadFile("sections", file))
          );
          updatedData[key] = paths;
        } else if (body[key]) {
          updatedData[key] = body[key];
        }
      } else {
        if (body[key]) {
          updatedData[key] = body[key];
        }
      }
    }

    section.data = updatedData;
    await section.save();

    return sendResponse(res, 200, "Section data updated successfully", section);
  } catch (err: any) {
    console.error("Error updating section:", err);
    return sendResponse(res, 500, "Failed to update section", {
      error: err.message,
    });
  }
};

export const getSectionByName = async (req: Request, res: Response) => {
  try {
    const { sectionName } = req.params;

    const section = await Section.findOne({ name: sectionName });

    if (!section) {
      return sendResponse(res, 404, "Section not found");
    }

    const formatted = formatSectionData(section, req);

    return sendResponse(res, 200, "Section data fetched successfully", {
      name: section.name,
      data: formatted,
    });
  } catch (err: any) {
    console.error("Error fetching section:", err);
    return sendResponse(res, 500, "Server error", { error: err });
  }
};

export const updateSectionData = async (req: Request, res: Response) => {
  try {
    const { sectionName } = req.params;
    const body = req.body;

    const section = await Section.findOne({ name: sectionName });
    if (!section) return sendResponse(res, 404, "Section not found");

    const schema = section.fields;
    const existingData = section.data || {};

    for (const fieldConfig of schema) {
      const key = fieldConfig.key;
      const type = fieldConfig.type;
      const isTranslatable = fieldConfig.translatable;

      // Check if the key exists in the request body or files
      const hasValue =
        body.hasOwnProperty(key) || (req.files && req.files[key]);

      if (!hasValue) continue;

      // Translatable field
      if (isTranslatable) {
        if (!existingData[key]) existingData[key] = {};

        const inputTranslations = body[key];
        for (const locale in inputTranslations) {
          if (!AppConfig.SUPPORTED_LANGUAGES.includes(locale)) continue;

          existingData[key][locale] = inputTranslations[locale];
        }
      }

      // Single image
      else if (type === "image" && req.files?.[key]) {
        const uploaded = req.files[key];
        const imagePath = await uploadFile("sections", uploaded);
        existingData[key] = imagePath;
      }

      // Multiple images
      else if (type === "multiImage" && req.files?.[key]) {
        const uploaded = req.files[key];
        const images = Array.isArray(uploaded) ? uploaded : [uploaded];
        const paths = [];

        for (const img of images) {
          const imgPath = await uploadFile("sections", img);
          paths.push(imgPath);
        }

        existingData[key] = paths;
      }

      // Text or number or other direct fields
      else {
        existingData[key] = body[key];
      }
    }

    // Update the section with the new data
    await Section.updateOne(
      { _id: section._id },
      { $set: { data: existingData, updatedAt: new Date() } }
    );

    const updatedSection = await Section.findById(section._id);

    return sendResponse(
      res,
      200,
      "Section data updated successfully",
      updatedSection
    );
  } catch (err: any) {
    console.error("Update error:", err);
    return sendResponse(res, 500, "Server error", { error: err.message });
  }
};

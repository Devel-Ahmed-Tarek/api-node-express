// controllers/SectionController.ts
import { Request, Response } from "express";
import Section from "../models/Section";
import { sendResponse, uploadFile } from "../helpers/function";
import { formatSectionData } from "../helpers/DynamicSectionFormatter";
import { UploadedFile } from "express-fileupload";
import { AppConfig } from "../config";
import { v4 as uuidv4 } from "uuid";

// 🧠 Recursive Data Store Handler
const storeSectionData = async (
  body: any,
  files: any,
  fields: any[]
): Promise<any> => {
  const data: Record<string, any> = {};

  for (const field of fields) {
    const { key, type, translatable, children } = field;

    if (type === "group") {
      data[key] = await storeSectionData(
        body?.[key] || {},
        files?.[key] || {},
        children
      );
    } else if (type === "repeater") {
      const items = body?.[key] || [];
      data[key] = await Promise.all(
        items.map(async (item: any, i: number) => {
          const itemFiles = files?.[key]?.[i] || {};
          const childData = await storeSectionData(item, itemFiles, children);
          return { id: uuidv4(), ...childData };
        })
      );
    } else if (translatable) {
      const fieldData: Record<string, string> = {};
      for (const lang of AppConfig.SUPPORTED_LANGUAGES) {
        const transKey = `${key}[${lang}]`;
        if (body?.[key]?.[lang]) fieldData[lang] = body[key][lang];
        else if (body?.[transKey]) fieldData[lang] = body[transKey];
      }
      data[key] = fieldData;
    } else if (type === "image") {
      if (files?.[key]) {
        const file = files[key] as UploadedFile;
        data[key] = await uploadFile("sections", file);
      } else if (body?.[key]) {
        data[key] = body[key];
      }
    } else if (type === "multiImage") {
      if (files?.[key]) {
        const allFiles = Array.isArray(files[key]) ? files[key] : [files[key]];
        const paths = await Promise.all(
          allFiles.map((file: UploadedFile) => uploadFile("sections", file))
        );
        data[key] = paths;
      } else if (body?.[key]) {
        data[key] = body[key];
      }
    } else {
      if (body?.[key] !== undefined) {
        data[key] = body[key];
      }
    }
  }

  return data;
};

export const createSection = async (req: Request, res: Response) => {
  try {
    const { name, fields } = req.body;

    if (!name || !fields || !Array.isArray(fields)) {
      return sendResponse(res, 400, "Name and fields are required");
    }

    const validTypes = [
      "text",
      "image",
      "multiImage",
      "number",
      "group",
      "repeater",
    ];

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

    let section = await Section.findOne({ name });

    if (section) {
      const existingKeys = section.fields.map((f: any) => f.key);
      const newFields = fields.filter(
        (field: any) => !existingKeys.includes(field.key)
      );

      if (newFields.length === 0) {
        return sendResponse(res, 200, "No new fields to add", section);
      }

      section.fields = [...section.fields, ...newFields];
      await section.save();
      return sendResponse(res, 200, "New fields added to section", section);
    } else {
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
    const section = await Section.findOne({ name: sectionName });
    if (!section) return sendResponse(res, 404, "Section not found");

    const newData = await storeSectionData(req.body, req.files, section.fields);

    section.data = {
      ...(section.data || {}),
      ...newData,
    };

    await section.save();

    return sendResponse(res, 200, "Section data updated successfully", section);
  } catch (err: any) {
    console.error("Error adding section data:", err);
    return sendResponse(res, 500, "Failed to update section", {
      error: err.message,
    });
  }
};

export const getSectionByName = async (req: Request, res: Response) => {
  try {
    const { sectionName } = req.params;
    const section = await Section.findOne({ name: sectionName });
    if (!section) return sendResponse(res, 404, "Section not found");

    const formatted = formatSectionData(section, req);
    return sendResponse(res, 200, "Section data fetched successfully", {
      name: section.name,
      data: formatted,
    });
  } catch (err: any) {
    console.error("Error fetching section:", err);
    return sendResponse(res, 500, "Server error", { error: err.message });
  }
};

export const updateSectionData = async (req: Request, res: Response) => {
  try {
    const { sectionName } = req.params;
    const section = await Section.findOne({ name: sectionName });
    if (!section) return sendResponse(res, 404, "Section not found");

    const updatedData = await storeSectionData(
      req.body,
      req.files,
      section.fields
    );

    const merged = {
      ...(section.data || {}),
      ...updatedData,
    };

    await Section.updateOne(
      { _id: section._id },
      { $set: { data: merged, updatedAt: new Date() } }
    );

    const final = await Section.findById(section._id);
    return sendResponse(res, 200, "Section data updated successfully", final);
  } catch (err: any) {
    console.error("Update error:", err);
    return sendResponse(res, 500, "Server error", { error: err.message });
  }
};

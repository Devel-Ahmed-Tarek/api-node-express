// controllers/SectionController.ts
import { Request, Response } from "express";
import Section from "../models/Section";
import { sendResponse, uploadFile } from "../helpers/function";
import { formatSectionData } from "../helpers/DynamicSectionFormatter";
import { UploadedFile } from "express-fileupload";
import { AppConfig } from "../config";
import { v4 as uuidv4 } from "uuid";
import _ from "lodash";
import qs from "qs";

export const storeSectionData = async (
  body: any,
  files: any,
  fields: any[]
): Promise<any> => {
  const data: Record<string, any> = {};

  for (const field of fields) {
    const { key, type, translatable, children } = field;

    if (type === "group") {
      const filteredBody = Object.keys(body)
        .filter((k) => k.startsWith(`${key}[`))
        .reduce((acc: any, k) => {
          acc[k] = body[k];
          return acc;
        }, {});

      const filteredFiles = Object.keys(files || {})
        .filter((k) => k.startsWith(`${key}[`))
        .reduce((acc: any, k) => {
          acc[k] = files[k];
          return acc;
        }, {});

      const parsedBody = qs.parse(filteredBody);
      const parsedFiles = qs.parse(filteredFiles);

      // ✅ هذا السطر يحل مشكلة ضياع الحقول الداخلية مثل cta
      data[key] = await storeSectionData(
        parsedBody?.[key] ?? parsedBody ?? {},
        parsedFiles?.[key] ?? parsedFiles ?? {},
        children
      );
    } else if (type === "repeater") {
      const flatItems: Record<number, any> = {};
      const flatFiles: Record<number, any> = {};

      for (const bKey in body) {
        const match = bKey.match(new RegExp(`^${key}\\[(\\d+)\\]`));
        if (match) {
          const index = parseInt(match[1]);
          const rest = bKey.slice(match[0].length + 1, bKey.length - 1);
          const path = rest.replace(/\]/g, "").split("[");
          flatItems[index] = flatItems[index] || {};
          let current = flatItems[index];
          for (let i = 0; i < path.length - 1; i++) {
            current[path[i]] = current[path[i]] || {};
            current = current[path[i]];
          }
          current[path[path.length - 1]] = body[bKey];
        }
      }

      for (const fKey in files) {
        const match = fKey.match(new RegExp(`^${key}\\[(\\d+)\\]`));
        if (match) {
          const index = parseInt(match[1]);
          const rest = fKey.slice(match[0].length + 1, fKey.length - 1);
          const path = rest.replace(/\]/g, "").split("[");
          flatFiles[index] = flatFiles[index] || {};
          let current = flatFiles[index];
          for (let i = 0; i < path.length - 1; i++) {
            current[path[i]] = current[path[i]] || {};
            current = current[path[i]];
          }
          current[path[path.length - 1]] = files[fKey];
        }
      }

      const result: any[] = [];
      const indexes = Object.keys(flatItems).map((i) => parseInt(i));
      for (const i of indexes) {
        const itemBody = flatItems[i];
        const itemFiles = flatFiles[i] || {};
        const childData = await storeSectionData(itemBody, itemFiles, children);
        result.push({ id: uuidv4(), ...childData });
      }

      data[key] = result;
    } else if (translatable) {
      const fieldData: Record<string, string> = {};
      for (const lang of AppConfig.SUPPORTED_LANGUAGES) {
        const transKey = `${key}[${lang}]`;
        if (body?.[key]?.[lang]) {
          fieldData[lang] = body[key][lang];
        } else if (body?.[transKey]) {
          fieldData[lang] = body[transKey];
        }
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

    // ✅validate fields structure (recursive)
    const validateFields = (fields: any[]): boolean => {
      for (const field of fields) {
        const { key, type, translatable, required, children } = field;

        if (!key || !type) return false;
        if (!validTypes.includes(type)) return false;
        if (typeof translatable !== "boolean" || typeof required !== "boolean")
          return false;

        // check children if type is group or repeater
        if (
          (type === "group" || type === "repeater") &&
          Array.isArray(children)
        ) {
          const isValid = validateFields(children);
          if (!isValid) return false;
        }
      }
      return true;
    };

    if (!validateFields(fields)) {
      return sendResponse(res, 400, "Invalid field structure detected");
    }

    // Search for existing section
    let section = await Section.findOne({ name });

    if (section) {
      // في حالة التحديث نضيف فقط الحقول الجديدة بناءً على الـ key
      const existingKeys = section.fields.map((f: any) => f.key);

      const newFields = fields.filter(
        (f: any) => !existingKeys.includes(f.key)
      );

      if (newFields.length === 0) {
        return sendResponse(res, 200, "No new fields to add", section);
      }

      section.fields = [...section.fields, ...newFields];
      await section.save();
      return sendResponse(res, 200, "New fields added to section", section);
    } else {
      // ✅ إنشاء سكشن جديد
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

// Update section data
export const updateSectionData = async (req: Request, res: Response) => {
  try {
    const { sectionName } = req.params;

    // 🔍 Find the section by name
    const section = await Section.findOne({ name: sectionName });
    if (!section) {
      return sendResponse(res, 404, "Section not found");
    }

    // 🛠️ Prepare updated data by recursively processing input body and files
    const updatedData = await storeSectionData(
      req.body,
      req.files,
      section.fields
    );

    // 🔁 Deep merge the updated data with existing section data
    const merged = _.merge({}, section.data || {}, updatedData);

    // 💾 Update the section document in the database
    await Section.updateOne(
      { _id: section._id },
      { $set: { data: merged, updatedAt: new Date() } }
    );

    // ✅ Fetch the updated section and return it
    const final = await Section.findById(section._id);
    return sendResponse(res, 200, "Section data updated successfully", final);
  } catch (err: any) {
    console.error("Update error:", err);
    return sendResponse(res, 500, "Server error", { error: err.message });
  }
};

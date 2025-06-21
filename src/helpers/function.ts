// helpers/Helper.ts

import fs from "fs";
import path from "path";
import { Response } from "express";
import { UploadedFile } from "express-fileupload";
// helpers/sectionHelper.ts
import { Request } from "express";
import { AppConfig } from "../config";
import Validator from "validatorjs";

// ===== 1. sendResponse =====
export const sendResponse = <T>(
  res: Response,
  statusCode: number = 200,
  msg: string | null = null,
  data: T = {} as T
) => {
  return res.status(statusCode).json({
    status: statusCode,
    msg,
    data,
  });
};

interface TranslatableModel {
  getTranslatableAttributes(): string[];
  setTranslation(field: string, locale: string, value: string): void;
  [key: string]: any;
}

export const updateTranslatedFields = (
  model: TranslatableModel,
  validated: { [key: string]: any }
): void => {
  const fields = model.getTranslatableAttributes();

  fields.forEach((field) => {
    if (field in validated && typeof validated[field] === "object") {
      const translations = validated[field];
      for (const locale in translations) {
        model.setTranslation(field, locale, translations[locale]);
      }
    }
  });
};

// ===== 4. uploadFile =====
export const uploadFile = (folder: string, file: UploadedFile): string => {
  const extension = path.extname(file.name).toLowerCase();
  const name = `${Date.now()}_${Math.floor(Math.random() * 1000)}${extension}`;
  const uploadPath = path.join(__dirname, "..", "uploads", folder);

  if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
  }

  const fullPath = path.join(uploadPath, name);
  file.mv(fullPath, (err) => {
    if (err) {
      console.error("Error moving file:", err);
      throw err;
    }
  });

  return `uploads/${folder}/${name}`;
};

export const formatSectionData = (
  section: any,
  req: Request
): Record<string, any> => {
  const lang = (req.query.lang as string) || "en";
  const baseUrl = `${req.protocol}://${req.get("host")}`;
  const schema = section.fields; // fields is array not object
  const rawData = section.data;

  const formatted: Record<string, any> = {};

  schema.forEach((field: any) => {
    const key = field.key;
    const config = field;
    const value = rawData[key];

    // multi-language support
    if (config.translatable && typeof value === "object") {
      formatted[key] =
        value[lang] ?? value[AppConfig.SUPPORTED_LANGUAGES[0]] ?? "";
    }

    // single image
    else if (config.type === "image" && typeof value === "string") {
      formatted[key] = `${baseUrl}/${value}`;
    }

    // multiple images
    else if (config.type === "multiImage" && Array.isArray(value)) {
      formatted[key] = value.map((img) => `${baseUrl}/${img}`);
    }

    // normal text data
    else {
      formatted[key] = value;
    }
  });

  return formatted;
};

export const validated = (
  data: Record<string, any>,
  rules: Record<string, any>,
  messages: Record<string, string> = {}
) => {
  const validatoiin = new Validator(data, rules, messages);
  return {
    passes: validatoiin.passes(),
    fails: validatoiin.fails(),
    errors: validatoiin.errors.all(),
  };
};

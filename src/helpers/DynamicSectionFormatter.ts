import { Request } from "express";
import { AppConfig } from "../config";

// ترجمة ديناميكية لأي تعشيش
export function applyTranslations(
  value: any,
  lang: string,
  supportedLangs: string[]
): any {
  if (Array.isArray(value)) {
    return value.map((item) => applyTranslations(item, lang, supportedLangs));
  }

  if (typeof value === "object" && value !== null) {
    const keys = Object.keys(value);
    const isLangMap =
      supportedLangs.some((l) => keys.includes(l)) &&
      keys.every((k) => supportedLangs.includes(k));

    if (isLangMap) {
      return value[lang] ?? value[supportedLangs[0]] ?? "";
    }

    const result: any = {};
    for (const key in value) {
      result[key] = applyTranslations(value[key], lang, supportedLangs);
    }
    return result;
  }

  return value;
}

// تحويل الصور لرابط كامل
export function applyImageUrls(value: any, baseUrl: string): any {
  if (Array.isArray(value)) {
    return value.map((item) => applyImageUrls(item, baseUrl));
  }

  if (typeof value === "object" && value !== null) {
    const result: any = {};
    for (const key in value) {
      if (typeof value[key] === "string" && value[key].startsWith("uploads/")) {
        result[key] = `${baseUrl}/${value[key]}`;
      } else {
        result[key] = applyImageUrls(value[key], baseUrl);
      }
    }
    return result;
  }

  return value;
}

// دمج الترجمة وتحويل الصور
export function formatSectionData(
  section: any,
  req: Request
): Record<string, any> {
  const lang = (req.query.lang as string) || "en";
  const baseUrl = `${req.protocol}://${req.get("host")}`;
  const supported = AppConfig.SUPPORTED_LANGUAGES;
  const rawData = section.data;

  const translated = applyTranslations(rawData, lang, supported);
  const withImageUrls = applyImageUrls(translated, baseUrl);

  return withImageUrls;
}

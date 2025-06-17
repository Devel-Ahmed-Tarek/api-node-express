import { Router } from "express";
import * as SectionController from "../controllers/SectionController";

const router = Router();

router.post("/", SectionController.createSection);
router.put("/:sectionName", SectionController.addSectionData);
router.post("/:sectionName", SectionController.updateSectionData);
router.get("/:sectionName", SectionController.getSectionByName);

export default router;

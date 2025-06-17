import express from "express";
import * as authController from "../controllers/authController";
import { authGuard } from "../middleware/authGuard";

const router = express.Router();

router.post("/login", authController.login);
router.get("/profile", authGuard, authController.getProfileuser);


export default router;

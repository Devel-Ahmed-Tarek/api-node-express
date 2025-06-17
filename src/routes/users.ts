import { Router } from "express";
import * as UserController from "../controllers/UserController";
import { authGuard } from "../middleware/authGuard";

const router = Router();

router.post("/", UserController.createUser);
router.get("/", UserController.getusers);

export default router;

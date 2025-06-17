import { Router } from "express";
import * as blogController from "../controllers/BlogsController";

const router = Router();

router.post("/", blogController.createBlog);
router.get("/", blogController.getBlogs);
router.put("/:id", blogController.likeBlog);
router.delete("/:id", blogController.deleteBlog);

export default router;

import { Router } from "express";
import blogRoutes from "./blogs";
import productRoutes from "./products";
import sectionRoutes from "./sections";
import userRoutes from "./users";
import authRoutes from "./auth";

const router = Router();
// Define the API routes
// Example middleware
router.use((req, res, next) => {
  console.log(`[API] ${req.method} ${req.originalUrl}`);
  next();
});

router.use("/blogs", blogRoutes);
router.use("/products", productRoutes);
router.use("/sections", sectionRoutes);
router.use("/users", userRoutes);
router.use("/auth", authRoutes);

export default router;

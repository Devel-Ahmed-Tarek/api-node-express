import { Router } from "express";
import * as productController from "../controllers/ProductController";

const router = Router();
router.post("/", productController.createProduct);
router.get("/", productController.getProducts);

export default router;

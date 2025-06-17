import { Request, Response } from "express";
import Product from "../models/product";
import { IProduct } from "../typs/product.interface";
import Pagination from "../helpers/pagination";
import {
  sendResponse,
  uploadFile,
  updateTranslatedFields,
} from "../helpers/function";
import { UploadedFile } from "express-fileupload";

export const createProduct = async (req: Request, res: Response) => {
  try {
    if (!req.body.name || !req.body.description) {
      return sendResponse(res, 400, "Name and description are required");
    }
    const price: number = req.body.price;
    let imagePath: string = "";

    if (req.files && req.files.image) {
      const uploadedImage = req.files.image as UploadedFile;

      if (!uploadedImage.mimetype.startsWith("image/")) {
        return sendResponse(res, 400, "Invalid file type. Only images allowed");
      }

      imagePath = await uploadFile("products", uploadedImage);
    }

    const product = new Product({
      price,
      image: imagePath,
    });

    updateTranslatedFields(product, req.body);

    await product.save();
    return sendResponse(res, 201, "Product created successfully", product);
  } catch (err: any) {
    console.error("Error creating product:", err);
    return sendResponse(res, 500, "Failed to create product", {
      error: err.message,
    });
  }
};

export const getProducts = async (req: Request, res: Response) => {
  try {
    const page: number = parseInt(req.query.page as string) || 1;
    const limit: number = parseInt(req.query.limit as string) || 10;

    const result = await Pagination(Product, {}, page, limit);
    const products: IProduct[] = result.data.map((product) => {
      const baseUrl: string = `${req.protocol}://${req.get("host")}`;

      const formatted: any = {
        id: product._id,
        name: product.name,
        description: product.description,
        price: product.price,
        // Assuming product.image is a string All URL or path
        image: product.image ? `${baseUrl}/${product.image}` : undefined,
      };
      return formatted;
    });

    return sendResponse(res, 200, "Products retrieved successfully", {
      products,
      currentPage: result.currentPage,
      totalPages: result.totalPages,
      totalItems: result.totalItems,
    });
  } catch (err: any) {
    console.error("Error retrieving products:", err);
    return sendResponse(res, 500, "Failed to retrieve products", {
      error: err.message,
    });
  }
};

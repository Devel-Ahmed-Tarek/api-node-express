import { Request, Response } from "express";
import User, { IUser } from "../models/User";
import { sendResponse } from "../helpers/function";
import Pagination from "../helpers/pagination";

export const createUser = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return sendResponse(res, 400, "Name, email, and password are required");
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return sendResponse(res, 400, "User with this email already exists");
    }

    // Create new user
    const user = new User({
      name,
      email,
      password,
    });

    await user.save();
    return sendResponse(res, 201, "User created successfully", user);
  } catch (err: any) {
    console.error("Error creating user:", err);
    return sendResponse(res, 500, "Failed to create user", {
      error: err.message,
    });
  }
};

export const getusers = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;
    const pageNumber = parseInt(page as string);
    const limitNumber = parseInt(limit as string);
    const searchQuery: any = {};
    if (search && typeof search === "string") {
      searchQuery.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }
    const result = await Pagination(
      User,
      searchQuery,
      pageNumber,
      limitNumber,
      "-password"
    );
    if (!result.data.length) {
      return sendResponse(res, 404, "No users found");
    }

    return sendResponse(res, 200, "Users fetched successfully", result);
  } catch (err: any) {
    console.error("Error fetching users:", err);
    return sendResponse(res, 500, "Failed to fetch users", {
      error: err.message,
    });
  }
};

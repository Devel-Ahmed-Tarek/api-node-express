import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User";
import Admin from "../models/Admin";
import Vendor from "../models/Vendor";
import { sendResponse } from "../helpers/function";

const GUARD_MODELS: Record<string, any> = {
  user: User,
  admin: Admin,
  vendor: Vendor,
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password, guard } = req.body;

    // Validate required fields
    if (!email || !password || !guard) {
      return sendResponse(res, 400, "Email, password, and guard are required.");
    }

    // Check guard model exists
    const Model = GUARD_MODELS[guard];
    if (!Model) {
      return sendResponse(res, 400, "Invalid guard type.");
    }

    // Find user by email
    const user = await Model.findOne({ email });
    if (!user) {
      return sendResponse(res, 401, "Invalid credentials.");
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return sendResponse(res, 401, "Invalid credentials.");
    }

    // Create JWT
    const token = jwt.sign(
      { id: user._id, role: guard },
      process.env.JWT_SECRET || "secret",
      { expiresIn: "7d" }
    );

    // Hide password before sending response
    const userData = user.toObject();
    delete userData.password;

    return sendResponse(res, 200, "Login successful", {
      token,
      user: userData,
    });
  } catch (err: any) {
    console.error("Login error:", err);
    return sendResponse(res, 500, "Server error", { error: err.message });
  }
};

export const getProfileuser = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return sendResponse(res, 404, "User not found");
    }
    return sendResponse(res, 200, "User profile fetched successfully", user);
  } catch (err: any) {
    console.error("Error fetching user profile:", err);
    return sendResponse(res, 500, "Failed to fetch user profile", {
      error: err.message,
    });
  }
};

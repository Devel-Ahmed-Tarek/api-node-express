// middleware/authGuard.ts
import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import User from "../models/User";
import Admin from "../models/Admin";
import Vendor from "../models/Vendor";

const GUARD_MODELS: any = {
  user: User,
  admin: Admin,
  vendor: Vendor,
};

interface AuthRequest extends Request {
  user?: any;
}

export const authGuard = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ message: "Unauthorized: No token provided" });
    }

    const token = authHeader.split(" ")[1];
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET || "secret");

    const { id, role } = decoded;

    const Model = GUARD_MODELS[role];
    if (!Model) {
      return res.status(400).json({ message: "Invalid guard/role" });
    }

    const user = await Model.findById(id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    req.user = user;
    req.headers["guard"] = role;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized", error });
  }
};

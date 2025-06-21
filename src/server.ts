import express, { Application } from "express";
import mongoose from "mongoose";
import path from "path";
import routes from "./routes/api"; // routes/index.ts
import fileUpload from "express-fileupload";
import dotenv from "dotenv";
import Validator from "validatorjs";

dotenv.config();

mongoose
  .connect(process.env.MONGO_URL || "")
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB Error:", err));

const app: Application = express();
app.use(fileUpload());
app.use(express.json());
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api", routes);
app.use((req, res, next) => {
  next();
});

app.listen(process.env.PORT || 1000, () => {
  console.log(`Server is running on port ${process.env.PORT || 1000}`);
});

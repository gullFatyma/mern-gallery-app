import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";
import imageRoutes from "./routes/imageRoutes.js";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
app.use(cors());
app.use(express.json());

// Serve the uploads folder publicly, so every saved file has its own URL:
//   /uploads/1710240000000-beach.jpg  ->  http://localhost:5000/uploads/1710240000000-beach.jpg
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/images", imageRoutes);

const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => console.error("DB connection error:", err.message));

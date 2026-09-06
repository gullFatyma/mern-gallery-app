import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import Image from "../models/Image.js";
import upload from "../middleware/upload.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadDir = path.join(__dirname, "..", "uploads");

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Accept tags as either a comma-separated string ("a, b") or an array (["a","b"]),
// normalizing to at most 5 trimmed, lowercased, non-empty tags.
function normalizeTags(value) {
  const input = Array.isArray(value) ? value : String(value || "").split(",");
  return input.map((t) => String(t).trim().toLowerCase()).filter(Boolean).slice(0, 5);
}

const router = express.Router();

// POST /api/images  -> receive file + metadata, save on disk, store URL in MongoDB
router.post("/", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No image file received" });

    const title = (req.body.title || "").trim();
    if (!title) return res.status(400).json({ message: "Title is required" });

    const description = (req.body.description || "").trim().slice(0, 240);

    const tags = normalizeTags(req.body.tags);

    const base = process.env.BASE_URL || `${req.protocol}://${req.get("host")}`;
    const imageUrl = `${base}/uploads/${req.file.filename}`;

    const image = await Image.create({ imageUrl, title, description, tags });
    res.status(201).json(image);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/images  -> all images with search, favorite filter, and sorting
router.get("/", async (req, res) => {
  try {
    const { search, favorite, sort } = req.query;
    const filter = {};

    if (favorite === "true") {
      filter.isFavorite = true;
    }

    if (search) {
      const safe = escapeRegex(search);
      const regex = new RegExp(safe, "i");
      filter.$or = [
        { title: regex },
        { description: regex },
        { tags: { $in: [regex] } },
      ];
    }

    const sortOption = sort === "oldest" ? { createdAt: 1 } : { createdAt: -1 };

    const images = await Image.find(filter).sort(sortOption);
    res.json(images);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/images/:id  -> update metadata fields
router.patch("/:id", async (req, res) => {
  try {
    const { title, description, tags } = req.body;
    const update = {};
    if (title !== undefined) {
      const trimmed = title.trim();
      if (!trimmed) return res.status(400).json({ message: "Title is required" });
      update.title = trimmed;
    }
    if (description !== undefined) {
      update.description = description.trim().slice(0, 240);
    }
    if (tags !== undefined) {
      update.tags = normalizeTags(tags);
    }

    const image = await Image.findByIdAndUpdate(req.params.id, update, {
      new: true,
      runValidators: true,
    });

    if (!image) return res.status(404).json({ message: "Image not found" });
    res.json(image);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/images/:id/favorite  -> set favorite state
router.patch("/:id/favorite", async (req, res) => {
  try {
    const { isFavorite } = req.body;
    if (typeof isFavorite !== "boolean") {
      return res.status(400).json({ message: "isFavorite must be a boolean" });
    }

    const image = await Image.findByIdAndUpdate(
      req.params.id,
      { isFavorite },
      { new: true, runValidators: true },
    );

    if (!image) return res.status(404).json({ message: "Image not found" });
    res.json(image);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/images/:id  -> remove the record, and the file from disk
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Image.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: "Image not found" });

    const filename = deleted.imageUrl.split("/uploads/")[1];
    if (filename) fs.promises.unlink(path.join(uploadDir, filename)).catch(() => {});

    res.json({ message: "Deleted", id: req.params.id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;

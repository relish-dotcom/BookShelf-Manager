
import express from "express";
import mongoose from "mongoose";
import Book from "../models/Book.js";
import uploadMiddleware from "../middleware/uploadMiddleware.js";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { fileURLToPath } from "node:url";

const router = express.Router();

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const uploadsDir = path.resolve(currentDir, "../../uploads");

const validProgress = (value) =>
  typeof value === "number" &&
  Number.isFinite(value) &&
  value >= 0 &&
  value <= 100;

async function saveCover(file, req) {
  if (!file) return "";

  const extensions = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
  };

  const extension = extensions[file.mimetype];

  if (!extension) {
    throw new Error("Only JPG, PNG, and WebP images are allowed");
  }

  await mkdir(uploadsDir, { recursive: true });

  const filename = `${randomUUID()}${extension}`;

  await writeFile(path.join(uploadsDir, filename), file.buffer);

  return `${req.protocol}://${req.get("host")}/uploads/${filename}`;
}

// GET: Fetch all books
router.get("/", async (req, res) => {
  try {
    const books = await Book.find().sort({ createdAt: -1 });
    res.json(books);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch books" });
  }
});

// GET: Fetch one book
router.get("/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid book ID" });
    }

    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    res.json(book);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch book" });
  }
});

// POST: Add a book with an optional cover image
router.post("/", uploadMiddleware.single("coverImage"), async (req, res) => {
  try {
    const { bookName, authorName } = req.body;
    const readingProgress = Number(req.body.readingProgress ?? 0);

    if (
      typeof bookName !== "string" ||
      !bookName.trim() ||
      bookName.trim().length > 200 ||
      typeof authorName !== "string" ||
      !authorName.trim() ||
      authorName.trim().length > 150
    ) {
      return res.status(400).json({
        message: "Valid book name and author name are required",
      });
    }

    if (!validProgress(readingProgress)) {
      return res.status(400).json({
        message: "Reading progress must be between 0 and 100",
      });
    }

    const coverImage = req.file
      ? await saveCover(req.file, req)
      : (req.body.coverImage || "").trim();

    const book = await Book.create({
      bookName: bookName.trim(),
      authorName: authorName.trim(),
      bookType: req.body.bookType || "Other Book",
      coverImage,
      readingProgress,
    });

    res.status(201).json(book);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PUT: Update a book, including its optional cover
router.put(
  "/:id",
  uploadMiddleware.single("coverImage"),
  async (req, res) => {
    try {
      if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).json({ message: "Invalid book ID" });
      }

      const book = await Book.findById(req.params.id);

      if (!book) {
        return res.status(404).json({ message: "Book not found" });
      }

      const { bookName, authorName, bookType } = req.body;

      if (bookName !== undefined) {
        if (
          typeof bookName !== "string" ||
          !bookName.trim() ||
          bookName.trim().length > 200
        ) {
          return res.status(400).json({ message: "Invalid book name" });
        }
        book.bookName = bookName.trim();
      }

      if (authorName !== undefined) {
        if (
          typeof authorName !== "string" ||
          !authorName.trim() ||
          authorName.trim().length > 150
        ) {
          return res.status(400).json({ message: "Invalid author name" });
        }
        book.authorName = authorName.trim();
      }

      if (bookType !== undefined) {
        book.bookType = bookType;
      }

      if (req.body.readingProgress !== undefined) {
        const progress = Number(req.body.readingProgress);

        if (!validProgress(progress)) {
          return res.status(400).json({
            message: "Reading progress must be between 0 and 100",
          });
        }

        book.readingProgress = progress;
      }

      if (req.file) {
        book.coverImage = await saveCover(req.file, req);
      } else if (req.body.coverImage !== undefined) {
        book.coverImage = req.body.coverImage.trim();
      }

      await book.save();

      res.json(book);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
);

// DELETE: Remove a book
router.delete("/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid book ID" });
    }

    const book = await Book.findByIdAndDelete(req.params.id);

    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    res.json({ message: "Book deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete book" });
  }
});

export default router;



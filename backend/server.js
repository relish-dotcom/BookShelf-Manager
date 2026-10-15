import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import BookRoutes from "./routes/BookRoutes.js";

dotenv.config();

const app = express();

const currentDir = path.dirname(fileURLToPath(import.meta.url));

// Matches the uploads folder used by BookRoutes.js
const uploadsDir = path.resolve(currentDir, "../uploads");

app.use(cors());
app.use(express.json());

// Serve uploaded book covers
app.use("/uploads", express.static(uploadsDir));

app.get("/", (req, res) => {
  res.json({ message: "My Bookshelf API is running" });
});

app.use("/api/books", BookRoutes);

const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Serving uploaded images from: ${uploadsDir}`);
    });
  })
  .catch((error) => {
    console.error("Server startup failed:", error.message);
    process.exit(1);
  });
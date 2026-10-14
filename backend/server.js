import express from "express";
import path from "node:path";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import BookRoutes from "./routes/BookRoutes.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(
  "/uploads",
  express.static(path.resolve("uploads"))
);

app.get("/", (req, res) => {
  res.json({ message: "My Bookshelf API is running" });
});

app.use("/api/books", BookRoutes);

const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Server startup failed:", error.message);
    process.exit(1);
  });
import mongoose from "mongoose";

const readingSessionSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    minutes: {
      type: Number,
      required: true,
      min: 1,
      max: 1440,
    },
  },
  { _id: false }
);

const bookSchema = new mongoose.Schema(
  {
    bookName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },

    authorName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },

    bookType: {
      type: String,
      enum: ["Textbook", "Other Book"],
      default: "Other Book",
    },

    coverImage: {
      type: String,
      default: "",
    },

    pdfUrl: {
      type: String,
      default: "",
    },

    readingProgress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    readingSessions: {
      type: [readingSessionSchema],
      default: [],
    },
  },
  { timestamps: true }
);

bookSchema.index({ createdAt: -1 });

const Book = mongoose.model("Book", bookSchema);

export default Book;
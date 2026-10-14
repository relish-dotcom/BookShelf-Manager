import multer from "multer";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024,
    files: 1,
  },
  fileFilter: (req, file, cb) => {
    const isImage = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ].includes(file.mimetype);

    const isPdf = file.mimetype === "application/pdf";

    if (!isImage && !isPdf) {
      return cb(
        new Error("Only JPG, PNG, WebP, and PDF files are allowed")
      );
    }

    cb(null, true);
  },
});

export default upload;
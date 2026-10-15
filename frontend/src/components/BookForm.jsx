import { useEffect, useState } from "react";
import { X, BookPlus, Save, ImagePlus, BookOpen } from "lucide-react";

const emptyBook = {
  bookName: "",
  authorName: "",
  bookType: "Other Book",
  coverImage: "",
  readingProgress: 0,
};

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

export default function BookForm({
  initialBook,
  onSubmit,
  onCancel,
}) {
  const [form, setForm] = useState(emptyBook);
  const [coverFile, setCoverFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Initialize the form when adding or editing a book.
  useEffect(() => {
    setForm({
      ...emptyBook,
      ...(initialBook || {}),
    });

    setCoverFile(null);
    setPreviewUrl("");
    setError("");
    setImageError(false);
  }, [initialBook]);

  // Create a temporary preview for the selected file.
  useEffect(() => {
    if (!coverFile) {
      setPreviewUrl("");
      return;
    }

    const objectUrl = URL.createObjectURL(coverFile);
    setPreviewUrl(objectUrl);
    setImageError(false);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [coverFile]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]:
        name === "readingProgress"
          ? Number(value)
          : value,
    }));
  };

  const handleCoverChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    setError("");

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError("Choose a JPG, PNG, or WebP image.");
      e.target.value = "";
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      setError("Image size must be 5 MB or less.");
      e.target.value = "";
      return;
    }

    setImageError(false);
    setCoverFile(file);

    // Allow selecting the same file again later.
    e.target.value = "";
  };

  const handleRemoveCover = () => {
    setCoverFile(null);
    setPreviewUrl("");
    setImageError(false);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.bookName.trim() || !form.authorName.trim()) {
      setError("Book name and author name are required.");
      return;
    }

    if (typeof onSubmit !== "function") {
      setError("Book save handler is not configured.");
      return;
    }

    try {
      setSaving(true);

      await onSubmit({
        ...form,
        bookName: form.bookName.trim(),
        authorName: form.authorName.trim(),
        readingProgress: Number(form.readingProgress),
        coverFile,
      });
    } catch (err) {
      setError(err.message || "Unable to save this book.");
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    "w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm text-stone-800 outline-none transition focus:border-stone-500 focus:ring-2 focus:ring-[#BEC5A4]";

  // Show the newly selected file first, otherwise the saved cover.
  const displayedCover = previewUrl || form.coverImage;

  return (
    <div className="w-full rounded-2xl border border-stone-200 bg-[#FAF9F6] p-5 shadow-sm sm:p-7">
      <div className="mb-6 flex items-center justify-between gap-3">
        <div>
          <h2 className="font-serif text-2xl text-stone-800">
            {initialBook ? "Edit your book" : "Add a new book"}
          </h2>

          <p className="mt-1 text-sm text-stone-500">
            A little more room for another story.
          </p>
        </div>

        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            aria-label="Close form"
            className="rounded-full p-2 text-stone-600 hover:bg-stone-200"
          >
            <X size={20} />
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="bookName"
            className="mb-1.5 block text-sm font-medium text-stone-700"
          >
            Book name *
          </label>

          <input
            id="bookName"
            name="bookName"
            value={form.bookName}
            onChange={handleChange}
            maxLength={200}
            required
            placeholder="Enter book title"
            className={inputClass}
          />
        </div>

        <div>
          <label
            htmlFor="authorName"
            className="mb-1.5 block text-sm font-medium text-stone-700"
          >
            Author name *
          </label>

          <input
            id="authorName"
            name="authorName"
            value={form.authorName}
            onChange={handleChange}
            maxLength={150}
            required
            placeholder="Enter author's name"
            className={inputClass}
          />
        </div>

        <div>
          <label
            htmlFor="bookType"
            className="mb-1.5 block text-sm font-medium text-stone-700"
          >
            Book type
          </label>

          <select
            id="bookType"
            name="bookType"
            value={form.bookType}
            onChange={handleChange}
            className={inputClass}
          >
            <option value="Textbook">Textbook</option>
            <option value="Other Book">Other Book</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="coverImage"
            className="mb-1.5 block text-sm font-medium text-stone-700"
          >
            Cover image
          </label>

          <label
            htmlFor="coverImage"
            className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-stone-300 bg-white px-4 py-5 text-sm text-stone-600 transition hover:border-stone-500 hover:bg-stone-50"
          >
            <ImagePlus size={20} />

            <span className="max-w-full truncate">
              {coverFile
                ? coverFile.name
                : "Choose an image"}
            </span>
          </label>

          <input
            id="coverImage"
            name="coverImage"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleCoverChange}
            className="sr-only"
          />

          <p className="mt-1.5 text-xs text-stone-500">
            Optional. JPG, PNG, or WebP. Maximum 5 MB.
          </p>

          {/* Cover preview */}
          <div className="mt-4">
            <p className="mb-2 text-sm font-medium text-stone-700">
              Cover preview
            </p>

            <div className="flex min-h-52 items-center justify-center overflow-hidden rounded-xl border border-stone-200 bg-[#EEECE3] p-3">
              {displayedCover && !imageError ? (
                <img
                  key={displayedCover}
                  src={displayedCover}
                  alt={`Cover of ${form.bookName || "your book"}`}
                  className="block max-h-72 max-w-full rounded-lg object-contain"
                  onLoad={() => setImageError(false)}
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className="flex flex-col items-center gap-3 py-8 text-stone-500">
                  <BookOpen size={42} strokeWidth={1.5} />

                  <p className="text-sm">
                    {imageError
                      ? "Unable to load cover image"
                      : "Your cover will appear here"}
                  </p>
                </div>
              )}
            </div>

            {imageError && displayedCover && (
              <p className="mt-2 text-sm text-red-600">
                The image URL could not be loaded. Try choosing
                the image again or check the saved image URL.
              </p>
            )}

            {coverFile && (
              <button
                type="button"
                onClick={handleRemoveCover}
                className="mt-2 text-sm text-red-600 hover:underline"
              >
                Remove selected image
              </button>
            )}
          </div>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <label
              htmlFor="readingProgress"
              className="text-sm font-medium text-stone-700"
            >
              Reading progress
            </label>

            <span className="rounded-full bg-[#E5E8D9] px-3 py-1 text-sm font-semibold text-stone-700">
              {form.readingProgress}%
            </span>
          </div>

          <input
            id="readingProgress"
            name="readingProgress"
            type="range"
            min="0"
            max="100"
            step="1"
            value={form.readingProgress}
            onChange={handleChange}
            className="w-full accent-[#718267]"
          />
        </div>

        {error && (
          <p role="alert" className="text-sm text-red-600">
            {error}
          </p>
        )}

        <div className="flex flex-wrap gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-[#BEC5A4] px-5 py-3 font-medium text-stone-800 transition hover:bg-[#ADB695] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {initialBook ? (
              <Save size={18} />
            ) : (
              <BookPlus size={18} />
            )}

            {saving
              ? "Saving..."
              : initialBook
                ? "Save changes"
                : "Add book"}
          </button>

          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={saving}
              className="rounded-full border border-stone-300 px-5 py-3 text-stone-700 hover:bg-stone-100 disabled:opacity-60"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
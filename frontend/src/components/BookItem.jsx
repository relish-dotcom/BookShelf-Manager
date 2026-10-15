import {
  BookOpen,
  Pencil,
  Trash2,
  CheckCircle2,
} from "lucide-react";

export default function BookItem({
  book,
  onEdit,
  onDelete,
  onProgressChange,
}) {
  const progress = Math.min(
    100,
    Math.max(0, Number(book.readingProgress) || 0)
  );

  return (
    <article className="group min-w-0">
      {/* Book cover */}
      <div className="relative aspect-[3/4] overflow-hidden rounded-xl border border-stone-200 bg-[#EAE9DF] shadow-sm transition duration-300 group-hover:-translate-y-1 group-hover:shadow-md">
        {book.coverImage && (
          <img
            src={book.coverImage}
            alt={`Cover of ${book.bookName}`}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = "none";

              const placeholder =
                e.currentTarget.parentElement?.querySelector(
                  ".cover-placeholder"
                );

              placeholder?.classList.remove("hidden");
            }}
          />
        )}

        {/* Placeholder when there is no cover */}
        <div
          className={`cover-placeholder absolute inset-0 flex flex-col items-center justify-center gap-3 p-4 text-center text-stone-500 ${
            book.coverImage ? "hidden" : ""
          }`}
        >
          <BookOpen size={38} strokeWidth={1.3} />

          <span className="font-serif text-sm">
            A new chapter
          </span>
        </div>

        {/* Edit and delete buttons */}
        <div className="absolute right-2 top-2 z-10 flex gap-1.5 opacity-100 sm:opacity-0 sm:transition-opacity sm:group-hover:opacity-100">
          <button
            type="button"
            onClick={() => onEdit(book)}
            aria-label={`Edit ${book.bookName}`}
            className="rounded-full bg-white/95 p-2 text-stone-700 shadow hover:bg-[#BEC5A4]"
          >
            <Pencil size={15} />
          </button>

          <button
            type="button"
            onClick={() => onDelete(book)}
            aria-label={`Delete ${book.bookName}`}
            className="rounded-full bg-white/95 p-2 text-stone-700 shadow hover:bg-red-100 hover:text-red-700"
          >
            <Trash2 size={15} />
          </button>
        </div>

        {/* Completed badge */}
        {progress === 100 && (
          <div className="absolute bottom-2 right-2 z-10 rounded-full bg-white/95 p-1.5 text-green-700">
            <CheckCircle2 size={18} />
          </div>
        )}
      </div>

      {/* Book details */}
      <div className="pt-3">
        <span className="mb-1 inline-block rounded-full bg-[#E8EBDD] px-2.5 py-1 text-[10px] font-medium text-stone-600 sm:text-xs">
          {book.bookType || "Other Book"}
        </span>

        <h3
          className="break-words font-serif text-base font-semibold leading-snug text-stone-800 sm:text-lg"
          title={book.bookName}
        >
          {book.bookName}
        </h3>

        <p className="mt-1 break-words text-sm text-stone-500">
          {book.authorName}
        </p>

        {/* Reading progress */}
        <div className="mt-3 flex items-center justify-between gap-2 text-xs text-stone-600 sm:text-sm">
          <span>Reading progress</span>

          <span className="font-semibold text-stone-800">
            {progress}%
          </span>
        </div>

        <div
          className="mt-2 h-1.5 overflow-hidden rounded-full bg-stone-200"
          role="progressbar"
          aria-label={`${book.bookName} reading progress`}
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className="h-full rounded-full bg-[#718267] transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Update progress */}
        <label className="mt-3 block text-xs text-stone-500">
          Update progress

          <select
            value={progress}
            onChange={(e) =>
              onProgressChange(
                book._id,
                Number(e.target.value)
              )
            }
            className="mt-1.5 w-full rounded-lg border border-stone-200 bg-white px-2.5 py-2 text-sm text-stone-700 outline-none focus:border-stone-500"
          >
            <option value={0}>Not started — 0%</option>
            <option value={25}>25% completed</option>
            <option value={50}>50% completed</option>
            <option value={75}>75% completed</option>
            <option value={100}>Completed — 100%</option>
          </select>
        </label>
      </div>
    </article>
  );
}
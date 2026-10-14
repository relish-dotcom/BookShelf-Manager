import { useCallback, useEffect, useState } from "react";
import {
  BookPlus,
  LibraryBig,
  RefreshCw,
  Search,
} from "lucide-react";
import BookForm from "./BookForm";
import BookItem from "./BookItem";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export default function BookList({ search = "" }) {
  const [books, setBooks] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // API requests without authentication
  const request = async (path, options = {}) => {
    const response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        ...(options.body
          ? { "Content-Type": "application/json" }
          : {}),
        ...options.headers,
      },
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.message || "Something went wrong.");
    }

    return data;
  };

  // Load all books
  const loadBooks = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await request("/books");

      if (!Array.isArray(data)) {
        throw new Error("Unexpected response from the server.");
      }

      setBooks(data);
    } catch (err) {
      setError(err.message || "Unable to load books.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBooks();
  }, [loadBooks]);

  // Add or update a book
  const handleSave = async (formData) => {
    setError("");

    try {
      const isEditing = Boolean(editingBook);

      const savedBook = await request(
        isEditing ? `/books/${editingBook._id}` : "/books",
        {
          method: isEditing ? "PUT" : "POST",
          body: JSON.stringify(formData),
        }
      );

      if (isEditing) {
        setBooks((previous) =>
          previous.map((book) =>
            book._id === savedBook._id ? savedBook : book
          )
        );
      } else {
        setBooks((previous) => [savedBook, ...previous]);
      }

      setEditingBook(null);
      setShowForm(false);
    } catch (err) {
      setError(err.message || "Unable to save book.");
      throw err;
    }
  };

  // Open the form to edit a book
  const handleEdit = (book) => {
    setEditingBook(book);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Delete a book
  const handleDelete = async (book) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${book.bookName}"?`
    );

    if (!confirmed) return;

    setError("");

    try {
      await request(`/books/${book._id}`, {
        method: "DELETE",
      });

      setBooks((previous) =>
        previous.filter((item) => item._id !== book._id)
      );
    } catch (err) {
      setError(err.message || "Unable to delete book.");
    }
  };

  // Update reading progress through the existing PUT route
  const handleProgressChange = async (id, progress) => {
    const previousBooks = books;
    const currentBook = books.find((book) => book._id === id);

    if (!currentBook) return;

    setError("");

    // Update the UI immediately
    setBooks((previous) =>
      previous.map((book) =>
        book._id === id
          ? { ...book, readingProgress: progress }
          : book
      )
    );

    try {
      const updatedBook = await request(`/books/${id}`, {
        method: "PUT",
        body: JSON.stringify({ readingProgress: progress }),
      });

      setBooks((previous) =>
        previous.map((book) =>
          book._id === id ? updatedBook : book
        )
      );
    } catch (err) {
      setBooks(previousBooks);
      setError(err.message || "Unable to update reading progress.");
    }
  };

  // Search by title or author
  const normalizedSearch = search.trim().toLowerCase();

  const filteredBooks = books.filter((book) =>
    `${book.bookName} ${book.authorName}`
      .toLowerCase()
      .includes(normalizedSearch)
  );

  const closeForm = () => {
    setShowForm(false);
    setEditingBook(null);
    setError("");
  };

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-10">
      {/* Collection heading */}
      <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="mb-1 text-sm text-stone-500">
            Your personal reading corner
          </p>

          <h1 className="font-serif text-3xl text-stone-800 sm:text-4xl">
            My Collection
          </h1>

          <p className="mt-2 text-sm text-stone-500">
            {books.length} {books.length === 1 ? "book" : "books"} on your shelf
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            if (showForm) {
              closeForm();
            } else {
              setEditingBook(null);
              setError("");
              setShowForm(true);
            }
          }}
          className="inline-flex items-center gap-2 rounded-full bg-[#BEC5A4] px-5 py-3 font-medium text-stone-800 shadow-sm transition hover:bg-[#ADB695]"
        >
          <BookPlus size={19} />
          {showForm ? "Close form" : "Add a book"}
        </button>
      </div>

      {/* Add/edit form */}
      {showForm && (
        <div className="mb-9">
          <BookForm
            initialBook={editingBook}
            onSubmit={handleSave}
            onCancel={closeForm}
          />
        </div>
      )}

      {/* Error message */}
      {error && (
        <div
          role="alert"
          className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          <span>{error}</span>

          <button
            type="button"
            onClick={loadBooks}
            className="inline-flex items-center gap-2 font-medium underline"
          >
            <RefreshCw size={15} />
            Retry
          </button>
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <div className="py-16 text-center text-stone-500">
          <RefreshCw
            className="mx-auto mb-3 animate-spin"
            size={28}
          />
          Loading your books...
        </div>
      ) : filteredBooks.length > 0 ? (
        /* Book collection */
        <div className="grid grid-cols-2 gap-x-5 gap-y-9 sm:grid-cols-3 sm:gap-x-6 lg:grid-cols-4 xl:grid-cols-5">
          {filteredBooks.map((book) => (
            <BookItem
              key={book._id}
              book={book}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onProgressChange={handleProgressChange}
            />
          ))}
        </div>
      ) : (
        /* Empty or search results state */
        <div className="rounded-2xl border border-dashed border-stone-300 bg-white/40 px-5 py-16 text-center">
          {normalizedSearch ? (
            <>
              <Search
                size={38}
                className="mx-auto mb-4 text-stone-400"
              />

              <h2 className="font-serif text-xl text-stone-800">
                No books found
              </h2>

              <p className="mt-2 text-sm text-stone-500">
                Try searching for a different title or author.
              </p>
            </>
          ) : (
            <>
              <LibraryBig
                size={42}
                className="mx-auto mb-4 text-stone-400"
              />

              <h2 className="font-serif text-xl text-stone-800">
                Your shelf is waiting
              </h2>

              <p className="mt-2 text-sm text-stone-500">
                Add your first book and start tracking your reading.
              </p>

              <button
                type="button"
                onClick={() => {
                  setEditingBook(null);
                  setShowForm(true);
                }}
                className="mt-5 rounded-full bg-[#BEC5A4] px-5 py-2.5 font-medium text-stone-800 hover:bg-[#ADB695]"
              >
                Add your first book
              </button>
            </>
          )}
        </div>
      )}
    </main>
  );
}
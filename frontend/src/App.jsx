import { useState } from "react";
import { Search, UserRound, BookOpen } from "lucide-react";
import BookList from "./components/BookList";

function Navbar({ search, setSearch }) {
  return (
    <div className="bg-[#BEC5A4]">
      <header className="w-full border-b border-stone-300 bg-transparent">
        <div className="mx-auto w-full max-w-7xl px-4 py-4 sm:px-6 sm:py-6 lg:px-10">
          {/* Top Navbar Row */}
          <div className="flex items-center justify-between gap-4">
            {/* Logo */}
            <a
              href="/"
              className="flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2 font-bold hover:bg-white/70 sm:px-4 sm:py-2.5"
            >
              <BookOpen className="h-5 w-5 shrink-0 text-stone-700 sm:h-6 sm:w-6" />

              <span className="font-serif text-3xl text-stone-800 sm:text-3xl lg:text-4xl">
                My Bookshelf
              </span>
            </a>

            {/* Greeting - Desktop & Tablet */}
            <div className="hidden flex-1 px-6 sm:block">
              <h2 className="font-serif text-base text-stone-800">
                Hi Sweetheart{" "}
                <span className="text-rose-400">❤️</span>
              </h2>

              <p className="text-xs text-stone-500 sm:text-sm">
                Ready to read...
              </p>
            </div>

            {/* Profile Icon - Decorative */}
            <div
              aria-label="Profile"
              title="My Bookshelf"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-stone-300 bg-white/60 sm:h-11 sm:w-11"
            >
              <UserRound className="h-5 w-5 text-stone-700" />
            </div>
          </div>

          {/* Greeting - Mobile */}
          <div className="mt-4 sm:hidden">
            <h2 className="font-serif text-lg text-stone-800">
              Hi Sweetheart{" "}
              <span className="text-rose-400">♡</span>
            </h2>

            <p className="text-sm text-stone-500">
              Ready to read...
            </p>
          </div>

          {/* Search Bar */}
          <div className="mt-5 sm:mt-6">
            <div className="mx-auto flex w-full max-w-2xl items-center gap-3 rounded-full border border-stone-400 bg-white/60 px-4 py-2.5 transition focus-within:border-stone-700 focus-within:ring-2 focus-within:ring-stone-200 sm:py-3">
              <Search className="h-5 w-5 shrink-0 text-stone-500" />

              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search your books..."
                aria-label="Search your books"
                className="w-full bg-transparent font-serif text-sm text-stone-800 outline-none placeholder:text-stone-400 sm:text-base"
              />
            </div>
          </div>
        </div>
      </header>
    </div>
  );
}

export default function App() {
  const [search, setSearch] = useState("");

  return (
    <div className="min-h-screen bg-[#F7F6F0]">
      <Navbar search={search} setSearch={setSearch} />

      <BookList search={search} />
    </div>
  );
}
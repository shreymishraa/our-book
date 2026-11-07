import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

const booksData = [
  {
    id: 1,
    title: "Mathematics Fundamentals",
    subject: "Mathematics",
    description: "Understand mathematical concepts and problem solving.",
    icon: "📐",
  },
  {
    id: 2,
    title: "English Grammar",
    subject: "English",
    description: "Learn English grammar and improve your language skills.",
    icon: "📘",
  },
  {
    id: 3,
    title: "Hindi Vyakaran",
    subject: "Hindi",
    description: "Learn Hindi grammar and literature.",
    icon: "📕",
  },
  {
    id: 4,
    title: "Modern Indian History",
    subject: "History",
    description: "Explore important events in Indian history.",
    icon: "🏛️",
  },
  {
    id: 5,
    title: "Introduction to Civics",
    subject: "Civics",
    description: "Understand government, democracy and citizenship.",
    icon: "⚖️",
  },
  {
    id: 6,
    title: "World Geography",
    subject: "Geography",
    description: "Explore countries, continents and our planet.",
    icon: "🌍",
  },
];

const Books = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const selectedSubject = searchParams.get("subject") || "All";

  const [search, setSearch] = useState("");

  // Filter books
  const filteredBooks = booksData.filter((book) => {
    const matchesSubject =
      selectedSubject === "All" || book.subject === selectedSubject;

    const matchesSearch =
      book.title.toLowerCase().includes(search.toLowerCase()) ||
      book.subject.toLowerCase().includes(search.toLowerCase());

    return matchesSubject && matchesSearch;
  });

  // Handle Read Book button
  const handleReadBook = (bookId) => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/register", {
        state: {
          from: `/books/${bookId}`,
        },
      });

      return;
    }

    navigate(`/books/${bookId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-12">
      <div className="max-w-7xl mx-auto">

        <h1 className="text-4xl font-bold text-gray-900 mb-3">
          Explore Books 📚
        </h1>

        <p className="text-gray-600 mb-8">
          Discover books from your favourite subjects.
        </p>

        {/* Search Bar */}
        <input
          type="text"
          placeholder="Search books..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full md:w-96 border border-gray-300 rounded-lg px-4 py-3 mb-8 outline-none focus:ring-2 focus:ring-blue-500"
        />

        {/* Selected Subject */}
        <h2 className="text-2xl font-semibold mb-6">
          {selectedSubject === "All"
            ? "All Books"
            : `${selectedSubject} Books`}
        </h2>

        {/* Books Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

          {filteredBooks.map((book) => (
            <div
              key={book.id}
              className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition"
            >
              <div className="text-5xl mb-4">
                {book.icon}
              </div>

              <span className="text-sm text-blue-600 font-semibold">
                {book.subject}
              </span>

              <h3 className="text-xl font-bold text-gray-900 mt-2 mb-3">
                {book.title}
              </h3>

              <p className="text-gray-600 mb-5">
                {book.description}
              </p>

              <button
                onClick={() => handleReadBook(book.id)}
                className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                Read Book
              </button>
            </div>
          ))}

        </div>

        {/* Empty State */}
        {filteredBooks.length === 0 && (
          <p className="text-center text-gray-500 py-12">
            No books found.
          </p>
        )}

      </div>
    </div>
  );
};

export default Books;
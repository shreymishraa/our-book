import { Link } from "react-router-dom";
import CategorySection from "../components/CategorySection";

const Home = () => {
  return (
    <div className="min-h-screen bg-gray-50">

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 py-24 text-center">

        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          Welcome to OUR BOOK 📚
        </h1>

        <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
          Discover, explore and read your favourite books.
          Your reading journey starts here.
        </p>

        <Link
          to="/books"
          className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
        >
          Explore Books
        </Link>

      </section>

      {/* Category Section */}
      <CategorySection />

      {/* About Section */}
      <section className="max-w-7xl mx-auto px-6 py-16 text-center">

        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          About OUR BOOK
        </h2>

        <p className="text-gray-600 max-w-2xl mx-auto">
          OUR BOOK is a platform where readers can discover and
          explore books across different subjects in one place.
        </p>

      </section>

    </div>
  );
};

export default Home;
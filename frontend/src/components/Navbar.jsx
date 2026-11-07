import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="flex items-center justify-between px-10 py-5 bg-white shadow-md">

      <h1 className="text-2xl font-bold text-blue-700">
        OUR BOOK 📚
      </h1>

      <div className="flex gap-8 text-gray-700 font-medium">
        <Link to="/" className="hover:text-blue-600">
          Home
        </Link>

        <Link to="/books" className="hover:text-blue-600">
          Books
        </Link>

        <Link to="/contact" className="hover:text-blue-600">
          Contact
        </Link>

        <Link to="/admin" className="hover:text-blue-600 text-sm font-semibold bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg border border-blue-200 transition">
          🛡️ Admin Dashboard
        </Link>
      </div>

    </nav>
  );
};

export default Navbar;
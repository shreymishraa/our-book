import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

const Navbar = () => {
  const navigate = useNavigate();
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [user, setUser] = useState(null);

  useEffect(() => {
    const rawUser = localStorage.getItem("user");
    if (rawUser) {
      try {
        setUser(JSON.parse(rawUser));
      } catch (e) {
        setUser(null);
      }
    }
  }, [token]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
    navigate("/");
  };

  return (
    <nav className="flex items-center justify-between px-10 py-5 bg-white shadow-md">

      <Link to="/" className="text-2xl font-bold text-blue-700 flex items-center gap-2">
        <span>OUR BOOK</span> <span>📚</span>
      </Link>

      <div className="flex items-center gap-6 text-gray-700 font-medium">
        <Link to="/" className="hover:text-blue-600 transition">
          Home
        </Link>

        <Link to="/books" className="hover:text-blue-600 transition">
          Books
        </Link>

        <Link to="/contact" className="hover:text-blue-600 transition">
          Contact
        </Link>

        {token && (
          <Link
            to="/admin"
            className="hover:text-blue-600 text-sm font-semibold bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg border border-blue-200 transition"
          >
            🛡️ Admin Dashboard
          </Link>
        )}

        {token ? (
          <button
            onClick={handleLogout}
            className="text-sm font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-lg border border-red-200 transition cursor-pointer"
          >
            Logout
          </button>
        ) : (
          <Link
            to="/register"
            className="text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 px-4 py-1.5 rounded-lg transition"
          >
            Register / Login
          </Link>
        )}
      </div>

    </nav>
  );
};

export default Navbar;

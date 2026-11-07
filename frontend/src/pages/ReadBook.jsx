import { useEffect, useState } from "react";
import { Link, Navigate, useLocation, useParams } from "react-router-dom";
import api from "../services/api";

const ReadBook = () => {
  const { id } = useParams();
  const location = useLocation();

  const token = localStorage.getItem("token");

  const [pdfUrl, setPdfUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) return;

    let objectUrl;

    const fetchBook = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get(`/books/${id}/read`, {
          responseType: "blob",
        });

        const pdfBlob = new Blob([response.data], {
          type: "application/pdf",
        });

        objectUrl = URL.createObjectURL(pdfBlob);
        setPdfUrl(objectUrl);

      } catch (error) {
        setError(
          "Unable to load this book. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchBook();

    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [id, token]);

  // Redirect unauthenticated users
  if (!token) {
    return (
      <Navigate
        to="/register"
        state={{ from: location.pathname }}
        replace
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">

      <div className="max-w-7xl mx-auto">

        <Link
          to="/books"
          className="text-blue-600 font-semibold"
        >
          ← Back to Books
        </Link>

        <h1 className="text-3xl font-bold my-6">
          Book Reading 📚
        </h1>

        {loading && (
          <p className="text-center py-10">
            Loading your book...
          </p>
        )}

        {error && (
          <p className="text-red-600 text-center py-10">
            {error}
          </p>
        )}

        {pdfUrl && (
          <iframe
            src={pdfUrl}
            title="Book PDF"
            className="w-full h-[85vh] bg-white rounded-xl shadow-lg"
          />
        )}

      </div>

    </div>
  );
};

export default ReadBook;
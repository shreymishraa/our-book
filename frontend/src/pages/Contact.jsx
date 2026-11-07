import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ text: "", type: "" });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setStatus({ text: "", type: "" });

      const response = await api.post("/contact", {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        subject: formData.subject.trim(),
        message: formData.message.trim(),
      });

      setStatus({
        text: response.data.message || "Message sent successfully!",
        type: "success",
      });

      // Reset form on success
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
      });

    } catch (error) {
      setStatus({
        text:
          error.response?.data?.message ||
          "Unable to send your message. Please try again.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-6">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="text-center mb-12">
          <div className="text-5xl mb-4">📬</div>
          <h1 className="text-4xl font-bold text-gray-900">Get in Touch</h1>
          <p className="text-gray-600 mt-2 max-w-lg mx-auto">
            Have questions about our books, suggestions, or need assistance?
            Send us a message and our team will get back to you shortly.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

          {/* Contact Details Card */}
          <div className="bg-blue-600 text-white rounded-2xl p-8 flex flex-col justify-between shadow-lg">
            <div>
              <h2 className="text-2xl font-bold mb-4">OUR BOOK Support</h2>
              <p className="text-blue-100 text-sm mb-6 leading-relaxed">
                We are dedicated to helping readers explore literature and educational textbooks. A confirmation email will be dispatched to your inbox right after you submit.
              </p>

              <div className="space-y-4 text-sm">
                <div className="flex items-center gap-3">
                  <span className="text-xl">✉️</span>
                  <span>support@ourbook.com</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xl">📍</span>
                  <span>Digital Library Services</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xl">⏱️</span>
                  <span>Response time: &lt; 24 hrs</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-blue-500/50 text-xs text-blue-200">
              Admin receives your inquiry directly, and you receive an immediate confirmation on your email address.
            </div>
          </div>

          {/* Form Card */}
          <div className="md:col-span-2 bg-white rounded-2xl shadow-lg p-8">
            <form onSubmit={handleSubmit} className="space-y-5">

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Your Full Name
                </label>
                <input
                  name="name"
                  type="text"
                  placeholder="e.g. John Doe"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  name="email"
                  type="email"
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-xs text-gray-500">
                  Confirmation will be sent to this email address.
                </span>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Subject
                </label>
                <input
                  name="subject"
                  type="text"
                  placeholder="Inquiry topic or book name"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Message
                </label>
                <textarea
                  name="message"
                  rows="4"
                  placeholder="Write your inquiry or question here..."
                  value={formData.message}
                  onChange={handleChange}
                  required
                  minLength={10}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
              >
                {loading ? "Sending Message..." : "Send Message"}
              </button>

            </form>

            {/* Status Message */}
            {status.text && (
              <div
                className={`mt-6 p-4 rounded-lg text-sm ${
                  status.type === "success"
                    ? "bg-green-50 text-green-800 border border-green-200"
                    : "bg-red-50 text-red-800 border border-red-200"
                }`}
              >
                {status.text}
              </div>
            )}

            <div className="text-center mt-6">
              <Link to="/" className="text-gray-500 hover:text-blue-600 text-sm">
                ← Back to Home
              </Link>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

export default Contact;

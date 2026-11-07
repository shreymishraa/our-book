import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import api from "../services/api";

const Register = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [step, setStep] = useState("register");
  const [userId, setUserId] = useState(null);
  const [otp, setOtp] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
  });

  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");

  // Handle input changes
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Show messages
  const showMessage = (text, type = "success") => {
    setMessage(text);
    setMessageType(type);
  };

  // Register user
  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setMessage("");

      const response = await api.post("/auth/register", {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        mobile: formData.mobile.trim(),
      });

      const id = response.data.user.id;

      setUserId(id);
      setStep("otp");

      await sendOTP(id);

    } catch (error) {
      showMessage(
        error.response?.data?.message || "Registration failed",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  // Generate OTP
  const sendOTP = async (id) => {
    try {
      const response = await api.post("/auth/send-otp", {
        userId: id,
      });

      showMessage(
        response.data.message || "OTP generated successfully",
        "success"
      );

    } catch (error) {
      showMessage(
        error.response?.data?.message || "Unable to generate OTP",
        "error"
      );
    }
  };

  // Verify OTP
  const handleVerifyOTP = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setMessage("");

      const response = await api.post("/auth/verify-otp", {
        userId,
        otp,
      });

      // Save JWT token
      localStorage.setItem("token", response.data.token);

      // Save user information
      localStorage.setItem(
        "user",
        JSON.stringify(response.data.user)
      );

      showMessage("Verification successful! Welcome to OUR BOOK.");

      // Redirect user to books page
      const destination = location.state?.from || "/books";

      navigate(destination, { replace: true });

    } catch (error) {
      showMessage(
        error.response?.data?.message || "OTP verification failed",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOTP = async () => {
    try {
      setResending(true);
      setMessage("");

      await sendOTP(userId);

      setOtp("");

    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6 py-12">

      <div className="bg-white w-full max-w-md p-8 rounded-2xl shadow-lg">

        {/* Header */}
        <div className="text-center mb-8">

          <div className="text-5xl mb-4">
            📚
          </div>

          <h1 className="text-3xl font-bold text-gray-900">
            Join OUR BOOK
          </h1>

          <p className="text-gray-500 mt-2">
            {step === "register"
              ? "Register once and unlock access to all books."
              : "Enter your 6-digit OTP to unlock all books."}
          </p>

        </div>

        {/* Registration Form */}
        {step === "register" ? (

          <form
            onSubmit={handleRegister}
            className="space-y-5"
          >

            <input
              name="name"
              type="text"
              placeholder="Full Name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
            />

            <input
              name="email"
              type="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
            />

            <input
              name="mobile"
              type="tel"
              placeholder="10-digit Mobile Number"
              value={formData.mobile}
              onChange={handleChange}
              pattern="[0-9]{10}"
              maxLength={10}
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loading ? "Processing..." : "Register & Get OTP"}
            </button>

          </form>

        ) : (

          /* OTP Verification Form */
          <form
            onSubmit={handleVerifyOTP}
            className="space-y-5"
          >

            <input
              type="text"
              inputMode="numeric"
              placeholder="Enter 6-digit OTP"
              value={otp}
              onChange={(e) =>
                setOtp(
                  e.target.value.replace(/\D/g, "").slice(0, 6)
                )
              }
              maxLength={6}
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-center text-2xl tracking-widest outline-none focus:ring-2 focus:ring-blue-500"
            />

            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loading ? "Verifying..." : "Verify OTP & Unlock Books"}
            </button>

            <button
              type="button"
              onClick={handleResendOTP}
              disabled={resending || loading}
              className="w-full text-blue-600 font-semibold hover:underline disabled:opacity-50"
            >
              {resending ? "Sending..." : "Resend OTP"}
            </button>

          </form>

        )}

        {/* Status Message */}
        {message && (
          <p
            className={`text-center text-sm mt-5 ${
              messageType === "error"
                ? "text-red-600"
                : "text-green-600"
            }`}
          >
            {message}
          </p>
        )}

        {/* Footer */}
        <div className="text-center mt-6">

          <Link
            to="/"
            className="text-gray-500 hover:text-blue-600 text-sm"
          >
            ← Back to Home
          </Link>

        </div>

      </div>

    </div>
  );
};

export default Register;
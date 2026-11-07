import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import api from "../services/api";

const Register = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [step, setStep] = useState("register");
  const [userId, setUserId] = useState(null);
  const [otp, setOtp] = useState("");
  const [channel, setChannel] = useState("sms");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    countryCode: "+91",
    mobile: "",
  });

  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");

  // Resend cooldown timer
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;

    const timer = setTimeout(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [cooldown]);

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

  // Send OTP via selected channel
  const sendOTP = useCallback(
    async (id, selectedChannel) => {
      try {
        const response = await api.post("/auth/send-otp", {
          userId: id,
          channel: selectedChannel || channel,
        });

        showMessage(
          response.data.message || "Verification code sent successfully",
          "success"
        );

        // Start 30-second cooldown
        setCooldown(30);

      } catch (error) {
        showMessage(
          error.response?.data?.message || "Unable to send verification code",
          "error"
        );
      }
    },
    [channel]
  );

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
        countryCode: formData.countryCode.trim(),
      });

      const id = response.data.user.id;

      setUserId(id);
      setStep("otp");

      await sendOTP(id, channel);

    } catch (error) {
      showMessage(
        error.response?.data?.message || "Registration failed",
        "error"
      );
    } finally {
      setLoading(false);
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

      // Redirect user to originally requested page or books
      const destination = location.state?.from || "/books";

      setTimeout(() => {
        navigate(destination, { replace: true });
      }, 800);

    } catch (error) {
      showMessage(
        error.response?.data?.message || "Verification failed",
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

      await sendOTP(userId, channel);

      setOtp("");

    } finally {
      setResending(false);
    }
  };

  // Switch channel and resend
  const handleChannelSwitch = async (newChannel) => {
    if (newChannel === channel) return;

    setChannel(newChannel);

    if (step === "otp" && cooldown <= 0) {
      try {
        setResending(true);
        setMessage("");

        await sendOTP(userId, newChannel);

        setOtp("");
      } finally {
        setResending(false);
      }
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
              : "Enter the 6-digit code sent to your phone."}
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

            {/* Country Code + Mobile Number */}
            <div className="flex gap-3">

              <input
                name="countryCode"
                type="text"
                placeholder="+91"
                value={formData.countryCode}
                onChange={handleChange}
                required
                className="w-24 border border-gray-300 rounded-lg px-3 py-3 text-center outline-none focus:ring-2 focus:ring-blue-500"
              />

              <input
                name="mobile"
                type="tel"
                placeholder="Mobile Number"
                value={formData.mobile}
                onChange={handleChange}
                required
                className="flex-1 border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
              />

            </div>

            {/* Channel Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Receive code via:
              </label>

              <div className="flex gap-3">

                <button
                  type="button"
                  onClick={() => setChannel("sms")}
                  className={`flex-1 py-2.5 rounded-lg font-semibold border-2 transition ${
                    channel === "sms"
                      ? "border-blue-600 bg-blue-50 text-blue-700"
                      : "border-gray-300 text-gray-600 hover:border-gray-400"
                  }`}
                >
                  📱 SMS
                </button>

                <button
                  type="button"
                  onClick={() => setChannel("whatsapp")}
                  className={`flex-1 py-2.5 rounded-lg font-semibold border-2 transition ${
                    channel === "whatsapp"
                      ? "border-green-600 bg-green-50 text-green-700"
                      : "border-gray-300 text-gray-600 hover:border-gray-400"
                  }`}
                >
                  💬 WhatsApp
                </button>

              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loading ? "Processing..." : "Register & Send OTP"}
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
              placeholder="Enter 6-digit code"
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
              {loading ? "Verifying..." : "Verify & Unlock Books"}
            </button>

            {/* Channel Switcher */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Didn't receive the code? Try:
              </label>

              <div className="flex gap-3">

                <button
                  type="button"
                  onClick={() => handleChannelSwitch("sms")}
                  disabled={resending || loading}
                  className={`flex-1 py-2 rounded-lg font-semibold border-2 transition text-sm disabled:opacity-50 ${
                    channel === "sms"
                      ? "border-blue-600 bg-blue-50 text-blue-700"
                      : "border-gray-300 text-gray-600 hover:border-gray-400"
                  }`}
                >
                  📱 SMS
                </button>

                <button
                  type="button"
                  onClick={() => handleChannelSwitch("whatsapp")}
                  disabled={resending || loading}
                  className={`flex-1 py-2 rounded-lg font-semibold border-2 transition text-sm disabled:opacity-50 ${
                    channel === "whatsapp"
                      ? "border-green-600 bg-green-50 text-green-700"
                      : "border-gray-300 text-gray-600 hover:border-gray-400"
                  }`}
                >
                  💬 WhatsApp
                </button>

              </div>
            </div>

            {/* Resend Button with Cooldown */}
            <button
              type="button"
              onClick={handleResendOTP}
              disabled={resending || loading || cooldown > 0}
              className="w-full text-blue-600 font-semibold hover:underline disabled:opacity-50"
            >
              {resending
                ? "Sending..."
                : cooldown > 0
                ? `Resend code in ${cooldown}s`
                : "Resend Code"}
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

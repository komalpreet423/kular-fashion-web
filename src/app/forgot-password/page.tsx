"use client";

import { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { apiBaseUrl } from "@/config";
import { useRouter } from "next/navigation";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      router.replace("/");
    }
  }, []);

  const validateEmail = (value: string) => {
    if (!value.trim()) return "Please enter your email.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "Please enter a valid email.";
    return "";
  };

  useEffect(() => {
    if (submitted) {
      setError(validateEmail(email));
    }
  }, [email, submitted]);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);

    const currentError = validateEmail(email);
    setError(currentError);

    if (currentError) return;

    setLoading(true);

    try {
      const res = await fetch(`${apiBaseUrl}send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Something went wrong.");
        return;
      }

      toast.success(data.message || "OTP sent successfully!");
      setEmail("");
      setSubmitted(false);

      localStorage.setItem("otpEmail", email);
      
      setTimeout(() => {
        router.push("/verify-otp");
      }, 1500);
    } catch (err) {
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-gray-100">
      <ToastContainer position="top-center" />
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-xl p-10">
        <h1 className="text-4xl font-bold text-center text-gray-800 mb-8">Forgot Password</h1>

        <form onSubmit={handleReset} className="space-y-6">
          <div>
            <label className="block text-lg font-medium text-gray-700 mb-2">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-5 py-3 border border-gray-300 rounded-xl shadow-sm text-base focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              placeholder="Enter your registered email"
            />
            {submitted && error && <p className="text-sm text-red-600 mt-1">{error}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-xl font-semibold text-lg cursor-pointer border border-transparent transition-all duration-300 ease-in-out ${
              loading
                ? "bg-gray-400 text-white cursor-not-allowed"
                : "bg-[var(--primary)] text-white hover:bg-white hover:text-[var(--primary)] hover:border-[var(--primary)]"
            }`}
          >
            {loading ? "Sending..." : "Send OPT"}
          </button>
        </form>

        <p className="mt-8 text-center text-base text-gray-600">
          Remembered your password?{" "}
          <a href="/login" className="text-[var(--primary)] hover:underline font-medium">
            Back to Login
          </a>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;

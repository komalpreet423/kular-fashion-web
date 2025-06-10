"use client";

import { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import { useRouter } from "next/navigation";
import { apiBaseUrl } from "@/config";
import axios from "axios";

const VerifyOtp = () => {
  const [otp, setOtp] = useState("");
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
  useEffect(() => {
    const storedEmail = localStorage.getItem("otpEmail");
    if (storedEmail) {
      setEmail(storedEmail);
    } else {
      router.replace("/");
    }
  }, []);

  const validateOtp = (value: string) => {
    if (!value.trim()) return "Please enter OTP.";
    if (!/^\d{6}$/.test(value)) return "OTP must be 6 digits.";
    return "";
  };
  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);

    const currentError = validateOtp(otp);
    setError(currentError);
    if (currentError) return;

    setLoading(true);
    try {
      const res = await axios.post(`${apiBaseUrl}verify-otp`, {
        email,
        otp,
      });
      const data = res.data;
      if (res.status < 200 || res.status >= 300) {
        toast.error(data.message || "OTP verification failed.");
        return;
      }
      toast.success("OTP verified successfully!");
      setTimeout(() => {
        router.push("/reset-password");
      }, 1500);
    } catch (err: any) {
      const data = err.response?.data;
      toast.error(data?.message || "OTP verification failed.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-gray-100">
      <ToastContainer position="top-center" />
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-xl p-10">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
          Verify OTP
        </h1>

        <form onSubmit={handleVerify} className="space-y-6">
          <input
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            className="w-full px-5 py-3 border border-gray-300 rounded-xl shadow-sm text-base focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            placeholder="Enter the 6-digit OTP"
          />
          {submitted && error && (
            <p className="text-sm text-red-600 mt-1">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-xl font-semibold text-lg cursor-pointer border border-transparent transition-all duration-300 ease-in-out ${
              loading
                ? "bg-gray-400 text-white cursor-not-allowed"
                : "bg-[var(--primary)] text-white hover:bg-white hover:text-[var(--primary)] hover:border-[var(--primary)]"
            }`}
          >
            {loading ? "Verifying..." : "Verify OTP"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default VerifyOtp;

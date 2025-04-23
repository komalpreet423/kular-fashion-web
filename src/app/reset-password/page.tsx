"use client";

import { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { apiBaseUrl } from "@/config";

const ResetPassword = () => {
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<{ newPassword?: string; confirmPassword?: string }>({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      router.replace("/");
    }
  }, []);

  useEffect(() => {
    const storedEmail = localStorage.getItem("otpEmail");
    if (storedEmail){
        setEmail(storedEmail);
    }else{
        router.replace("/");
    }
  }, []);

  // Real-time validation
  useEffect(() => {
    if (submitted) {
      setErrors({
        newPassword: validatePassword(newPassword),
        confirmPassword: validateConfirmPassword(newPassword, confirmPassword),
      });
    }
  }, [newPassword, confirmPassword]);

  const validatePassword = (password: string) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;
    if (!password) return "Please enter your new password.";
    if (!regex.test(password)) {
      return "Password must be at least 6 characters, with uppercase, lowercase, digit, and special character.";
    }
    return "";
  };

  const validateConfirmPassword = (password: string, confirm: string) => {
    if (!confirm) return "Please confirm your password.";
    if (password !== confirm) return "Passwords do not match.";
    return "";
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);

    const newPasswordError = validatePassword(newPassword);
    const confirmPasswordError = validateConfirmPassword(newPassword, confirmPassword);

    setErrors({ newPassword: newPasswordError, confirmPassword: confirmPasswordError });

    if (newPasswordError || confirmPasswordError) return;

    setLoading(true);
    try {
      const res = await fetch(`${apiBaseUrl}reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          new_password: newPassword,
          confirm_password: confirmPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Something went wrong.");
        return;
      }

      toast.success("Password reset successfully!");
      localStorage.removeItem("otpEmail");
      setTimeout(() => {
        router.push("/login");
      }, 2000);
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
        <h1 className="text-4xl font-bold text-center text-gray-800 mb-8">Reset Password</h1>

        <form onSubmit={handleResetPassword} className="space-y-6">
          {/* New Password */}
          <div>
            <label className="block text-lg font-medium text-gray-700 mb-2">New Password</label>
            <div className="relative">
              <input
                type={showNew ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-5 py-3 border border-gray-300 rounded-xl shadow-sm text-base focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                placeholder="Enter new password"
              />
              <div
                className="absolute right-4 top-1/2 transform -translate-y-1/2 cursor-pointer"
                onClick={() => setShowNew(!showNew)}
              >
                {showNew ? <EyeOff size={20} /> : <Eye size={20} />}
              </div>
            </div>
            {submitted && errors.newPassword && <p className="text-sm text-red-600 mt-1">{errors.newPassword}</p>}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-lg font-medium text-gray-700 mb-2">Confirm Password</label>
            <div className="relative">
              <input
                type={showConfirm ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-5 py-3 border border-gray-300 rounded-xl shadow-sm text-base focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                placeholder="Confirm your password"
              />
              <div
                className="absolute right-4 top-1/2 transform -translate-y-1/2 cursor-pointer"
                onClick={() => setShowConfirm(!showConfirm)}
              >
                {showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
              </div>
            </div>
            {submitted && errors.confirmPassword && (
              <p className="text-sm text-red-600 mt-1">{errors.confirmPassword}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-xl font-semibold text-lg cursor-pointer border border-transparent transition-all duration-300 ease-in-out ${
              loading
                ? "bg-gray-400 text-white cursor-not-allowed"
                : "bg-[var(--primary)] text-white hover:bg-white hover:text-[var(--primary)] hover:border-[var(--primary)]"
            }`}
          >
            {loading ? "Updating Password..." : "Reset Password"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiBaseUrl } from "@/config";
import { toast, ToastContainer } from "react-toastify";
import axios from "axios";

const CreateAccountPage = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    phoneNumber?: string;
  }>({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      router.replace("/");
    }
  }, []);

  const validateFields = () => {
    const newErrors: typeof errors = {};

    if (!name.trim()) newErrors.name = "Please enter your full name.";

    if (!email.trim()) {
      newErrors.email = "Please enter your email address.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email address.";
    }
    if (!phoneNumber.trim()) {
      newErrors.phoneNumber = "Please enter your phone number.";
    } else if (!/^\d{10}$/.test(phoneNumber)) {
      newErrors.phoneNumber = "Phone number must be 10 digits.";
    }

    if (!password.trim()) {
      newErrors.password = "Please enter a password.";
    } else if (
      !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).{6,}$/.test(password)
    ) {
      newErrors.password =
        "Password must be at least 6 characters and include a capital letter, a lowercase letter, a number, and a special character.";
    }

    return newErrors;
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);

    const validationErrors = validateFields();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) return;

    setLoading(true);
    try {
      const response = await axios.post(`${apiBaseUrl}register`, {
        name,
        email,
        phone_number: phoneNumber,
        password,
      });

      toast.success("Account created successfully!");
      setName("");
      setEmail("");
      setPhoneNumber("");
      setPassword("");
      setSubmitted(false);
      setErrors({});
    } catch (error: any) {
      console.error("Signup error:", error);
      const errorMessage =
        error?.response?.data?.message ||
        "Something went wrong. Please try again.";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-start bg-gray-100  pt-12 pb-10">
      <ToastContainer position="top-center" />
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-xl p-7">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
          Create Account
        </h1>

        <form onSubmit={handleSignup} className="space-y-2">
          {/* Name Field */}
          <div>
            <label className="block text-m font-medium text-gray-700 mb-0.5">
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (submitted) setErrors((prev) => ({ ...prev, name: "" }));
              }}
              className="w-full px-5 py-3 border border-gray-300 rounded-md shadow-sm text-base focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              placeholder="Enter your full name"
            />
            {errors.name && (
              <p className="text-sm text-red-600 mt-1">{errors.name}</p>
            )}
          </div>

          {/* Email Field */}
          <div>
            <label className="block text-m font-medium text-gray-700 mb-0.5">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (submitted) {
                  const val = e.target.value;
                  if (!val.trim()) {
                    setErrors((prev) => ({
                      ...prev,
                      email: "Please enter your email address.",
                    }));
                  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
                    setErrors((prev) => ({
                      ...prev,
                      email: "Please enter a valid email address.",
                    }));
                  } else {
                    setErrors((prev) => ({ ...prev, email: "" }));
                  }
                }
              }}
              className="w-full px-5 py-3 border border-gray-300 rounded-md shadow-sm text-base focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              placeholder="Enter your email"
            />
            {errors.email && (
              <p className="text-sm text-red-600 mt-1">{errors.email}</p>
            )}
          </div>

          {/* Phone Number Field */}
          <div>
            <label className="block text-m font-medium text-gray-700 mb-0.5">
              Phone Number
            </label>
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => {
                setPhoneNumber(e.target.value);
                if (submitted) {
                  const val = e.target.value;
                  if (!val.trim()) {
                    setErrors((prev) => ({
                      ...prev,
                      phoneNumber: "Please enter your phone number.",
                    }));
                  } else if (!/^\d{10}$/.test(val)) {
                    setErrors((prev) => ({
                      ...prev,
                      phoneNumber: "Phone number must be 10 digits.",
                    }));
                  } else {
                    setErrors((prev) => ({ ...prev, phoneNumber: "" }));
                  }
                }
              }}
              className="w-full px-5 py-3 border border-gray-300 rounded-md shadow-sm text-base focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              placeholder="Enter your phone number"
            />
            {errors.phoneNumber && (
              <p className="text-sm text-red-600 mt-1">{errors.phoneNumber}</p>
            )}
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-m font-medium text-gray-700 mb-0.5">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (submitted) {
                  const val = e.target.value;
                  if (!val.trim()) {
                    setErrors((prev) => ({
                      ...prev,
                      password: "Please enter a password.",
                    }));
                  } else if (
                    !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).{6,}$/.test(
                      val
                    )
                  ) {
                    setErrors((prev) => ({
                      ...prev,
                      password:
                        "Password must be at least 6 characters and include a capital letter, a lowercase letter, a number, and a special character.",
                    }));
                  } else {
                    setErrors((prev) => ({ ...prev, password: "" }));
                  }
                }
              }}
              className="w-full px-5 py-3 border border-gray-300 rounded-md shadow-sm text-base focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              placeholder="Create a password"
            />
            {errors.password && (
              <p className="text-sm text-red-600 mt-1">{errors.password}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 mt-4 rounded-xl font-semibold text-lg cursor-pointer transition-all duration-300 ease-in-out 
              ${
                loading
                  ? "bg-gray-400 text-white cursor-not-allowed"
                  : "bg-[var(--primary)] text-white hover:bg-white hover:text-[var(--primary)] hover:border-[var(--primary)] border border-transparent"
              }`}
          >
            {loading ? "Creating Account..." : "Sign Up"}
          </button>
        </form>

        <p className="mt-4 text-center text-base text-gray-600">
          Already have an account?{" "}
          <a
            href="/login"
            className="text-[var(--primary)] hover:underline font-medium"
          >
            Login
          </a>
        </p>
      </div>
    </div>
  );
};

export default CreateAccountPage;

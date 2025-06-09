'use client';

import { useState } from 'react';
import { Mail, User, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { apiBaseUrl } from '@/config';
import axios from 'axios'; 

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateContactForm = (fields: {
    name: string;
    email: string;
    message: string;
  }) => {
    const errors: Record<string, string> = {};
    if (!fields.name.trim()) errors.name = 'Please enter your name.';
    if (!fields.email.trim()) {
      errors.email = 'Please enter your email.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email)) {
      errors.email = 'Please enter a valid email address.';
    }
    if (!fields.message.trim()) errors.message = 'Please enter a message.';
    return errors;
  };

   const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const validationErrors = validateContactForm({ name, email, message });

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});

    try {
      const response = await axios.post(`${apiBaseUrl}contact-us`, {
        name,
        email,
        message,
      });

      console.log('Success:', response.data);
      setSubmitted(true);
      setName('');
      setEmail('');
      setMessage('');

      setTimeout(() => {
        setSubmitted(false);
      }, 2000);
    } catch (err: any) {
      console.error('Axios error:', err);
      const errorMsg =
        err?.response?.data?.message || 'Something went wrong. Please try again.';
      setError(errorMsg);
    }
  };

  return (
    <div className="bg-white-100 flex items-center p-15 justify-center">
      <div className="bg-white rounded-3xl custom-shadow overflow-hidden w-full max-w-4xl grid grid-cols-1 md:grid-cols-2">
        <div className="p-10 flex flex-col justify-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Contact us</h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name Field */}
            <div className="relative">
              <User
                className={`absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 transition-all ${
                  errors.name ? 'top-[22px]' : ''
                }`}
              />
              <input
                type="text"
                placeholder="Name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) setErrors({ ...errors, name: '' });
                }}
                onBlur={() => {
                  if (!name.trim())
                    setErrors((prev) => ({ ...prev, name: 'Please enter your name.' }));
                }}
                className={`w-full pl-10 pr-4 py-3 rounded-full bg-blue-50 text-gray-700 focus:outline-none focus:ring-2 focus:ring-dark-blue-400`}
              />
              {errors.name && <p className="text-red-600 text-sm mt-1 mx-3">{errors.name}</p>}
            </div>

            {/* Email Field */}
            <div className="relative">
              <Mail
                className={`absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 transition-all ${
                  errors.email ? 'top-[24px]' : ''
                }`}
              />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors({ ...errors, email: '' });
                }}
                onBlur={() => {
                  if (!email.trim()) {
                    setErrors((prev) => ({ ...prev, email: 'Please enter your email.' }));
                  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                    setErrors((prev) => ({
                      ...prev,
                      email: 'Please enter a valid email address.',
                    }));
                  }
                }}
                className="w-full pl-10 pr-4 py-3 rounded-full bg-blue-50 text-gray-700 focus:outline-none focus:ring-2 focus:ring-dark-blue-400"
              />
              {errors.email && <p className="text-red-600 text-sm mt-1 mx-3">{errors.email}</p>}
            </div>

            {/* Message Field */}
            <div className="relative">
              <MessageCircle
                className={`absolute left-3 top-4 text-gray-400 transition-all ${
                  errors.message ? 'top-[10px]' : ''
                }`}
              />
              <textarea
                placeholder="Message"
                value={message}
                onChange={(e) => {
                  setMessage(e.target.value);
                  if (errors.message) setErrors({ ...errors, message: '' });
                }}
                onBlur={() => {
                  if (!message.trim())
                    setErrors((prev) => ({ ...prev, message: 'Please enter a message.' }));
                }}
                className="w-full pl-10 pr-4 pt-3 pb-10 rounded-2xl bg-blue-50 text-gray-700 focus:outline-none focus:ring-2 focus:ring-dark-blue-400 min-h-[100px] resize-none"
              />
              {errors.message && (
                <p className="text-red-600 text-sm mt-1 mx-3">{errors.message}</p>
              )}
            </div>

            <div>
              <Button
                type="submit"
                className="w-full rounded-full text-white font-semibold text-base"
                size="lg"
              >
                Send Message
              </Button>
            </div>
          </form>

          {submitted && (
            <p className="mt-6 text-green-600 font-semibold text-center">
              Thanks for reaching out! We'll get back to you soon.
            </p>
          )}

          {error && (
            <p className="mt-4 text-red-600 text-sm text-center">{error}</p>
          )}
        </div>

        <div className="hidden md:flex items-center justify-center bg-white-50">
          <img
            src="/images/contact-us.webp"
            alt="Contact Illustration"
            className="max-w-m"
          />
        </div>
      </div>
    </div>
  );
}

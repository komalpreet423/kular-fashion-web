"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import "react-datepicker/dist/react-datepicker.css";
import DatePicker from "react-datepicker";
import axios from "axios";
import { toast } from "react-toastify";
import { apiBaseUrl } from "@/config";

export default function GiftVoucherPage() {
   const [startDate, setStartDate] = useState<Date | null>(null);
  const [form, setForm] = useState({
    recipientEmail: "",
    senderName: "",
    message: "",
    deliveryDate: null as Date | null,
    amount: "",
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (field: string, value: string | Date | null) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validateForm = () => {
    const newErrors: typeof errors = {};

    if (!form.recipientEmail)
      newErrors.recipientEmail = "Recipient email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.recipientEmail))
      newErrors.recipientEmail = "Invalid email format.";

    if (!form.senderName)
      newErrors.senderName = "Sender name is required.";
    else if (form.senderName.length > 20)
      newErrors.senderName = "Max 20 characters.";

    if (!form.amount || isNaN(+form.amount) || +form.amount < 1)
      newErrors.amount = "Amount must be at least 1.";

    if (!form.message)
      newErrors.message = "Message is required.";
    else if (form.message.length > 200)
      newErrors.message = "Message must be under 200 characters.";

    if (!form.deliveryDate)
      newErrors.deliveryDate = "Delivery date is required.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const userDetails = JSON.parse(localStorage.getItem("userDetails") || "{}");
      const { id: user_id, token } = userDetails;

      await axios.post(
        `${apiBaseUrl}gift-cards/create`,
        {
          recipient_email: form.recipientEmail,
          sender_name: form.senderName,
          message: form.message,
          delivery_date: form.deliveryDate?.toISOString().split("T")[0] || null,
          amount: parseFloat(form.amount),
          transaction_id: `TXN-${Date.now()}`,
          payment_method: "credit_card",
          user_id,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast.success("Gift card created! 🎁");
      setForm({ recipientEmail: "", senderName: "", message: "", deliveryDate: null, amount: "" });
      setErrors({});
    } catch (err: any) {
      console.error(err.response || err.message);
      toast.error("Failed to create gift card. Please check your inputs.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 md:py-12 grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
      <div className="flex justify-center">
        <img src="/images/gift-vocher.png" alt="Gift Card" className="w-full max-w-md rounded-lg" />
      </div>

      <div>
        <h1 className="text-3xl font-semibold mb-2">Gift Voucher</h1>
        <p className="text-sm text-gray-500 mb-6">PRODUCT CODE: GIFT VOUCHER</p>

        <form className="space-y-5" onSubmit={handleSubmit}>
          {[
            { label: "Recipient Email", name: "recipientEmail", type: "email" },
            { label: "Your Name", name: "senderName", type: "text" },
            { label: "Your Message", name: "message", type: "text" },
            { label: "Amount", name: "amount", type: "number", min: 1 },
          ].map(({ label, name, type, min }) => (
            <div key={name}>
              <label className="block mb-1 text-sm font-medium">{label}</label>
              <input
                type={type}
                value={(form as any)[name]}
                min={min}
                onChange={(e) => handleChange(name, e.target.value)}
                className="w-full border rounded-md px-4 py-2"
              />
              {errors[name] && <p className="text-sm text-red-600 mt-1">{errors[name]}</p>}
            </div>
          ))}

          <div>
            <label className="block mb-1 text-sm font-medium">Delivery Date</label>
            <div className="w-full">
              <DatePicker
                selected={form.deliveryDate}
                onChange={(date) => handleChange("deliveryDate", date)}
                className="w-full border rounded-md px-4 py-2"
                dateFormat="dd-MM-yyyy"
              />
              {errors.deliveryDate && (
                <p className="text-sm text-red-600 mt-1">{errors.deliveryDate}</p>
              )}
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Processing..." : "Purchase Voucher"}
          </Button>
        </form>
      </div>
    </div>
  );
}

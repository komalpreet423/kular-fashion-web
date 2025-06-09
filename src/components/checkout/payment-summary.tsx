'use client';

import { useState, useEffect } from 'react';
import { FaCreditCard } from 'react-icons/fa';
import { apiBaseUrl, apiBaseRoot } from "@/config";
import { toast } from "react-toastify";
import axios from "axios";

interface PaymentSummaryProps {
  subtotal: number;
  promoMessage?: string | null;
  setPromoMessage?: (message: string | null) => void;
}

const PaymentSummary = ({ subtotal }: PaymentSummaryProps) => {
  const [promoDropdownOpen, setPromoDropdownOpen] = useState(false);
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [validDiscount, setValidDiscount] = useState('0');
  const [isLoading, setIsLoading] = useState(false);
  const [promoMessage, setPromoMessage] = useState('');
  const [appliedCode, setAppliedCode] = useState<string>('');
  const [total, setTotal] = useState<number>(subtotal);

  useEffect(() => {
    setTotal(subtotal - Number(validDiscount)); // keep it in sync initially
  }, [subtotal, validDiscount]);

  const handleApplyPromo = async () => {
    const userDetailsStr = localStorage.getItem("userDetails");
    const userDetails = userDetailsStr ? JSON.parse(userDetailsStr) : null;
    const user_id = userDetails ? userDetails.id : null;
  
    const token = localStorage.getItem("authToken");
    const isLoggedIn = !!token;

    const cart = JSON.parse(localStorage.getItem('cart') || '[]');

   try {
      let res;
      if (isLoggedIn && user_id) {
        res = await axios.post(`${apiBaseUrl}apply-coupon`, {
          user_id: user_id,
          coupon: promoCodeInput
        }, {
          headers: {
            "Content-Type": "application/json",
          }
        });
      } else {
        res = await axios.post(`${apiBaseUrl}apply-coupon`, {
          cart: cart,
          coupon: promoCodeInput
        }, {
          headers: {
            "Content-Type": "application/json",
          }
        });
      }

      const data = res.data;

      if (res.status === 200) {
        setTotal(Number(data.final_price));
        setValidDiscount(data.discount);
        toast.success(data.message || "Promo code applied successfully!");

        localStorage.setItem('coupon_code', promoCodeInput);
        localStorage.setItem('coupon_discount', (data.discount));
        localStorage.setItem('final_after_coupon_code', data.final_price);
      } else {
        setTotal(subtotal);
        setValidDiscount('0.00');
        toast.error(data.message || "Failed to apply promo code.");

        localStorage.setItem('coupon_code', '');
        localStorage.setItem('coupon_discount', '0');
        localStorage.setItem('final_after_coupon_code', (subtotal.toFixed(2)).toString());
      }
    } catch (err: any) {
      localStorage.setItem('coupon_code', '');
      localStorage.setItem('coupon_discount', '0');
      localStorage.setItem('final_after_coupon_code', subtotal.toString());

      console.error("Error applying coupon code:", err);
      toast.error("Something went wrong. Please try again later.");
    }
  };

  const getButtonLabel = () => {
    if (isLoading) return 'Applying...';
    if (
      appliedCode &&
      appliedCode === promoCodeInput.toLowerCase() &&
      Number(validDiscount) > 0
    )
      return 'Applied';
    return 'Apply';
  };

  useEffect(() => {
    const couponCode = localStorage.getItem('coupon_code');
    const couponDiscount = localStorage.getItem('coupon_discount');
    const finalAfterCouponCode = localStorage.getItem('final_after_coupon_code');

    setPromoCodeInput(couponCode || '');
    setPromoDropdownOpen(!!couponCode);

    setValidDiscount(couponDiscount ? couponDiscount : '0.00');
    setTotal(finalAfterCouponCode && Number(finalAfterCouponCode) > 0 ? Number(finalAfterCouponCode) : subtotal);
  }, [promoCodeInput]);

  const handlePromoCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPromoCodeInput(e.target.value);
    localStorage.setItem("coupon_code", e.target.value);
    localStorage.setItem('coupon_discount', '0');
    localStorage.setItem('final_after_coupon_code', subtotal.toString());

    setPromoMessage("");
    setValidDiscount('0.00');
  };

  return (
    <div className="border-t p-4 bg-white sticky bottom-0 w-full">
      {/* Promo Code Section */}
      <div className="mb-4">
        <div
          className="flex items-center justify-between text-sm font-medium text-primary cursor-pointer mb-3 mt-6"
          onClick={() => setPromoDropdownOpen(!promoDropdownOpen)}
        >
          <div className="flex items-center space-x-2">
            <FaCreditCard className="text-primary" />
            <span>Add Promo Code / Gift Card</span>
          </div>
          <span className="text-xs">{promoDropdownOpen ? '▲' : '▼'}</span>
        </div>

        {promoDropdownOpen && (
          <div className="flex flex-col gap-2 mt-2">
            <div className="flex gap-2">
              <input
                type="text"
                value={promoCodeInput}
                onChange={handlePromoCodeChange}
                placeholder="Enter your code"
                className="border px-3 py-2 rounded w-full text-sm"
              />
              <button
                onClick={handleApplyPromo}
                disabled={!promoCodeInput.trim() || isLoading}
                className={`px-4 py-2 rounded text-sm font-medium transition ${
                  !promoCodeInput.trim()
                    ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                    : 'bg-primary text-white hover:cursor-pointer'
                }`}
              >
                {getButtonLabel()}
              </button>
            </div>
            {promoMessage && (
              <p className="text-sm text-red-600">{promoMessage}</p>
            )}
          </div>
        )}
      </div>

      {/* Summary Section */}
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span>Subtotal:</span>
          <span>€{subtotal.toFixed(2)}</span>
        </div>
        {Number(validDiscount) > 0 && (
          <div className="flex justify-between text-green-600">
            <span>Discount:</span>
            <span>-€{validDiscount}</span>
          </div>
        )}
        <div className="flex justify-between font-semibold text-base">
          <span>Total:</span>
          <span>€{total.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};

export default PaymentSummary;

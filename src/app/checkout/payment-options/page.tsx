"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const PaymentOptions = () => {
  const [selectedPayment, setSelectedPayment] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("selectedPaymentMethod");
    if (stored) {
      setSelectedPayment(stored);
    }
  }, []);

  const handlePaymentChange = (method: string) => {
    setSelectedPayment(method);
    localStorage.setItem("selectedPaymentMethod", method);
  };

  return (
    <div className="border p-4 rounded-md shadow-sm bg-gray-100">
      <h2 className="text-xl font-semibold border-b pb-2">Payment Option</h2>
      <div className="mt-3 space-y-3">
        <Card
          className={`cursor-pointer ${
            selectedPayment === "cod" ? "border-primary bg-white" : "bg-white"
          } p-2`}
          onClick={() => handlePaymentChange("cod")}
        >
          <CardContent className="p-3">
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                name="payment"
                value="cod"
                checked={selectedPayment === "cod"}
                onChange={() => handlePaymentChange("cod")}
              />
              <span className="font-medium">Cash On Delivery</span>
            </label>
          </CardContent>
        </Card>

        <Card
          className={`cursor-pointer ${
            selectedPayment === "card" ? "border-primary bg-white" : "bg-white"
          } p-2`}
          onClick={() => handlePaymentChange("card")}
        >
          <CardContent className="p-3">
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                name="payment"
                value="card"
                checked={selectedPayment === "card"}
                onChange={() => handlePaymentChange("card")}
              />
              <span className="font-medium">Credit or Debit Card</span>
            </label>

            {selectedPayment === "card" && (
              <div className="mt-3 space-y-2">
                <Input type="text" placeholder="Enter Credit & Debit Card Number" />
                <div className="grid grid-cols-2 gap-2">
                  <Input type="text" placeholder="Expiry Date" />
                  <Input type="text" placeholder="CVV Number" />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="secondary">Cancel</Button>
                  <Button>Use This Card</Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PaymentOptions;

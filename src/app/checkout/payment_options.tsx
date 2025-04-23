"use client";

import { useState } from "react";

const PaymentOptions = () => {
    const [selectedPayment, setSelectedPayment] = useState<string | null>(null);

    return (
        <div className="border p-4 rounded-md shadow-sm bg-gray-100">
            <h2 className="text-xl font-semibold border-b pb-2">Payment Option</h2>
            <div className="mt-3 space-y-3">
                {/* Cash On Delivery */}
                <div className="border rounded-md p-3 bg-white">
                    <label className="flex items-center cursor-pointer space-x-2">
                        <input 
                            type="radio" 
                            name="payment" 
                            value="cod" 
                            checked={selectedPayment === "cod"}
                            onChange={() => setSelectedPayment("cod")}
                        />
                        <span className="font-medium">Cash On Delivery</span>
                    </label>
                </div>

                {/* Credit or Debit Card */}
                <div className={`border rounded-md ${selectedPayment === "card" ? "border-primary bg-white" : "bg-white"} p-3`}>
                    <label className="flex items-center cursor-pointer space-x-2" onClick={() => setSelectedPayment("card")}>
                        <input 
                            type="radio" 
                            name="payment" 
                            value="card" 
                            checked={selectedPayment === "card"}
                            onChange={() => setSelectedPayment("card")}
                        />
                        <span className="font-medium">Credit or Debit Card</span>
                    </label>

                    {selectedPayment === "card" && (
                        <div className="mt-3 space-y-2">
                            <input 
                                type="text" 
                                placeholder="Enter Credit & Debit Card Number" 
                                className="w-full border p-2 rounded-md"
                            />
                            <div className="grid grid-cols-2 gap-2">
                                <input type="text" placeholder="Expiry Date" className="border p-2 rounded-md w-full" />
                                <input type="text" placeholder="CVV Number" className="border p-2 rounded-md w-full" />
                            </div>
                            <div className="flex justify-end space-x-2">
                                <button className="px-4 py-2 border rounded-md bg-gray-200">Cancel</button>
                                <button className="px-4 py-2 rounded-md bg-primary text-white">Use This Card</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PaymentOptions;

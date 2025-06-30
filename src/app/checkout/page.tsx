"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DeliveryAddresses from "./components/DeliveryAddresses";
import PaymentOptions from "./components/PaymentOptions";
import OrderSummary from "./components/OrderSummary";

const CheckoutPage = () => {
    const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null);
      const [isCartValidated, setIsCartValidated] = useState(false);
      const router = useRouter();

        useEffect(() => {
    const token = localStorage.getItem("authToken");
    const cart = localStorage.getItem("cart");

    if (!token && (!cart || JSON.parse(cart).cartItems?.length === 0)) {
      router.push("/");
    } else {
      setIsCartValidated(true);
    }
  }, []);

    // Handle guest address selection from iframe
    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            if (event.data.type === 'addressSelected') {
                setSelectedAddressId(event.data.addressId);
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, []);

    // Load initial selections
    useEffect(() => {
        setSelectedAddressId(localStorage.getItem("selectedAddressId"));
        setSelectedPaymentMethod(localStorage.getItem("selectedPaymentMethod"));
    }, []);

    const handlePaymentSelect = (method: string) => {
        setSelectedPaymentMethod(method);
        localStorage.setItem("selectedPaymentMethod", method);
    };
    
  if (!isCartValidated) {
    return null; // Or a loading spinner if you prefer
  }


    return (
        <div className="container mx-auto px-4 py-8 flex flex-col md:flex-row gap-6">
            <div className="md:w-2/3 space-y-6">
                <DeliveryAddresses 
                    onAddressSelect={(id) => {
                        setSelectedAddressId(id);
                        localStorage.setItem("selectedAddressId", id);
                    }}
                    selectedAddressId={selectedAddressId}
                />
                <PaymentOptions 
                    onPaymentSelect={handlePaymentSelect}
                    selectedPaymentMethod={selectedPaymentMethod}
                />
            </div>

            <div className="md:w-1/3 border p-4 rounded-md shadow-sm">
                <OrderSummary 
                    selectedAddressId={selectedAddressId}
                    selectedPaymentMethod={selectedPaymentMethod}
                />
            </div>
        </div>
    );
};

export default CheckoutPage;
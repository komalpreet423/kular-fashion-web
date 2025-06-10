"use client";

import DeliveryAddresses from "./components/DeliveryAddresses";
import PaymentOptions from "./components/PaymentOptions";
import OrderSummary from "./components/OrderSummary";
const CheckoutPage = () => {
    return (
        <div className="container mx-auto px-4 py-8 flex flex-col md:flex-row gap-6">
            {/* Left Section - Delivery & Payment */}
            <div className="md:w-2/3 space-y-6">
                <DeliveryAddresses />
                <PaymentOptions />
            </div>

            {/* Right Section - Order Summary */}
            <div className="md:w-1/3 border p-4 rounded-md shadow-sm">
                <OrderSummary />
            </div>
        </div>
    );
};

export default CheckoutPage;
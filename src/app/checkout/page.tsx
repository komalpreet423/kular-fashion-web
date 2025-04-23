"use client";

import DeliveryAddresses from "./delivery_addresses";
import PaymentOptions from "./payment_options";
import OrderSummary from "./order_summary";

const CheckoutPage = () => {
    return (
        <div className="container mx-auto px-4 py-8 flex flex-col md:flex-row gap-6">
            {/* Left Section - Delivery & Payment */}
            <div className="md:w-2/3 space-y-6">
                <DeliveryAddresses />
                <PaymentOptions />
            </div>

                <OrderSummary />
        </div>
    );
};

export default CheckoutPage;

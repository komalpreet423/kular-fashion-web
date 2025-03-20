const OrderSummary = () => {
    return (
        <div>
            <h2 className="text-xl font-semibold border-b pb-2">Order Summary</h2>
            <p className="mt-3">Total Amount: ₹2500</p>
            <button className="w-full bg-primary text-white py-3 rounded-md mt-4 border border-primary hover:bg-white hover:text-primary">
                Confirm Order
            </button>
        </div>
    );
};

export default OrderSummary;

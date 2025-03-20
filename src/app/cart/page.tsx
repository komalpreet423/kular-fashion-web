"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronDown, ChevronUp } from "lucide-react";

const CartPage = () => {
    const [cartItems, setCartItems] = useState([
        {
            id: 1,
            name: "Product A",
            image: "/images/temp/product1.jpg",
            size: "M",
            color: "#FF0000",
            originalPrice: 1000,
            costPrice: 800,
            discount: 200,
            quantity: 1,
            selected: true,
        },
        {
            id: 2,
            name: "Product B",
            image: "/images/temp/product2.jpg",
            size: "L",
            color: "#0000FF",
            originalPrice: 1500,
            costPrice: 1200,
            discount: 300,
            quantity: 1,
            selected: true,
        },
    ]);

    const [coupons] = useState([
        { code: "SAVE50", discount: 50, description: "Get ₹50 off on your order" },
        { code: "OFF100", discount: 100, description: "Flat ₹100 discount" },
        { code: "BIGSALE", discount: 150, description: "₹150 off on purchase above ₹1000" },
    ]);

    const [couponInput, setCouponInput] = useState("");
    const [selectedCoupon, setSelectedCoupon] = useState<string | null>(null);
    const [extraDiscount, setExtraDiscount] = useState(0);
    const [couponNo, setCouponNo] = useState("-");
    const [showCoupons, setShowCoupons] = useState(false);

    const removeItem = (id: number) => {
        setCartItems(cartItems.filter(item => item.id !== id));
    };

    const updateQuantity = (id: number, type: "increase" | "decrease") => {
        setCartItems(cartItems.map(item =>
            item.id === id
                ? { ...item, quantity: type === "increase" ? item.quantity + 1 : Math.max(1, item.quantity - 1) }
                : item
        ));
    };

    const applyCoupon = (code: string, discount: number) => {
        if (selectedCoupon === code) {
            setSelectedCoupon(null);
            setExtraDiscount(0);
            setCouponNo("-");
        } else {
            setSelectedCoupon(code);
            setExtraDiscount(discount);
            setCouponNo(code);
        }
    };

    const selectedItems = cartItems.filter(item => item.selected);
    const totalCost = selectedItems.reduce((sum, item) => sum + item.costPrice * item.quantity, 0);
    const totalDiscount = selectedItems.reduce((sum, item) => sum + item.discount * item.quantity, 0);
    const deliveryCharge = selectedItems.length > 0 ? 50 : 0;
    const finalAmount = totalCost - totalDiscount - extraDiscount + deliveryCharge;

    // Filter coupons based on input
    const filteredCoupons = coupons.filter(coupon => coupon.code.toLowerCase().includes(couponInput.toLowerCase()));

    return (
        <div className="container mx-auto px-4 py-8 flex flex-col md:flex-row gap-6">
            {/* Left Section - Cart Items */}
            <div className="md:w-2/3 order-1">
                <div className="flex justify-between items-center border-b pb-2">
                    <span className="text-lg font-medium">My Cart</span>
                </div>

                {cartItems.length === 0 ? (
                    <p className="text-gray-500 text-center py-10">Your cart is empty.</p>
                ) : (
                    cartItems.map(item => (
                        <div key={item.id} className="flex flex-wrap md:flex-nowrap items-center border p-4 rounded-md shadow-sm">
                            <Image
                                src={item.image}
                                alt={item.name}
                                width={80}
                                height={80}
                                className="rounded-md ml-3 max-w-full h-auto hover:rotate-3 transition-transform duration-300"
                            />

                            <div className="flex-1 ml-4">
                                <h4 className="text-lg font-semibold">{item.name}</h4>
                                <p className="text-sm text-gray-600">Size: {item.size}</p>

                                <div className="flex items-center space-x-2">
                                    <span className="text-sm text-gray-600">Color:</span>
                                    <div className="w-5 h-5 rounded-full border" style={{ backgroundColor: item.color }}></div>
                                </div>

                                <p className="text-gray-500 line-through">₹{item.originalPrice}</p>
                                <p className="text-lg font-bold text-green-600">₹{item.costPrice}</p>
                            </div>

                            <div className="flex items-center space-x-2 mt-2 md:mt-0">
                                <button onClick={() => updateQuantity(item.id, "decrease")} className="bg-gray-200 px-3 py-1 rounded-md hover:bg-gray-300">
                                    -
                                </button>
                                <span className="text-lg font-medium">{item.quantity}</span>
                                <button onClick={() => updateQuantity(item.id, "increase")} className="bg-gray-200 px-3 py-1 rounded-md hover:bg-gray-300">
                                    +
                                </button>
                            </div>

                            <button onClick={() => removeItem(item.id)} className="text-red-500 ml-4 hover:underline">
                                Remove
                            </button>
                        </div>
                    ))
                )}
            </div>

            {/* Right Section - Price Details */}
            <div className="md:w-1/3 border p-4 rounded-md shadow-sm flex flex-col order-2">
                <h2 className="text-xl font-semibold border-b pb-2">Price Details</h2>

                <div className="mt-3">
                    <div className="flex justify-between items-center">
                        <span className="text-gray-700">Coupons</span>
                        <button className="bg-primary text-white px-2 py-1 rounded-md" onClick={() => setShowCoupons(!showCoupons)}>
                            {showCoupons ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                        </button>
                    </div>
                    {showCoupons && (
                        <div className="border p-2 mt-2 rounded-md bg-gray-100">
                            <input
                                type="text"
                                value={couponInput}
                                onChange={(e) => setCouponInput(e.target.value)}
                                placeholder="Enter Coupon Code"
                                className="border p-1 rounded-md w-full text-sm mb-2"
                            />
                            {filteredCoupons.map((coupon) => (
                                <div key={coupon.code} className="p-2 flex justify-between items-center border-b last:border-0">
                                    <div>
                                        <span className="font-medium">{coupon.code}</span>
                                        <p className="text-xs text-gray-500">{coupon.description}</p>
                                    </div>
                                    <button
                                        onClick={() => applyCoupon(coupon.code, coupon.discount)}
                                        className={`px-3 py-1 rounded-md transition-colors duration-200 cursor-pointer 
                                            ${selectedCoupon === coupon.code ? "text-red-500 hover:underline" : "text-primary hover:underline"}`}
                                    >
                                        {selectedCoupon === coupon.code ? "Remove" : "Apply"}
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Price Breakdown */}
                <div className="mt-3 space-y-2">
                    <div className="flex justify-between">
                        <span>Price</span>
                        <span>₹{totalCost}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Applied Coupon</span>
                        <span className="text-green-600">{couponNo}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Discount</span>
                        <span className="text-green-600">-₹{totalDiscount + extraDiscount}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Delivery Charges</span>
                        <span>{deliveryCharge === 0 ? <span className="text-green-600">Free</span> : `₹${deliveryCharge}`}</span>
                    </div>
                    <hr />
                    <div className="flex justify-between text-lg font-semibold">
                        <span>Total Amount</span>
                        <span>₹{finalAmount}</span>
                    </div>
                    {/* ✅ Place Order Button Below Price Details on Mobile */}
                    {cartItems.length > 0 && (
                        <Link href="/checkout">
                            <button className="w-full bg-primary text-white py-3 rounded-md mt-4 border border-primary hover:bg-white hover:text-primary hover:border-primary transition-all duration-300 cursor-pointer">
                                Place Order
                            </button>
                        </Link>
                    )}
                    {/* Savings Description */}
                    <p className="text-green-600 text-sm mt-1 font-medium">
                        🎉 You saved ₹{totalDiscount + extraDiscount} on this order!
                    </p>
                </div>
            </div>
        </div>
    );
};

export default CartPage;

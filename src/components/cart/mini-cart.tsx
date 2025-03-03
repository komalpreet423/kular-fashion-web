"use client";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { BsCart } from "react-icons/bs";
import { AiOutlineDelete } from "react-icons/ai";
import { motion } from "framer-motion";
import { useState } from "react";
import QuantityBox from "@/components/cart/quantity-box";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { GrLock } from "react-icons/gr";

interface CartItem {
    id: number;
    name: string;
    price: number;
    quantity: number;
    image: string;
    brand: string;
}

const MiniCart: React.FC = () => {
    const [cartItems, setCartItems] = useState<CartItem[]>([{
        id: 1, name: "Product 1", price: 49.99, quantity: 1, image: "/images/temp/product1.jpg", brand: "Brand A"
    }, {
        id: 2, name: "Product 2", price: 59.99, quantity: 2, image: "/images/temp/product2.jpg", brand: "Brand B"
    }]);

    const updateQuantity = (id: number, newQuantity: number) => {
        setCartItems((prevItems) =>
            prevItems.map((item) =>
                item.id === id ? { ...item, quantity: Math.max(1, newQuantity) } : item
            )
        );
    };

    return (
        <Sheet>
            <SheetTrigger asChild>
                <button className="relative cursor-pointer">
                    <BsCart size={24} className="text-gray-700" />
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                        {cartItems.length}
                    </span>
                </button>
            </SheetTrigger>

            <SheetContent side="right" className="w-[90vw] max-w-sm flex flex-col">
                <SheetHeader className="border-b">
                    <SheetTitle>Shopping Cart</SheetTitle>
                    <SheetDescription>Review and manage items in your cart.</SheetDescription>
                </SheetHeader>

                <motion.div className="px-4 py-2 flex-1 overflow-y-auto">
                    <ul className="space-y-2">
                        {cartItems.map((item) => (
                            <motion.li key={item.id} className="flex items-center gap-4 border-b pb-1">
                                <motion.img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded" whileHover={{ scale: 1.1, rotate: 2 }} />
                                <div className="flex-1">
                                    <div className="flex justify-between">
                                        <Link href={`/brands/${item.brand}`} className="block text-sm font-semibold">
                                            {item.brand}
                                        </Link>
                                        <motion.button whileHover={{ scale: 1.2 }} className="cursor-pointer text-gray-400 hover:text-gray-700">
                                            <AiOutlineDelete size={18} />
                                        </motion.button>
                                    </div>
                                    <Link href={`/products/${item.id}`} passHref>
                                        <span className="block text-gray-700 hover:text-gray-900">{item.name}</span>
                                    </Link>
                                    <div className="flex justify-between my-1">
                                        <QuantityBox value={item.quantity} onChange={(newQty) => updateQuantity(item.id, newQty)} />
                                        <span className="block text-gray-900">${item.price.toFixed(2)}</span>
                                    </div>
                                </div>
                            </motion.li>
                        ))}
                    </ul>
                </motion.div>

                <div className="border-t p-4 bg-white sticky bottom-0 w-full">
                    <div className="flex justify-between">
                        <span className="text-lg">Subtotal:</span>
                        <span className="text-gray-900">£{cartItems.reduce((total, item) => total + item.price * item.quantity, 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-lg">Tax:</span>
                        <span className="text-gray-900">£55.99</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-lg">Total:</span>
                        <span className="text-gray-900">£{cartItems.reduce((total, item) => total + item.price * item.quantity, 0).toFixed(2)}</span>
                    </div>
                    <motion.div whileHover={{ scale: 1.05 }}>
                        <Button className="mt-4 w-full rounded-none uppercase"><GrLock size={16} /> Checkout Securely</Button>
                    </motion.div>
                </div>
            </SheetContent>
        </Sheet>
    );
};

export default MiniCart;

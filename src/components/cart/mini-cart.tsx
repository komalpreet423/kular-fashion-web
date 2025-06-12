// src/components/cart/mini-cart.tsx
"use client";
import { useState } from 'react';
import { useCart } from '@/context/cart-context';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { BsCart } from "react-icons/bs";
import { AiOutlineDelete } from "react-icons/ai";
import { motion } from "framer-motion";
import QuantityBox from "@/components/cart/quantity-box";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { GrLock } from "react-icons/gr";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { FaCreditCard } from "react-icons/fa";
import WishlistEmpty from "@/components/cart/cart-empty";
import axios from 'axios';

const MiniCart: React.FC = () => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [promoCodeInput, setPromoCodeInput] = useState("");
  const [promoDropdownOpen, setPromoDropdownOpen] = useState(false);
  
  const {
    cartItems,
    cartCount,
    subTotal,
    discount,
    total,
    removeFromCart,
    updateQuantity,
    applyPromoCode,
  } = useCart();

  const handleCheckout = () => {
    setOpen(false);
    router.push("/checkout");
  };

  const handleUpdateQuantity = async (id: number, newQuantity: number, variant_id: number) => {
    try {
      const currentItem = cartItems.find(item => item.id === id);
      if (!currentItem) {
        toast.error("Item not found in cart");
        return;
      }

      if (newQuantity > currentItem.total_quantity) {
        toast.error(`Only ${currentItem.total_quantity} items available`);
        return;
      }

      await updateQuantity(id, newQuantity, variant_id);
    } catch (err) {
      console.error("Failed to update quantity:", err);
    }
  };

  const handlePromoCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPromoCodeInput(e.target.value);
  };

  const handleApplyPromoCode = async () => {
    await applyPromoCode(promoCodeInput);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button className="relative cursor-pointer">
          <BsCart size={24} className="text-gray-700" />
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
            {cartCount}
          </span>
        </button>
      </SheetTrigger>

      <SheetContent side="right" className="w-[90vw] max-w-sm flex flex-col">
        <SheetHeader className="border-b">
          <SheetTitle>Shopping Cart</SheetTitle>
          <SheetDescription>
            Review and manage items in your cart.
          </SheetDescription>
        </SheetHeader>

        <motion.div className="px-4 py-2 flex-1 overflow-y-auto">
          <ul className="space-y-2">
            {cartItems.length === 0 ? (
              <WishlistEmpty />
            ) : (
              cartItems.map((item) => (
                <motion.li
                  key={item.id}
                  className="flex items-center gap-4 border-b pb-1"
                >
                  <motion.img
                    src={item.image}
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded"
                    whileHover={{ scale: 1.1, rotate: 2 }}
                  />
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <Link
                        href={`/brands/${item.brand}`}
                        className="block text-sm font-semibold"
                      >
                        {item.brand}
                      </Link>
                      <motion.button 
                        whileHover={{ scale: 1.2 }} 
                        className="cursor-pointer text-gray-400 hover:text-gray-700" 
                        onClick={() => removeFromCart(item.id)}
                      >
                        <AiOutlineDelete size={18} />
                      </motion.button>
                    </div>
                    <Link href={`/products/${item.id}`} passHref>
                      <div className="text-gray-700 hover:text-gray-900">
                        <div className="font-medium">{item.name}</div>
                        <div className="text-sm text-gray-500">
                          Color: {item.color}
                        </div>
                        <div className="text-sm text-gray-500">
                          Size: {item.size}
                        </div>
                      </div>
                    </Link>

                    <div className="flex justify-between my-1">
                      <QuantityBox
                        value={item.quantity}
                        min={1}
                        max={item.total_quantity}
                        onChange={(newQty) => handleUpdateQuantity(item.id, newQty, item.variant_id)}
                      />
                      <span className="block text-gray-900">${item.price}</span>
                    </div>
                  </div>
                </motion.li>
              ))
            )}
          </ul>
        </motion.div>

        <div className="border-t p-4 bg-white sticky bottom-0 w-full">
          {/* Promo Code Section */}
          <div 
            className="flex items-center justify-between text-sm font-medium text-primary cursor-pointer mb-3 mt-2" 
            onClick={() => setPromoDropdownOpen(!promoDropdownOpen)}
          >
            <div className="flex items-center space-x-2">
              <FaCreditCard className="text-primary" />
              <span>Add Promo Code / Gift Card</span>
            </div>
            <span className="text-xs">{promoDropdownOpen ? "▲" : "▼"}</span>
          </div>

          {promoDropdownOpen && (
            <div className="mb-4 space-y-1">
              <div className="flex gap-2">
                <input
                  value={promoCodeInput}
                  onChange={handlePromoCodeChange}
                  type="text"
                  className="w-full border p-2 text-sm rounded"
                  placeholder="Enter promo code"
                />
                <Button 
                  onClick={handleApplyPromoCode} 
                  className="py-2 px-4 text-white bg-primary hover:bg-primary-dark"
                >
                  Apply
                </Button>
              </div>
            </div>
          )}
          
          <div className="flex justify-between">
            <span className="text-lg">Subtotal:</span>
            <span className="text-gray-900">£{subTotal.toFixed(2)}</span>
          </div>
          
          {Number(discount) > 0 && (
            <div className="flex justify-between">
              <span className="text-lg">Discount:</span>
              <span className="text-gray-900">£{discount}</span>
            </div>
          )}
          
          <div className="flex justify-between">
            <span className="text-lg">Total:</span>
            <span className="text-gray-900">£{total}</span>
          </div>

          <motion.div whileHover={{ scale: 1.05 }}>
            <Button 
              className="mt-4 w-full rounded-none uppercase" 
              onClick={handleCheckout}
            >
              <GrLock size={16} /> Checkout Securely
            </Button>
          </motion.div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MiniCart;
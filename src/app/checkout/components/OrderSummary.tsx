"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import CartItemCard from '@/components/checkout/cart-item-card';
import PaymentSummary from '@/components/checkout/payment-summary';
import CartButtons from '@/components/checkout/cart-buttons';
import { apiBaseUrl, apiBaseRoot } from "@/config";
import { toast } from "react-toastify";
import axios from 'axios';
import { useCart } from '@/context/cart-context';

interface CartItem {
  id: number;
  name: string;
  color: string;
  size: string;
  price: number;
  variant_id: number;
  quantity: number;
  total_quantity: number;
  image: string;
  brand: string;
}

interface OrderSummaryProps {
  selectedAddressId: string | null;
  selectedPaymentMethod: string | null;
}

const OrderSummary = ({ selectedAddressId, selectedPaymentMethod }: OrderSummaryProps) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [promoMessage, setPromoMessage] = useState<string | null>(null);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const router = useRouter();
  const { clearCart } = useCart();

  useEffect(() => {
    fetchCartItems();
  }, []);

  

  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const fetchCartItems = async () => {
    const user_details_str = localStorage.getItem("userDetails");
    const user_details = user_details_str ? JSON.parse(user_details_str) : null;
    const user_id = user_details ? user_details.id : null;
    const token = localStorage.getItem("authToken");

    try {
      if (token && user_id) {
        // For logged-in users
        const { data: json } = await axios.get(`${apiBaseUrl}cart/show`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const cartItems = json.cart?.cart_items?.map((cartItem: any) => {
          const product = cartItem.variant?.product;
          const imageFile = product?.web_image?.[0];
          const image = imageFile ? `${apiBaseRoot}${imageFile.path}` : "/images/temp/product1.jpg";

          return {
            id: cartItem.id,
            name: product?.name || "Unknown Product",
            color: cartItem.variant?.colors?.color_detail?.name || "Unknown Color",
            size: cartItem.variant?.sizes?.size_detail?.size || "Unknown Size",
            price: product?.price || 0,
            variant_id: cartItem.variant.id,
            quantity: cartItem.quantity || 1,
            image,
            brand: product?.brand?.name || "Unknown Brand",
            total_quantity: cartItem.variant?.total_quantity || 10,
          };
        }) || [];

        setCartItems(cartItems);
      } else {
        // For guest users
        const cart_str = localStorage.getItem("cart");
        if (!cart_str) {
          setCartItems([]);
          return;
        }

        const cart = JSON.parse(cart_str);
        const guestCartItems = Array.isArray(cart.cartItems) ? cart.cartItems : [];

        const formattedCartItems = guestCartItems.map((item: any) => ({
          id: item.id || Math.floor(Math.random() * 1000000),
          name: item.name || "Unknown Product",
          color: item.color || "Unknown Color",
          size: item.size || "Unknown Size",
          price: item.price || 0,
          variant_id: item.variant_id || 0,
          quantity: item.quantity || 1,
          image: item.image ? `${apiBaseRoot}${item.image}` : "/images/temp/product1.jpg",
          brand: item.brand || "Unknown Brand",
          total_quantity: item.total_quantity || 10,
        }));

        setCartItems(formattedCartItems);
      }
    } catch (err) {
      console.error("Error fetching cart:", err);
      setCartItems([]);
    }
  };

  const handlePlaceOrder = async () => {
    const addressId = selectedAddressId || localStorage.getItem("selectedAddressId");
    const paymentMethod = selectedPaymentMethod || localStorage.getItem("selectedPaymentMethod");

    if (!addressId || !paymentMethod) {
      toast.warning("Please select both delivery address and payment method");
      return;
    }
    setIsPlacingOrder(true);

    try {
      const userDetails = JSON.parse(localStorage.getItem("userDetails") || "null");
      const cart = JSON.parse(localStorage.getItem("cart") || "{}");
      const couponCode = localStorage.getItem("coupon_code") || null;
       const addressId = selectedAddressId || JSON.parse(localStorage.getItem("selectedAddressId") || "null");

      const payload = {
        user_id: userDetails?.id || null,
        delivery_address_id: selectedAddressId,
        payment_mode: selectedPaymentMethod,
        coupon_code: couponCode,
      };

      if (!userDetails) {
        payload.cart_items = cart.cartItems?.map((item: any) => ({
          variant_id: item.variant_id,
          quantity: item.quantity,
          price: item.price,
        })) || [];
      }

      const { data: result } = await axios.post(`${apiBaseUrl}place-order`, payload);
     toast.success("Order placed and confirmation email sent!");

      try {
        await axios.post(`${apiBaseUrl}send-order-email`, {
          order_id: result.order_id,
        });
      } catch (emailError: any) {
        console.error("Email sending failed:", emailError);
        toast.warn("Order placed but email failed to send.");
      }
      
      // Clear cart and redirect
      localStorage.removeItem("cart");
      localStorage.removeItem("coupon_code");
      setCartItems([]); 
        clearCart(); 
      router.push(`/orders/${result.order_id}`);

    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Order failed");
    } finally {
      setIsPlacingOrder(false);
    }
  };

  return (
    <div className="flex flex-col px-4 pt-4 bg-white max-h-[90vh]">
      <h2 className="text-xl font-semibold border-b pb-2">Order Summary</h2>
      {cartItems.length === 0 ? (
        <p className="text-center py-10 text-gray-500">Your cart is empty.</p>
      ) : (
        <div className="mt-4 overflow-y-auto max-h-[300px] pr-2 space-y-4">
          {cartItems.map((product) => (
            <CartItemCard key={`${product.id}-${product.variant_id}`} {...product} />
          ))}
        </div>
      )}
      <PaymentSummary
        subtotal={subtotal}
        promoMessage={promoMessage}
        setPromoMessage={setPromoMessage}
      />
      <CartButtons
        productsLength={cartItems.length}
        onPlaceOrder={handlePlaceOrder}
        isPlacingOrder={isPlacingOrder}
        isAddressAndPaymentSelected={!!selectedAddressId && !!selectedPaymentMethod}
      />
    </div>
  );
};

export default OrderSummary;
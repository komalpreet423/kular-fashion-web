// src/context/cart-context.tsx
"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiBaseUrl, apiBaseRoot } from '@/config';
import { toast } from 'react-toastify';

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

interface CartContextType {
  cartItems: CartItem[];
  cartCount: number;
  subTotal: number;
  discount: string;
  total: string;
  refreshCart: () => Promise<void>;
  addToCart: (product: any, variant_id: number, quantity: number) => Promise<void>;
  removeFromCart: (itemId: number) => Promise<void>;
  updateQuantity: (itemId: number, newQuantity: number) => Promise<void>;
  applyPromoCode: (code: string) => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartCount, setCartCount] = useState(0);
  const [subTotal, setSubTotal] = useState(0);
  const [discount, setDiscount] = useState('0.00');
  const [total, setTotal] = useState('0.00');

  const calculateCartTotals = (items: CartItem[]) => {
    const calculatedSubTotal = items.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
    setSubTotal(calculatedSubTotal);
    
    const couponDiscount = localStorage.getItem('coupon_discount') || '0.00';
    const finalAfterCouponCode = localStorage.getItem('final_after_coupon_code');
    
    setDiscount(couponDiscount);
    setTotal(finalAfterCouponCode && Number(finalAfterCouponCode) > 0 
      ? Number(finalAfterCouponCode).toFixed(2).toString() 
      : calculatedSubTotal.toFixed(2).toString()
    );
  };

  const fetchCartItems = async () => {
    const user_details_str = localStorage.getItem("userDetails");
    const user_details = user_details_str ? JSON.parse(user_details_str) : null;
    const user_id = user_details ? user_details.id : null;
  
    const token = localStorage.getItem("authToken");
    const isLoggedIn = !!token;

    try {
      let items: CartItem[] = [];
      
      if (isLoggedIn && user_id) {
        const res = await fetch(`${apiBaseUrl}cart/show`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const json = await res.json();
        items = json.cart?.cart_items?.map((cartItem: any) => {
          const product = cartItem.variant?.product;
          const variantColorId = cartItem.variant?.product_color_id;
          const matchingImage = product?.web_image?.find(
          (img: any) => img.product_color_id === variantColorId
        );
          const imageFile = matchingImage || product?.web_image?.[0]
          const image = imageFile
            ? `${apiBaseRoot}${imageFile.path}`
            : "/images/default-product.png";

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
      } else {
        const cart_str = localStorage.getItem("cart");
        const cart = cart_str ? JSON.parse(cart_str) : null;
        const cart_items = Array.isArray(cart?.cartItems) ? cart.cartItems : [];

        items = cart_items?.map((cartItem: any) => {
          const imageFile = cartItem?.image;
          const image = imageFile
            ? `${apiBaseRoot}${imageFile}`
            : "/images/default-product.png";

          return {
            id: cartItem.id,
            name: cartItem?.name || "Unknown Product",
            color: cartItem?.color || "Unknown Color",
            size: cartItem?.size || "Unknown Size",
            price: cartItem?.price || 0,
            variant_id: cartItem.variant_id,
            quantity: cartItem.quantity || 1,
            image,
            brand: cartItem?.brand || "Unknown Brand",
            total_quantity: cartItem?.total_quantity || 10,
          };
        }) || [];
      }

      setCartItems(items);
      setCartCount(items.length);
      calculateCartTotals(items);
    } catch (err) {
      console.error("Error fetching cart:", err);
    }
  };

  const addToCart = async (product: any, variant_id: number, quantity: number) => {
    const user_details_str = localStorage.getItem("userDetails");
    const user_details = user_details_str ? JSON.parse(user_details_str) : null;
    const user_id = user_details ? user_details.id : null;

    const token = localStorage.getItem("authToken");
    const isLoggedIn = !!token;

    try {
      if (isLoggedIn && user_id) {
        const res = await fetch(`${apiBaseUrl}cart/add`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            user_id,
            variant_id,
            quantity,
          }),
        });

        if (!res.ok) {
          throw new Error("Failed to add to cart");
        }
      } else {
        const localCartStr = localStorage.getItem("cart");
        let localCart = localCartStr
          ? JSON.parse(localCartStr)
          : {
              user_id: null,
              coupon_id: null,
              note: null,
              cartItems: [],
            };

        const existingItemIndex = localCart.cartItems.findIndex(
          (item: any) => item.variant_id === variant_id
        );

        if (existingItemIndex !== -1) {
          localCart.cartItems[existingItemIndex].quantity += quantity;
        } else {
          const colorDetail = product.colors.find((c: any) => c.id === product.selectedColor?.id)?.detail.name;
          const sizeDetail = product.sizes.find((s: any) => s.id === product.selectedSize?.id)?.detail.name;
          const variantData = product.variants.find(
            (v: any) => v.product_color_id === product.selectedColor?.id && v.product_size_id === product.selectedSize?.id
          );
          const totalQuantity = variantData?.quantity ?? 0;
          const imagePath = product.images?.[0]?.path ?? '';

          const maxId = localCart.cartItems.reduce((max: number, item: any) => Math.max(max, item.id || 0), 0);

          localCart.cartItems.push({
            id: maxId + 1,
            cart_id: null,
            user_id: null,
            variant_id,
            quantity,
            name: product.name,
            color: colorDetail || '',
            size: sizeDetail || '',
            price: product.selectedSize?.price || product.price,
            total_quantity: totalQuantity,
            image: imagePath,
            brand: product.brand.name,
          });
        }

        localStorage.setItem("cart", JSON.stringify(localCart));
      }

      await fetchCartItems();
      toast.success(`${product.name} added to cart successfully!`);
    } catch (err) {
      console.error("Error adding to cart:", err);
      toast.error("Something went wrong. Please try again after some time.");
    }
  };

  const removeFromCart = async (itemId: number) => {
    const userDetailsStr = localStorage.getItem("userDetails");
    const userDetails = userDetailsStr ? JSON.parse(userDetailsStr) : null;
    const user_id = userDetails ? userDetails.id : null;
  
    const token = localStorage.getItem("authToken");
    const isLoggedIn = !!token;
  
    try {
      if (isLoggedIn && user_id) {
        const res = await fetch(`${apiBaseUrl}cart/remove/${itemId}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
  
        if (!res.ok) {
          throw new Error("Failed to remove item from cart.");
        }
      } else {
        const localCartStr = localStorage.getItem("cart");
        let localCart = localCartStr
          ? JSON.parse(localCartStr)
          : {
              user_id: null,
              coupon_id: null,
              note: null,
              cartItems: [],
            };
  
        localCart.cartItems = localCart.cartItems.filter(
          (item: any) => item.id !== itemId
        );
  
        localStorage.setItem("cart", JSON.stringify(localCart));
        localStorage.setItem('coupon_code', '');
        localStorage.setItem('coupon_discount', '0.00');
        localStorage.setItem('final_after_coupon_code', '0.00');
      }

      await fetchCartItems();
      toast.success("Item removed from cart.");
    } catch (err) {
      console.error("Error removing cart item:", err);
      toast.error("Something went wrong. Please try again later.");
    }
  };

  const updateQuantity = async (itemId: number, newQuantity: number, variant_id: number) => {
    const userDetailsStr = localStorage.getItem("userDetails");
    const userDetails = userDetailsStr ? JSON.parse(userDetailsStr) : null;
    const user_id = userDetails ? userDetails.id : null;
    const token = localStorage.getItem("authToken");
    const isLoggedIn = !!token;

    try {
      // Validate quantity
      if (newQuantity < 1) {
        throw new Error("Quantity cannot be less than 1");
      }

      if (isLoggedIn && user_id) {
        // API call for logged-in users
        const response = await fetch(`${apiBaseUrl}cart/update`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            cart_item_id: itemId,
            variant_id: variant_id,
            quantity: newQuantity
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to update quantity");
        }
      } else {
        // Local storage update for guests
        const cartStr = localStorage.getItem("cart");
        const cart = cartStr ? JSON.parse(cartStr) : { cartItems: [] };
        
        const itemIndex = cart.cartItems.findIndex((item: any) => item.id === itemId);
        if (itemIndex === -1) {
          throw new Error("Item not found in cart");
        }

        cart.cartItems[itemIndex].quantity = newQuantity;
        localStorage.setItem("cart", JSON.stringify(cart));
      }

      // Refresh cart data
      await fetchCartItems();
      //toast.success("Quantity updated successfully");
    } catch (err) {
      console.error("Update quantity error:", err);
      toast.error(err instanceof Error ? err.message : "Failed to update quantity");
      throw err;
    }
  };

  const applyPromoCode = async (code: string) => {
    const userDetailsStr = localStorage.getItem("userDetails");
    const userDetails = userDetailsStr ? JSON.parse(userDetailsStr) : null;
    const user_id = userDetails ? userDetails.id : null;
  
    const token = localStorage.getItem("authToken");
    const isLoggedIn = !!token;

    try {
      let response;
      
      if (isLoggedIn && user_id) {
        response = await fetch(`${apiBaseUrl}apply-coupon`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_id: user_id,
            coupon: code
          }),
        });
      } else {
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        response = await fetch(`${apiBaseUrl}apply-coupon`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            cart: cart,
            coupon: code
          }),
        });
      }
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || "Failed to apply promo code.");
      }
      
      if (response.status === 200) {
        localStorage.setItem('coupon_code', code);
        localStorage.setItem('coupon_discount', data.discount);
        localStorage.setItem('final_after_coupon_code', data.final_price);
        
        await fetchCartItems();
        toast.success(data.message || "Promo code applied successfully!");
      } else {
        throw new Error(data.message || "Failed to apply promo code.");
      }
    } catch (err) {
      localStorage.setItem('coupon_code', '');
      localStorage.setItem('coupon_discount', '0');
      localStorage.setItem('final_after_coupon_code', subTotal.toFixed(2).toString());
      
      console.error("Error applying coupon code:", err);
      toast.error(err.message || "Something went wrong. Please try again later.");
      await fetchCartItems();
    }
  };

  useEffect(() => {
    fetchCartItems();
  }, []);
    const clearCart = () => {
    setCartItems([]);
    setCartCount(0);
    setSubTotal(0);
    setDiscount("0.00");
    setTotal("0.00");
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartCount,
        subTotal,
        discount,
        total,
        refreshCart: fetchCartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        applyPromoCode,
          clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
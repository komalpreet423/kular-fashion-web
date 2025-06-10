"use client";
import { useEffect, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { BsCart } from "react-icons/bs";
import { AiOutlineDelete } from "react-icons/ai";
import { motion } from "framer-motion";
import QuantityBox from "@/components/cart/quantity-box";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { GrLock } from "react-icons/gr";
import { useRouter } from "next/navigation";
import { apiBaseUrl, apiBaseRoot } from "@/config";
import { toast } from "react-toastify";
import { FaCreditCard } from "react-icons/fa";
import WishlistEmpty from "@/components/cart/cart-empty";
import axios from "axios";

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

const MiniCart: React.FC = () => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [subTotal, setSubTotal] = useState(0);
  const [total, setTotal] = useState("0.00");
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [promoCodeInput, setPromoCodeInput] = useState("");
  const [promoMessage, setPromoMessage] = useState("");
  const [promoSuccess, setPromoSuccess] = useState(false);
  const [promoDropdownOpen, setPromoDropdownOpen] = useState(false);
  const [discount, setDiscount] = useState("0.00");
  const [buttonText, setButtonText] = useState("Apply");

  useEffect(() => {
    const couponCode = localStorage.getItem("coupon_code");
    if (couponCode) {
      setPromoCodeInput(couponCode);
    }
  }, []);

  const updateQuantity = (
    id: number,
    newQuantity: number,
    variant_id: number,
    delta: number
  ) => {
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id ? { ...item, quantity: Math.max(1, newQuantity) } : item
      )
    );
    changeCartQuantity(variant_id, delta);
  };

  const changeCartQuantity = async (variant_id: number, delta: number) => {
    const userDetailsStr = localStorage.getItem("userDetails");
    const userDetails = userDetailsStr ? JSON.parse(userDetailsStr) : null;
    const user_id = userDetails ? userDetails.id : null;

    const token = localStorage.getItem("authToken");
    const isLoggedIn = !!token;

    try {
      if (isLoggedIn && user_id) {
        const res = await axios.post(
          `${apiBaseUrl}cart/add`,
          {
            user_id,
            variant_id,
            quantity: delta,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        toast.success(`Quantity updated.`);
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
          localCart.cartItems[existingItemIndex].quantity += delta;
        } else {
          localCart.cartItems.push({
            cart_id: null,
            user_id: null,
            variant_id,
            delta,
          });
        }

        localStorage.setItem("cart", JSON.stringify(localCart));
        toast.success(`Quantity updated.`);
      }
    } catch (err) {
      console.error("Error updating cart:", err);
      toast.error("Something went wrong. Please try again after some time.");
    }
  };

  const handleCheckout = () => {
    setOpen(false);
    router.push("/checkout");
  };

  useEffect(() => {
    const fetchCartItems = async () => {
      const user_details_str = localStorage.getItem("userDetails");
      const user_details = user_details_str
        ? JSON.parse(user_details_str)
        : null;
      const user_id = user_details ? user_details.id : null;

      const token = localStorage.getItem("authToken");
      const isLoggedIn = !!token;

      try {
        if (isLoggedIn && user_id) {
          const res = await axios.get(`${apiBaseUrl}cart/show`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          // if (!res.ok) throw new Error("Failed to fetch cart items");

          const json = res.data;

          const cartItems =
            json.cart?.cart_items?.map((cartItem: any) => {
              const product = cartItem.variant?.product;
              const imageFile = product?.web_image?.[0];
              const image = imageFile
                ? `${apiBaseRoot}${imageFile.path}`
                : "/images/default-product.png";

              return {
                id: cartItem.id,
                name: product?.name || "Unknown Product",
                color:
                  cartItem.variant?.colors?.color_detail?.name ||
                  "Unknown Color",
                size:
                  cartItem.variant?.sizes?.size_detail?.size || "Unknown Size",
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
          // localStorage.removeItem("cart");
          const cart_str = localStorage.getItem("cart");

          const cart = cart_str ? JSON.parse(cart_str) : null;
          const cart_items = Array.isArray(cart?.cart_items)
            ? cart.cart_items
            : [];

          const cartItems =
            cart_items?.map((cartItem: any) => {
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

          setCartItems(cartItems);
        }
      } catch (err) {
        console.error("Error fetching cart:", err);
      }
    };

    fetchCartItems();
  }, []);

  const removeCartItem = async (itemId: number) => {
    const userDetailsStr = localStorage.getItem("userDetails");
    const userDetails = userDetailsStr ? JSON.parse(userDetailsStr) : null;
    const user_id = userDetails ? userDetails.id : null;

    const token = localStorage.getItem("authToken");
    const isLoggedIn = !!token;

    try {
      if (isLoggedIn && user_id) {
        await axios.delete(`${apiBaseUrl}cart/remove/${itemId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setCartItems((prevItems) =>
          prevItems.filter((item) => item.id !== itemId)
        );
        toast.success("Item removed from cart.");
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

        const enrichedCartItems = localCart.cartItems.map((item: any) => ({
          ...item,
          image: `${apiBaseRoot}${item.image}`,
        }));

        localStorage.setItem("cart", JSON.stringify(localCart));
        localStorage.setItem("coupon_code", "");
        localStorage.setItem("coupon_discount", "0.00");
        localStorage.setItem("final_after_coupon_code", "0.00");
        setCartItems(enrichedCartItems);
        toast.success("Item removed from cart.");
      }
    } catch (err) {
      console.error("Error removing cart item:", err);
      toast.error("Something went wrong. Please try again later.");
    }
  };

  useEffect(() => {
    const calculatedSubTotal = cartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );

    const couponCode = localStorage.getItem("coupon_code");
    const couponDiscount = localStorage.getItem("coupon_discount");
    const finalAfterCouponCode = localStorage.getItem(
      "final_after_coupon_code"
    );

    setPromoCodeInput(couponCode || "");
    setPromoDropdownOpen(!!couponCode);
    setSubTotal(calculatedSubTotal);

    // Ensure 2 decimal places for discount and total
    setDiscount(couponDiscount ? couponDiscount : "0.00");
    setTotal(
      finalAfterCouponCode && Number(finalAfterCouponCode) > 0
        ? Number(finalAfterCouponCode).toFixed(2).toString()
        : calculatedSubTotal.toFixed(2).toString()
    );
  }, [cartItems, discount]);

  const applyPromoCode = async () => {
    const userDetailsStr = localStorage.getItem("userDetails");
    const userDetails = userDetailsStr ? JSON.parse(userDetailsStr) : null;
    const user_id = userDetails ? userDetails.id : null;

    const token = localStorage.getItem("authToken");
    const isLoggedIn = !!token;

    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
   try {
      if (isLoggedIn && user_id) {
        const res = await axios.post(`${apiBaseUrl}apply-coupon`, {
          user_id: user_id,
          coupon: promoCodeInput
        });
        const data = res.data;
        if (res.status === 200) {
          setTotal(data.final_price);
          setDiscount(data.discount);
          toast.success(data.message || "Promo code applied successfully!");

          localStorage.setItem("coupon_code", promoCodeInput);
          localStorage.setItem("coupon_discount", data.discount);
          localStorage.setItem("final_after_coupon_code", data.final_price);
        } else {
          setTotal(subTotal.toFixed(2).toString());
          setDiscount("0.00");
          toast.error(data.message || "Failed to apply promo code.");

          localStorage.setItem("coupon_code", "");
          localStorage.setItem("coupon_discount", "0");
          localStorage.setItem(
            "final_after_coupon_code",
            subTotal.toFixed(2).toString()
          );
        }
      } else {
         const res = await axios.post(`${apiBaseUrl}apply-coupon`, {
          cart: cart,
          coupon: promoCodeInput
        });

        const data = res.data;

        if (res.status === 200) {
          setTotal(data.final_price);
          setDiscount(data.discount);
          toast.success(data.message || "Promo code applied successfully!");

          localStorage.setItem("coupon_code", promoCodeInput);
          localStorage.setItem("coupon_discount", data.discount);
          localStorage.setItem("final_after_coupon_code", data.final_price);
        } else {
          setTotal(subTotal.toFixed(2).toString());
          setDiscount("0.00");
          toast.error(data.message || "Failed to apply promo code.");

          localStorage.setItem("coupon_code", "");
          localStorage.setItem("coupon_discount", "0");
          localStorage.setItem(
            "final_after_coupon_code",
            subTotal.toFixed(2).toString()
          );
        }
      }
    } catch (err) {
      localStorage.setItem("coupon_code", "");
      localStorage.setItem("coupon_discount", "0");
      localStorage.setItem(
        "final_after_coupon_code",
        subTotal.toFixed(2).toString()
      );

      console.error("Error applying coupon code:", err);
      toast.error("Something went wrong. Please try again later.");
    }
  };

  const handlePromoCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPromoCodeInput(e.target.value);
    localStorage.setItem("coupon_code", e.target.value);
    localStorage.setItem("coupon_discount", "0");
    localStorage.setItem(
      "final_after_coupon_code",
      subTotal.toFixed(2).toString()
    );

    // Reset promo details when the user changes the promo code input
    setPromoMessage("");
    setPromoSuccess(false);
    setButtonText("Apply");
    setDiscount("0.00");
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button className="relative cursor-pointer">
          <BsCart size={24} className="text-gray-700" />
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
            {Array.isArray(cartItems) && cartItems.length > 0
              ? cartItems.length
              : 0}
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
                        onClick={() => removeCartItem(item.id)}
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
                        max={item.total_quantity}
                        onChange={(newQty) =>
                          updateQuantity(
                            item.id,
                            newQty,
                            item.variant_id,
                            newQty - item.quantity
                          )
                        }
                      />
                      <span className="block text-gray-900">${item.price}</span>
                    </div>
                  </div>
                </motion.li>
              ))
            )}
          </ul>
        </motion.div>

        {cartItems.length > 0 && (
          <div className="border-t p-4 bg-white sticky bottom-0 w-full">
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
                    onClick={applyPromoCode}
                    className="py-2 px-4 text-white bg-primary hover:bg-primary-dark"
                  >
                    {buttonText}
                  </Button>
                </div>
                {promoMessage && (
                  <div
                    className={`text-sm ${
                      promoSuccess ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {promoMessage}
                  </div>
                )}
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
        )}
      </SheetContent>
    </Sheet>
  );
};

export default MiniCart;

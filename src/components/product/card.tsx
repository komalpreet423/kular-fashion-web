"use client";

import Image from "next/image";
import { AiOutlineHeart, AiFillHeart } from "react-icons/ai";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { useState } from "react";
import Link from "next/link";
import { apiBaseRoot, apiBaseUrl } from "@/config";
import { ProductBase } from "@/types/product";
import { toast } from "react-toastify";
import axios from "axios";

const ProductCard: React.FC<ProductBase> = ({
  id,
  slug,
  name,
  price,
  sale_price,
  default_image,
  brand,
  images,
  is_favourite,
}) => {
  const [isFavorited, setIsFavorited] = useState(is_favourite);

  let thumbnail = `/images/default-product.png`;

  if (default_image) {
    thumbnail = apiBaseRoot + default_image;
  }

  if ((images || []).length > 0) {
    thumbnail = apiBaseRoot + images[0].path;
  }

  const handleFavoriteToggle = async () => {
    const user_details_str = localStorage.getItem("userDetails");
    const user_details = user_details_str ? JSON.parse(user_details_str) : null;
    const user_id = user_details ? user_details.id : null;

    if (user_id) {
      try {
        const response = await axios.post(
          `${apiBaseUrl}wishlist/add`,
          {
            product_id: id,
            user_id: user_id,
          },
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        const data = response.data;

        if (response.status === 200) {
          const wishlist = JSON.parse(localStorage.getItem("wishlist") || "[]");

          // Check if the product is already in localStorage
          const productIndex = wishlist.findIndex(
            (item: any) => item.id === id
          );

          if (productIndex > -1) {
            // If the product is in the wishlist, remove it
            wishlist.splice(productIndex, 1);
            toast.success("Product removed from wishlist");
          } else {
            // If the product is not in the wishlist, add it
            wishlist.push({ id, is_favourite: true });
            toast.success("Product added to wishlist");
          }

          // Update localStorage with the modified wishlist
          localStorage.setItem("wishlist", JSON.stringify(wishlist));

          // Toggle the favorite status locally
          setIsFavorited(!isFavorited);
        } else {
          toast.error(
            data?.message || "Something went wrong. Please try again later."
          );
        }
      } catch (error) {
        toast.error("Error adding to wishlist: " + error);
      } finally {
      }
    } else {
      try {
        const wishlist = JSON.parse(localStorage.getItem("wishlist") || "[]");
        const index = wishlist.findIndex((item: any) => item.id === id);
        if (index !== -1) {
          wishlist.splice(index, 1);
          setIsFavorited(false);
          toast.success("Product removed from wishlist.");
        } else {
          // Product doesn't exist, add it
          const newProduct = {
            id,
            slug,
            name,
            price,
            sale_price,
            default_image,
            brand,
            images,
            is_favourite: true,
          };
          wishlist.push(newProduct);
          setIsFavorited(true);
          toast.success("Product added to wishlist.");
        }
        localStorage.setItem("wishlist", JSON.stringify(wishlist));
      } catch (error) {
        toast.error("Error updating wishlist locally: " + error);
      } finally {
      }
    }
  };

  return (
    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
      <Card className="p-0 gap-2 shadow-md rounded-none overflow-hidden relative">
        <div className="relative overflow-hidden rounded-t-xl">
          {/* Wishlist Icon inside the image container */}
          <motion.div
            className="absolute cursor-pointer top-3 right-3 bg-white p-2 rounded-full shadow-md cursor-pointer hover:bg-gray-200 z-10"
            whileTap={{ scale: 0.8 }}
            onClick={() => handleFavoriteToggle()}
          >
            {isFavorited ? (
              <AiFillHeart className="text-red-500 text-xl transition-transform duration-300 transform scale-100 hover:scale-110" />
            ) : (
              <AiOutlineHeart className="text-gray-600 text-xl transition-transform duration-300 transform scale-100 hover:scale-110" />
            )}
          </motion.div>

          <motion.div className="transition-transform duration-300 transform hover:scale-110">
            <Link href={`/product/${slug}`}>
              <Image
                src={thumbnail}
                alt={name}
                width={300}
                height={350}
                className="w-full h-64 rounded-none object-cover"
                priority
              />
            </Link>
          </motion.div>
        </div>
        <CardContent className="px-4 pb-2">
          <Link href={`/product/${slug}`}>
            <p className="text-gray-500 my-0 text-sm cursor-pointer">
              {brand?.name}
            </p>
          </Link>

          <Link href={`/product/${slug}`}>
            <h5 className="text-md font-semibold text-gray-800 cursor-pointer">
              {name}
            </h5>
          </Link>

          <Link href={`/product/${slug}`}>
            <p className="text-gray-900 text-sm cursor-pointer">£{price}</p>
          </Link>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ProductCard;

'use client';

import { useEffect, useState } from 'react';
import ProductCard from '@/components/product/wishlist-card';
import { motion } from 'framer-motion';
import Error500 from '@/components/errors/500';
import WishlistEmpty from '@/components/product/wishlist-empty';
import { Skeleton } from '@/components/ui/skeleton';
import { apiBaseUrl } from '@/config';
import { ProductBase } from '@/types/product';
import { toast } from 'react-toastify';
import axios from 'axios';

const ProductCardSkeleton = () => (
  <div className="flex flex-col space-y-3">
    <Skeleton className="h-[200px] w-full rounded-lg" />
    <div className="space-y-2">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  </div>
);

export default function ProductsPage() {
  const [wishlist, setWishlist] = useState<ProductBase[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchWishlist = async () => {
  setLoading(true);
  try {
    const user_details_str = localStorage.getItem("userDetails");
    const user_details = user_details_str ? JSON.parse(user_details_str) : null;
    const user_id = user_details ? user_details.id : null;

    if (user_id) {
      const res = await axios.get(`${apiBaseUrl}wishlist/show`, {
        params: { user_id },
        headers: {
          "Content-Type": "application/json",
        },
      });

      const json = res.data;
      const localWishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
      const serverWishlist = json.wishlist || [];

      const wishlistWithFlag = serverWishlist.map((product: ProductBase) => ({
        ...product,
        is_favourite: true,
      }));

      localWishlist.forEach((localItem: ProductBase) => {
        const existsInServer = serverWishlist.some((serverItem: ProductBase) => serverItem.id === localItem.id);
        if (!existsInServer) {
          wishlistWithFlag.push({ ...localItem, is_favourite: true });
        }
      });

      localStorage.setItem('wishlist', JSON.stringify(wishlistWithFlag));
      setWishlist(wishlistWithFlag);
    } else {
      const wishlistData = JSON.parse(localStorage.getItem("wishlist") || '[]');
      setWishlist(wishlistData);
    }
  } catch (err: any) {
    console.error("Error fetching wishlist:", err);
    setError(err.message || "Unknown error");
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchWishlist();
  }, []);

  return (
    <div className="px-4 py-8 min-h-screen bg-gray-50">
      <h1 className="text-2xl font-bold mb-6">My Wishlist</h1>
        <div className="flex flex-col md:flex-row gap-4 p-4">
        {error ? (
            <Error500 error={error} tryAgain={fetchWishlist} />
        ) : (
            <div className="w-full">
            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[...Array(6)].map((_, index) => (
                    <ProductCardSkeleton key={index} />
                ))}
                </div>
            ) : wishlist.length === 0 ? (
                <WishlistEmpty />
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {wishlist.map((product, index) => (
                    <motion.div
                    key={`product-${index}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    >
                    <ProductCard
                        {...product}
                    />
                    </motion.div>
                ))}
                </div>
            )}
            </div>
        )}
        </div>
      </div>
  );  
  
}

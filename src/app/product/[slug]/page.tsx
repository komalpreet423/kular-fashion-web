"use client";

import { useEffect, useState } from "react";
import ProductImages from "@/components/product/detail/images";
import ProductVariants from "@/components/product/variants";
import React from "react";
import NoProductsFound from "@/components/product/not-found";
import LoadingProduct from "@/components/product/detail/loading";
import ProductSummary from "@/components/product/detail/summary";
import { apiBaseUrl } from "@/config";
import { Product, ProductSize, ProductColor } from "@/types/product";
import ProductHeader from "@/components/product/detail/header";
import ProductActions from "@/components/product/detail/actions";
import RelatedProducts from "@/components/product/detail/related";
import { formatCurrency } from "@/utils/formatCurrency";
import { toast } from "react-toastify";
import axios from "axios";

const ProductDetail = ({ params }: { params: Promise<{ slug: string }> }) => {
  const { slug } = React.use(params);

  const [selectedColor, setSelectedColor] = useState<ProductColor | null>(null);
  const [selectedSize, setSelectedSize] = useState<ProductSize | null>(null);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axios.get(`${apiBaseUrl}products/${slug}`);
        setProduct(res.data.data);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [slug]);

  if (loading) return <LoadingProduct />;
  if (!product) {
    return (
      <NoProductsFound
        message="Product not found!"
        description={`Sorry, the product you're looking for is not available. Please check back later or explore other options`}
      />
    );
  }
  if (error) return <div>{error}</div>;

  const prices = product.sizes?.map((size) => size.price) || [];
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const priceText =
    minPrice === maxPrice
      ? formatCurrency(minPrice)
      : `${formatCurrency(minPrice)} - ${formatCurrency(maxPrice)}`;

  const handleSelectionChange = (
    color: ProductColor | null,
    size: ProductSize | null
  ) => {
    if (color) setSelectedColor(color);
    setSelectedSize(size);
  };

  const handleAddToCart = async () => {
    const user_details_str = localStorage.getItem("userDetails");
    const user_details = user_details_str ? JSON.parse(user_details_str) : null;
    const user_id = user_details?.id;
    const token = localStorage.getItem("authToken");
    const isLoggedIn = !!token;

    const variant = product.variants.find(
      (variant) =>
        variant.product_color_id === selectedColor?.id &&
        variant.product_size_id === selectedSize?.id
    );

    const variant_id = variant?.id;
    if (!variant_id) return toast.error("Selected variant not found.");
    if (variant.quantity <= 0)
      return toast.error("Sorry! Quantity not available.");

    const quantity = 1;

    try {
      if (isLoggedIn && user_id) {
        await axios.post(
          `${apiBaseUrl}cart/add`,
          {
            user_id,
            variant_id,
            quantity,
          },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        toast.success(`${product.name} added to cart successfully!`);
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
          localCart.cartItems[existingItemIndex].quantity += 1;
        } else {
          const colorDetail = product.colors.find(
            (c) => c.id === selectedColor?.id
          )?.detail.name;
          const sizeDetail = product.sizes.find(
            (s) => s.id === selectedSize?.id
          )?.detail.name;
          const variantData = product.variants.find(
            (v) =>
              v.product_color_id === selectedColor?.id &&
              v.product_size_id === selectedSize?.id
          );
          const totalQuantity = variantData?.quantity ?? 0;
          const imagePath = product.images?.[0]?.path ?? "";
          const maxId = localCart.cartItems.reduce(
            (max: number, item: any) => Math.max(max, item.id || 0),
            0
          );

          localCart.cartItems.push({
            id: maxId + 1,
            cart_id: null,
            user_id: null,
            variant_id,
            quantity,
            name: product.name,
            color: colorDetail || "",
            size: sizeDetail || "",
            price: selectedSize?.price || product.price,
            total_quantity: totalQuantity,
            image: imagePath,
            brand: product.brand.name,
          });
        }

        localStorage.setItem("cart", JSON.stringify(localCart));
        toast.success(`${product.name} added to cart successfully!`);
      }
    } catch (error) {
      console.error("Add to cart error:", error);
      toast.error("Something went wrong. Please try again after some time.");
    }
  };

  const handleAddToWishlist = async () => {
    const user_details_str = localStorage.getItem("userDetails");
    const user_details = user_details_str ? JSON.parse(user_details_str) : null;
    const user_id = user_details?.id;

    try {
      const wishlist = JSON.parse(localStorage.getItem("wishlist") || "[]");
      const productIndex = wishlist.findIndex(
        (item: any) => item.id === product.id
      );

      if (user_id) {
        const response = await axios.post(`${apiBaseUrl}wishlist/add`, {
          product_id: product.id,
          user_id,
        });

        if (response.status === 200) {
          if (productIndex > -1) {
            wishlist.splice(productIndex, 1);
            toast.success("Product removed from wishlist");
          } else {
            wishlist.push({ id: product.id, is_favourite: true });
            toast.success("Product added to wishlist");
          }
          localStorage.setItem("wishlist", JSON.stringify(wishlist));
        }
      } else {
        if (productIndex > -1) {
          wishlist.splice(productIndex, 1);
          toast.success("Product removed from wishlist.");
        } else {
          wishlist.push({
            id: product.id,
            slug: product.slug,
            name: product.name,
            price: product.price,
            sale_price: product.sale_price,
            default_image: product.default_image,
            brand: product.brand,
            images: product.images,
            is_favourite: true,
          });
          toast.success("Product added to wishlist.");
        }
        localStorage.setItem("wishlist", JSON.stringify(wishlist));
      }
    } catch (error) {
      toast.error("Error updating wishlist: " + error);
    }
  };

  return (
    <>
      <div className="container mx-auto py-8 px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
          <div className="flex justify-center">
            <ProductImages
              images={product.images}
              selectedColorId={selectedColor?.id}
              defaultImage={product.default_image}
            />
          </div>

          <div className="flex flex-col">
            <ProductHeader productName={product.name} />

            {selectedSize && selectedColor && (
              <div className="text-gray-700">
                {
                  product.variants.find(
                    (variant) =>
                      variant.product_color_id === selectedColor.id &&
                      variant.product_size_id === selectedSize.id
                  )?.sku
                }
              </div>
            )}

            <div className="px-0">
              <h4 className="text-2xl font-semibold">{product.name}</h4>

              {product.webInfo.summary && (
                <div className="mb-0">
                  <div
                    dangerouslySetInnerHTML={{
                      __html: product.webInfo.summary,
                    }}
                  />
                </div>
              )}

              <div className="text-xl font-semibold mt-2">
                {!selectedSize ? priceText : formatCurrency(selectedSize.price)}
              </div>

              <ProductVariants
                colors={product.colors}
                sizes={product.sizes}
                variants={product.variants}
                onSelectionChange={handleSelectionChange}
              />

              <ProductActions
                isDisabled={!selectedColor || !selectedSize}
                onAddToCart={handleAddToCart}
                onAddToWishlist={handleAddToWishlist}
                productId={product.id}
              />

              <ProductSummary
                description={product.webInfo.description}
                specifications={product.specifications}
              />
            </div>
          </div>
        </div>
      </div>

      {Array.isArray(product.relatedProducts) &&
        product.relatedProducts.length > 0 && (
          <RelatedProducts relatedProducts={product.relatedProducts} />
        )}
    </>
  );
};

export default ProductDetail;

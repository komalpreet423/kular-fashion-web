"use client";

import { useEffect, useState, useMemo } from "react";
import { apiBaseUrl, apiBaseRoot } from "@/config";
import { Skeleton } from "@/components/ui/skeleton";
import axios from "axios";
import { useParams } from "next/navigation";
import ProductCard from "@/components/product/card";
import { IoCloseSharp } from "react-icons/io5";
import { motion } from "framer-motion";
import FilterSidebar from "@/components/product/filter-sidebar";
import { Button } from "@/components/ui/button";
import { debounce } from "lodash";

interface Product {
  id: number;
  slug: string;
  name: string;
  price: number;
  discount_price?: number;
  default_image?: string;
  images?: Array<{ path: string }>;
  brand?: BrandDetails;
  is_favourite?: boolean;
  productType?: { id: string; name: string };
}

interface BrandDetails {
  id: number;
  slug: string;
  name: string;
  image: string | null;
  summary: string;
  description: string;
  // Other fields from your API response
}

interface Filter {
  product_types: { id: string; name: string }[];
  sizes: { id: string; name: string }[];
  colors: { id: string; name: string; color_code: string }[];
  price: { min: number; max: number };
  brands: { id: string; name: string }[];
}

interface SelectedFilters {
  product_types: string[];
  sizes: string[];
  colors: string[];
  price: { min: number; max: number };
}

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

const FiltersSkeleton = () => (
  <div className="space-y-4">
    <Skeleton className="h-6 w-1/2" />
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-full" />
  </div>
);

export default function BrandProductsPage() {
  const { slug } = useParams() as { slug: string };
  const [products, setProducts] = useState<Product[]>([]);
  const [filters, setFilters] = useState<Filter>({
    product_types: [],
    sizes: [],
    colors: [],
    price: { min: 0, max: 0 },
    brands: [],
  });
  const [selectedFilters, setSelectedFilters] = useState<SelectedFilters>({
    product_types: [],
    sizes: [],
    colors: [],
    price: { min: 0, max: -1 },
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage] = useState(12);
  const [totalPages, setTotalPages] = useState(1);
  const [brandDetails, setBrandDetails] = useState<BrandDetails | null>(null);
  const [brandName, setBrandName] = useState("");

  const memoizedSelectedFilters = useMemo(
    () => selectedFilters,
    [
      JSON.stringify(selectedFilters.product_types),
      JSON.stringify(selectedFilters.sizes),
      JSON.stringify(selectedFilters.colors),
      selectedFilters.price.min,
      selectedFilters.price.max,
    ]
  );

  const fetchBrandProducts = debounce(async () => {
    if (!slug) return;
    
    setLoading(true);
    setError(null);

    try {
      const params: Record<string, string> = {
        slug: slug.toString(),
        per_page: perPage.toString(),
        page: currentPage.toString(),
        filters: "true",
      };

      if (selectedFilters.product_types.length > 0) {
        params.product_types = selectedFilters.product_types.join(",");
      }
      if (selectedFilters.sizes.length > 0) {
        params.sizes = selectedFilters.sizes.join(",");
      }
      if (selectedFilters.colors.length > 0) {
        params.colors = selectedFilters.colors.join(",");
      }
      if (selectedFilters.price.min >= 0) {
        params.min_price = selectedFilters.price.min.toString();
      }
      if (selectedFilters.price.max > selectedFilters.price.min) {
        params.max_price = selectedFilters.price.max.toString();
      }

      const res = await axios.get(`${apiBaseUrl}brand-products`, {
        params,
        headers: {
          'Accept': 'application/json'
        }
      });

      if (res.data && res.data.success) {
        setProducts(res.data.data || []);
        setTotalPages(res.data.pagination?.last_page || 1);
        setBrandName(res.data.brand_name || "");

        // Set brand details from the first product's brand info
        if (res.data.data && res.data.data.length > 0 && res.data.data[0].brand) {
          setBrandDetails(res.data.data[0].brand);
        }

        const tempFilters = {
          product_types: res.data.filters?.product_types || [],
          sizes: res.data.filters?.sizes?.data || res.data.filters?.sizes || [],
          colors: res.data.filters?.colors || [],
          price: {
            min: res.data.filters?.price?.min || 0,
            max: res.data.filters?.price?.max || 0
          },
          brands: res.data.filters?.brands || [],
        };

        setFilters(tempFilters);

        const wishlist = JSON.parse(localStorage.getItem("wishlist") || "[]");
        const updatedWishlist = [...wishlist];

        const updatedProducts = (res.data.data || []).map((product: Product) => {
          const alreadyInWishlist = wishlist.some(
            (item: any) => item.id === product.id
          );

          if (product.is_favourite === false && alreadyInWishlist) {
            const index = updatedWishlist.findIndex(
              (item: any) => item.id === product.id
            );
            if (index !== -1) {
              updatedWishlist[index].is_favourite = true;
            }
            return { ...product, is_favourite: true };
          }

          if (product.is_favourite === true && !alreadyInWishlist) {
            updatedWishlist.push({ ...product, is_favourite: true });
          }

          return product;
        });

        localStorage.setItem("wishlist", JSON.stringify(updatedWishlist));
        setProducts(updatedProducts);
      } else {
        throw new Error(res.data?.message || "Invalid response format");
      }
    } catch (err) {
      setError(
        axios.isAxiosError(err)
          ? err.response?.data?.message || err.message || "Failed to load products"
          : "An unexpected error occurred"
      );
      console.error("Error fetching products:", err);
    } finally {
      setLoading(false);
    }
  }, 300);

  useEffect(() => {
    if (slug) {
      fetchBrandProducts();
    }
    return () => fetchBrandProducts.cancel();
  }, [slug, currentPage, memoizedSelectedFilters]);

  const resetFilters = () => {
    setSelectedFilters({
      product_types: [],
      sizes: [],
      colors: [],
      price: { min: filters.price.min, max: filters.price.max },
    });
    setCurrentPage(1);
  };

  const handleRemoveFilter = (
    type: keyof SelectedFilters,
    value: string | object
  ) => {
    setSelectedFilters((prev) => {
      const currentFilter = prev[type];

      if (Array.isArray(currentFilter)) {
        return {
          ...prev,
          [type]: currentFilter.filter((item) => item !== value),
        };
      } else if (type === "price") {
        return {
          ...prev,
          price: { min: 0, max: -1 },
        };
      }

      return prev;
    });
    setCurrentPage(1);
  };

  const getFilterNameById = (
    type: "product_types" | "sizes" | "colors",
    id: string
  ) => {
    switch (type) {
      case "product_types":
        return filters.product_types.find((cat) => cat.id.toString() === id.toString())?.name || id;
      case "sizes":
        return filters.sizes.find((size) => size.id.toString() === id.toString())?.name || id;
      case "colors":
        return filters.colors.find((color) => color.id.toString() === id.toString())?.name || id;
      default:
        return id;
    }
  };

  const isAnyFilterSelected =
    selectedFilters.product_types.length > 0 ||
    selectedFilters.sizes.length > 0 ||
    selectedFilters.colors.length > 0 ||
    ((selectedFilters.price.min !== filters.price.min ||
      selectedFilters.price.max !== filters.price.max) &&
      selectedFilters.price.max >= 0);

  if (error) {
    return (
      <div className="container mx-auto py-6 text-center">
        <h1 className="text-2xl font-bold mb-4">Error Loading Products</h1>
        <p className="text-red-500">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Brand Header Section */}
      <div className="grid md:grid-cols-2 text-white">
        <div className="h-full flex items-center justify-center bg-gray-100">
          {brandDetails?.image ? (
            <img
              src={`${apiBaseRoot}${brandDetails.image}`}
              alt={brandDetails.name}
              className="w-full h-full object-contain max-h-[400px]"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-200">
              <span className="text-gray-500">No brand image available</span>
            </div>
          )}
        </div>
        <div className="bg-gray-100 text-black px-8 py-16">
          <h1 className="text-3xl font-bold mb-4">
            {brandDetails?.name || brandName || "Brand"}
          </h1>
          {brandDetails?.summary && (
            <div 
              className="prose max-w-none"
              dangerouslySetInnerHTML={{ __html: brandDetails.summary }}
            />
          )}
        </div>
      </div>

      {/* Products and Filters Section */}
      <div className="flex flex-col md:flex-row container mx-auto px-4 py-12 gap-6">
        {/* Filters Sidebar - 1/4 width */}
        <div className="w-full md:w-1/4">
          {loading ? (
            <div className="space-y-6 px-6">
              <FiltersSkeleton />
              <FiltersSkeleton />
              <FiltersSkeleton />
              <FiltersSkeleton />
            </div>
          ) : (
            <FilterSidebar
              filters={filters}
              selectedFilters={{
                ...selectedFilters,
                brands: [], 
              }}
              onFilterChange={(type, value) => {
                setSelectedFilters((prev) => ({ ...prev, [type]: value }));
                setCurrentPage(1);
              }}
              onResetFilters={resetFilters}
              hideBrandFilter={true}
            />
          )}
        </div>

        {/* Products Grid - 3/4 width */}
        <div className="w-full md:w-3/4">
          {/* Active Filters */}
          {isAnyFilterSelected && (
            <div className="mb-4">
              <div className="flex flex-wrap gap-3 mt-2">
                {selectedFilters.product_types.map((categoryId) => (
                  <div
                    key={categoryId}
                    className="flex py-1.5 items-center bg-gray-200 rounded-lg px-3 transition-all hover:bg-gray-300"
                  >
                    <span className="text-sm text-gray-800">
                      {getFilterNameById("product_types", categoryId)}
                    </span>
                    <motion.button
                      className="ml-2 text-red-500 hover:text-red-600 hover:bg-red-100 rounded-lg"
                      onClick={() => handleRemoveFilter("product_types", categoryId)}
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <IoCloseSharp />
                    </motion.button>
                  </div>
                ))}
                {/* Other filter types... */}
                <Button
                  onClick={resetFilters}
                  size="md"
                  variant="secondary"
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          )}

          {/* Products Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, index) => (
                <ProductCardSkeleton key={index} />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-500 text-lg">No products found for this brand.</p>
              {isAnyFilterSelected && (
                <Button onClick={resetFilters} className="mt-4">
                  Clear Filters
                </Button>
              )}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {products.map((product) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <ProductCard
                      id={product.id}
                      slug={product.slug}
                      name={product.name}
                      price={product.price}
                      sale_price={product.discount_price}
                      default_image={product.default_image}
                      images={product.images}
                      brand={product.brand}
                      is_favourite={product.is_favourite}
                    />
                  </motion.div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center mt-8">
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage((prev) => prev - 1)}
                    >
                      Previous
                    </Button>
                    {[...Array(totalPages)].map((_, index) => (
                      <Button
                        key={index}
                        variant={currentPage === index + 1 ? "default" : "outline"}
                        onClick={() => setCurrentPage(index + 1)}
                      >
                        {index + 1}
                      </Button>
                    ))}
                    <Button
                      variant="outline"
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage((prev) => prev + 1)}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      {brandDetails?.description && (
        <div className="bg-gray-50 py-12">
          <div className="max-w-7xl mx-auto px-4">
        
            <div 
              className="prose max-w-none"
              dangerouslySetInnerHTML={{ __html: brandDetails.description }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
"use client";

import { useEffect, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import ProductCard from "@/components/product/card";
import { motion } from "framer-motion";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from "@/components/ui/pagination";
import { IoCloseSharp } from "react-icons/io5";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Error500 from "@/components/errors/500";
import FilterSidebar from "@/components/product/filter-sidebar";
import NoProductsFound from "@/components/product/not-found";
import { Skeleton } from "@/components/ui/skeleton";
import { debounce } from "lodash";
import { apiBaseUrl } from "@/config";

import { Product } from "@/types/product";
import { Filter, PaginationProps } from "@/types/filter";
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

const FiltersSkeleton = () => (
  <div className="space-y-4">
    <Skeleton className="h-6 w-1/2" />
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-full" />
  </div>
);

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filters, setFilters] = useState<Filter>({
    product_types: [],
    sizes: [],
    colors: [],
    brands: [],
    price: { min: 0, max: 0 },
  });
  const [pagination, setPagination] = useState<PaginationProps | null>(null);
  const [selectedFilters, setSelectedFilters] = useState<{
    product_types: string[];
    sizes: string[];
    colors: string[];
    brands: string[],
    price: { min: number; max: number };
  }>({
    product_types: [],
    sizes: [],
    colors: [],
    brands: [],
    price: { min: 0, max: -1 },
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(12);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<Boolean>(true);

  const memoizedSelectedFilters = useMemo(
    () => selectedFilters,
    [
      JSON.stringify(selectedFilters.product_types),
      JSON.stringify(selectedFilters.sizes),
      JSON.stringify(selectedFilters.colors),
      JSON.stringify(selectedFilters.brands),
      selectedFilters.price.min,
      selectedFilters.price.max,
    ]
  );

  const fetchProducts = async () => {
    setLoading(true);
    try {
      // Build params object
      const params: Record<string, string> = {
        per_page: perPage.toString(),
        page: currentPage.toString(),
      };

      // Only add filter params if they have values
      if (selectedFilters.product_types.length > 0) {
        params.product_types = selectedFilters.product_types.join(",");
      }
      if (selectedFilters.sizes.length > 0) {
        params.sizes = selectedFilters.sizes.join(",");
      }
      if (selectedFilters.colors.length > 0) {
        params.colors = selectedFilters.colors.join(",");
      }
      if (selectedFilters.brands.length > 0) {
        params.brands = selectedFilters.brands.join(",");
      }
      if (selectedFilters.price.min >= 0) {
        params.min_price = selectedFilters.price.min.toString();
      }
      if (selectedFilters.price.max > selectedFilters.price.min) {
        params.max_price = selectedFilters.price.max.toString();
      }

      const response = await axios.get(`${apiBaseUrl}products`, { params });
      const data = response.data;

      // Extract filters from API response correctly - handle object structure for colors and sizes
      const apiFilters = data.filters || {};
      
      // Convert object with numeric keys to array for colors and sizes
      const colorsArray = apiFilters.colors ? Object.values(apiFilters.colors) : [];
      const sizesArray = apiFilters.sizes ? Object.values(apiFilters.sizes) : [];
      
      const tempFilters = {
        product_types: Array.isArray(apiFilters.product_types) ? apiFilters.product_types : [],
        sizes: sizesArray,
        colors: colorsArray,
        brands: Array.isArray(apiFilters.brands) ? apiFilters.brands : [],
        price: {
          min: apiFilters.price?.min || 0,
          max: apiFilters.price?.max || 0
        },
      };

      // Handle wishlist logic
      const wishlist = JSON.parse(localStorage.getItem("wishlist") || "[]");
      const updatedWishlist = [...wishlist];

      const updatedProducts = (data.data || []).map((product: any) => {
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
      setFilters(tempFilters);
      setError(null);
      setPagination(data.pagination || null);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "An unexpected error occurred"
      );
    } finally {
      setLoading(false);
    }
  };

  const debouncedFetchProducts = debounce(fetchProducts, 300);
  useEffect(() => {
    debouncedFetchProducts();
    return () => debouncedFetchProducts.cancel();
  }, [currentPage, memoizedSelectedFilters]);

  const handleSortChange = (option: string) => {
    // Add your sorting logic here
  };

  const resetFilters = () => {
    setSelectedFilters({
      product_types: [],
      sizes: [],
      colors: [],
      brands: [],
      price: { min: filters.price.min, max: filters.price.max },
    });
    setCurrentPage(1);
  };

  const handleRemoveFilter = (
    type: keyof typeof selectedFilters,
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
    type: "product_types" | "sizes" | "colors" | "brands",
    id: string
  ) => {
    const filterArray = filters[type] || [];
    
    switch (type) {
      case "product_types":
        const productType = filterArray.find(
          (cat: any) => cat.id && cat.id.toString() === id.toString()
        );
        return productType?.name || id;
      case "sizes":
        const size = filterArray.find(
          (size: any) => size.id && size.id.toString() === id.toString()
        );
        return size?.name || size?.size || id;
      case "colors":
        const color = filterArray.find(
          (color: any) => color.id && color.id.toString() === id.toString()
        );
        return color?.name || color?.color_name || id;
      case "brands":
        const brand = filterArray.find(
          (brand: any) => brand.id && brand.id.toString() === id.toString()
        );
        return brand?.name || id;
      default:
        return id;
    }
  };

  const isAnyFilterSelected =
    selectedFilters.product_types.length > 0 ||
    selectedFilters.sizes.length > 0 ||
    selectedFilters.colors.length > 0 ||
    selectedFilters.brands.length > 0 ||
    ((selectedFilters.price.min !== filters.price.min ||
      selectedFilters.price.max !== filters.price.max) &&
      selectedFilters.price.max >= 0);

  return (
    <div className="flex flex-col md:flex-row gap-4 p-4">
      {error ? (
        <Error500 error={error} tryAgain={fetchProducts} />
      ) : (
        <>
          <div className="w-full md:w-1/4">
            {loading && !isAnyFilterSelected ? (
              <div className="space-y-6 px-6">
                <FiltersSkeleton />
                <FiltersSkeleton />
                <FiltersSkeleton />
                <FiltersSkeleton />
              </div>
            ) : (
              <FilterSidebar
                filters={filters}
                selectedFilters={selectedFilters}
                onFilterChange={(type, value) => {
                  setSelectedFilters((prev) => ({ ...prev, [type]: value }));
                  setCurrentPage(1);
                }}
                onResetFilters={resetFilters}
              />
            )}
          </div>

          <div className="w-full md:w-3/4">
            {loading ? (
              <>
                <div className="flex justify-between mb-2">
                  <Skeleton className="h-6 w-1/4" />
                  <Skeleton className="h-8 w-1/6" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[...Array(6)].map((_, index) => (
                    <ProductCardSkeleton key={index} />
                  ))}
                </div>
              </>
            ) : !products.length ? (
              <NoProductsFound />
            ) : (
              <>
                <div className="flex justify-between mb-2">
                  <h4 className="text-lg">{pagination?.total || 0} Products</h4>
                  <div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant={"secondary"} size={"sm"}>
                          Sort By: Price: Low to High
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem
                          onClick={() => handleSortChange("Price: Low to High")}
                        >
                          Price: Low to High
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleSortChange("Price: High to Low")}
                        >
                          Price: High to Low
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            handleSortChange("Rating: High to Low")
                          }
                        >
                          Rating: High to Low
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            handleSortChange("Availability: In Stock")
                          }
                        >
                          Availability: In Stock
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                <div className="mb-4">
                  {isAnyFilterSelected && (
                    <div className="flex flex-wrap gap-3 mt-2">
                      {selectedFilters.product_types.map((categoryId) => (
                        <div
                          key={categoryId}
                          className="flex py-1.5 items-center bg-gray-200 dark:bg-gray-700 rounded-lg px-3 transition-all duration-300 ease-in-out hover:bg-gray-300 dark:hover:bg-gray-600"
                        >
                          <span className="text-sm text-gray-800 dark:text-gray-200">
                            {getFilterNameById("product_types", categoryId)}
                          </span>
                          <motion.button
                            className="ml-2 text-red-500 cursor-pointer hover:text-red-600 hover:bg-red-100 rounded-lg transition duration-300"
                            onClick={() =>
                              handleRemoveFilter("product_types", categoryId)
                            }
                            whileHover={{ scale: 1.2 }}
                            whileTap={{ scale: 0.9 }}
                            animate={{ opacity: 1 }}
                            initial={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            <IoCloseSharp />
                          </motion.button>
                        </div>
                      ))}
                      {selectedFilters.sizes.map((sizeId) => (
                        <div
                          key={sizeId}
                          className="flex py-1.5 items-center bg-gray-200 dark:bg-gray-700 rounded-lg px-3 transition-all duration-300 ease-in-out hover:bg-gray-300 dark:hover:bg-gray-600"
                        >
                          <span className="text-sm text-gray-800 dark:text-gray-200">
                            {getFilterNameById("sizes", sizeId)}
                          </span>
                          <motion.button
                            className="ml-2 text-red-500 cursor-pointer hover:text-red-600 hover:bg-red-100 rounded-lg transition duration-300"
                            onClick={() =>
                              handleRemoveFilter("sizes", sizeId)
                            }
                            whileHover={{ scale: 1.2 }}
                            whileTap={{ scale: 0.9 }}
                            animate={{ opacity: 1 }}
                            initial={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            <IoCloseSharp />
                          </motion.button>
                        </div>
                      ))}
                      {selectedFilters.brands.map((id) => (
                        <div
                          key={id}
                          className="flex py-1.5 items-center bg-gray-200 dark:bg-gray-700 rounded-lg px-3 transition-all duration-300 ease-in-out hover:bg-gray-300 dark:hover:bg-gray-600"
                        >
                          <span className="text-sm text-gray-800 dark:text-gray-200">
                            {getFilterNameById("brands", id)}
                          </span>
                          <motion.button
                            className="ml-2 text-red-500 cursor-pointer hover:text-red-600 hover:bg-red-100 rounded-lg transition duration-300"
                            onClick={() =>
                              handleRemoveFilter("brands", id)
                            }
                            whileHover={{ scale: 1.2 }}
                            whileTap={{ scale: 0.9 }}
                            animate={{ opacity: 1 }}
                            initial={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            <IoCloseSharp />
                          </motion.button>
                        </div>
                      ))}
                      {selectedFilters.colors.map((colorId) => {
                        const color = filters.colors.find((c: any) => c.id && c.id.toString() === colorId.toString());
                        return (
                          <div
                            key={colorId}
                            className="flex py-1.5 items-center bg-gray-200 dark:bg-gray-700 rounded-lg px-3 transition-all duration-300 ease-in-out hover:bg-gray-300 dark:hover:bg-gray-600"
                          >
                            <span
                              style={{
                                backgroundColor: color?.color_code || '#ccc',
                              }}
                              className="w-4 h-4 rounded-full mr-2 border border-gray-300"
                            ></span>
                            <span className="text-sm text-gray-800 dark:text-gray-200">
                              {getFilterNameById("colors", colorId)}
                            </span>
                            <motion.button
                              className="ml-2 text-red-500 cursor-pointer hover:text-red-600 hover:bg-red-100 rounded-lg transition duration-300"
                              onClick={() =>
                                handleRemoveFilter("colors", colorId)
                              }
                              whileHover={{ scale: 1.2 }}
                              whileTap={{ scale: 0.9 }}
                              animate={{ opacity: 1 }}
                              initial={{ opacity: 0 }}
                              transition={{ duration: 0.3 }}
                            >
                              <IoCloseSharp />
                            </motion.button>
                          </div>
                        );
                      })}
                      {selectedFilters.price.min !==
                        selectedFilters.price.max &&
                        selectedFilters.price.max > -1 && (
                          <div className="flex py-1.5 items-center bg-gray-200 dark:bg-gray-700 rounded-lg px-3 transition-all duration-300 ease-in-out hover:bg-gray-300 dark:hover:bg-gray-600">
                            <span className="text-sm text-gray-800 dark:text-gray-200">{`£${selectedFilters.price.min} - £${selectedFilters.price.max}`}</span>
                            <button
                              className="ml-2 text-red-500 cursor-pointer hover:text-red-600 transition duration-300"
                              onClick={() =>
                                handleRemoveFilter("price", {
                                  min: 0,
                                  max: -1,
                                })
                              }
                            >
                              <IoCloseSharp />
                            </button>
                          </div>
                        )}
                      <Button
                        onClick={resetFilters}
                        size="md"
                        variant={"secondary"}
                      >
                        Clear Filters
                      </Button>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {products.map((product, index) => (
                    <motion.div
                      key={`product-${index}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <ProductCard {...product} />
                    </motion.div>
                  ))}
                </div>

                {pagination && pagination.last_page > 1 && (
                  <div className="flex justify-center mt-6">
                    <Pagination>
                      <PaginationContent>
                        {/* Previous Button */}
                        <PaginationItem>
                          <button
                            className="px-3 py-1 rounded-md disabled:opacity-50"
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage((prev) => prev - 1)}
                          >
                            Previous
                          </button>
                        </PaginationItem>

                        {/* First Page */}
                        {currentPage > 3 && (
                          <PaginationItem>
                            <button
                              className={`px-3 py-1 rounded-md ${currentPage === 1 ? "bg-gray-900 text-white" : "bg-gray-200"}`}
                              onClick={() => setCurrentPage(1)}
                            >
                              1
                            </button>
                          </PaginationItem>
                        )}

                        {/* Ellipsis before current page if needed */}
                        {currentPage > 4 && (
                          <PaginationItem>
                            <span className="px-3 py-1">...</span>
                          </PaginationItem>
                        )}

                        {/* Pages around current page */}
                        {Array.from({ length: Math.min(5, pagination.last_page) }, (_, i) => {
                          let pageNum;
                          if (currentPage <= 3) {
                            pageNum = i + 1;
                          } else if (currentPage >= pagination.last_page - 2) {
                            pageNum = pagination.last_page - 4 + i;
                          } else {
                            pageNum = currentPage - 2 + i;
                          }

                          if (pageNum < 1 || pageNum > pagination.last_page) return null;

                          return (
                            <PaginationItem key={pageNum}>
                              <button
                                className={`px-3 py-1 rounded-md ${currentPage === pageNum ? "bg-gray-900 text-white" : "bg-gray-200"}`}
                                onClick={() => setCurrentPage(pageNum)}
                              >
                                {pageNum}
                              </button>
                            </PaginationItem>
                          );
                        })}

                        {/* Ellipsis after current page if needed */}
                        {currentPage < pagination.last_page - 3 && (
                          <PaginationItem>
                            <span className="px-3 py-1">...</span>
                          </PaginationItem>
                        )}

                        {/* Last Page */}
                        {currentPage < pagination.last_page - 2 && (
                          <PaginationItem>
                            <button
                              className={`px-3 py-1 rounded-md ${currentPage === pagination.last_page ? "bg-gray-900 text-white" : "bg-gray-200"}`}
                              onClick={() => setCurrentPage(pagination.last_page)}
                            >
                              {pagination.last_page}
                            </button>
                          </PaginationItem>
                        )}

                        {/* Next Button */}
                        <PaginationItem>
                          <button
                            className="px-3 py-1 rounded-md disabled:opacity-50"
                            disabled={currentPage === pagination.last_page}
                            onClick={() => setCurrentPage((prev) => prev + 1)}
                          >
                            Next
                          </button>
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                )}
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}
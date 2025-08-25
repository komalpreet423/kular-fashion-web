'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';
import { Product } from '@/types/product';
import { apiBaseUrl } from '@/config';
import ProductCard from '@/components/product/card';
import NoProductsFound from '@/components/product/not-found';
import FilterSidebar from '@/components/product/filter-sidebar';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { IoCloseSharp } from 'react-icons/io5';
import { Skeleton } from '@/components/ui/skeleton';
import { Pagination, PaginationContent, PaginationItem } from '@/components/ui/pagination';

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
  brands: string[];
}

interface PaginationProps {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

const FiltersSkeleton = () => (
  <div className="space-y-4">
    <Skeleton className="h-6 w-1/2" />
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-full" />
  </div>
);

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

export default function ProductTypePage() {
  const { dept, type } = useParams() as { dept: string; type: string };
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
    brands: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage] = useState(12);
  const [pagination, setPagination] = useState<PaginationProps | null>(null);

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

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true); 
        setError(null);

        const params: Record<string, string> = {
          department_slug: dept,
          product_type_slug: type,
          per_page: perPage.toString(),
          page: currentPage.toString(),
          filters: "true",
        };
        
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

        if (response.data?.success) {
          setProducts(response.data.data || []);
          setPagination(response.data.pagination || null);

          const apiFilters = response.data.filters || {};
          setFilters({
            product_types: apiFilters.product_types || [],
            sizes: apiFilters.sizes?.data || apiFilters.sizes || [],
            colors: apiFilters.colors || [],
            price: apiFilters.price || { min: 0, max: 0 },
            brands: apiFilters.brands || [],
          });
        } else {
          setProducts([]);
          setError('No products found in this category');
        }
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Failed to load products. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (dept && type) {
      fetchProducts();
    }
  }, [dept, type, currentPage, perPage, memoizedSelectedFilters]);

  const resetFilters = () => {
    setSelectedFilters({
      product_types: [],
      sizes: [],
      colors: [],
      price: { min: 0, max: -1 },
      brands: [],
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
    type: "product_types" | "sizes" | "colors" | "brands",
    id: string
  ) => {
    switch (type) {
      case "product_types":
        return filters.product_types.find((cat) => cat.id.toString() === id.toString())?.name || id;
      case "sizes":
        return filters.sizes.find((size) => size.id.toString() === id.toString())?.name || id;
      case "colors":
        return filters.colors.find((color) => color.id.toString() === id.toString())?.name || id;
      case "brands":
        return filters.brands.find((brand) => brand.id.toString() === id.toString())?.name || id;
      default:
        return id;
    }
  };

  const isAnyFilterSelected =
    selectedFilters.sizes.length > 0 ||
    selectedFilters.colors.length > 0 ||
    selectedFilters.brands.length > 0 ||
    ((selectedFilters.price.min !== filters.price.min ||
      selectedFilters.price.max !== filters.price.max) &&
      selectedFilters.price.max >= 0);

  if (error) {
    return (
      <NoProductsFound
        message="Error loading products"
        description={error}
        showResetButton={false}
      />
    );
  }

  return (
    <div className="flex flex-col md:flex-row gap-4 p-4">
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
            selectedFilters={selectedFilters}
            onFilterChange={(type, value) => {
              setSelectedFilters((prev) => ({ ...prev, [type]: value }));
              setCurrentPage(1);
            }}
            onResetFilters={resetFilters}
          />
        )}
      </div>

      {/* Products Grid - 3/4 width */}
      <div className="w-full md:w-3/4">
        <h1 className="text-2xl font-bold mb-6 capitalize">
          {dept} / {type.replace(/-/g, ' ')}
        </h1>
        
        {/* Active Filters */}
        {isAnyFilterSelected && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-3 mt-2">
              {selectedFilters.sizes.map((sizeId) => (
                <div
                  key={`size-${sizeId}`}
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
              {selectedFilters.colors.map((colorId) => (
                <div
                  key={`color-${colorId}`}
                  className="flex py-1.5 items-center bg-gray-200 dark:bg-gray-700 rounded-lg px-3 transition-all duration-300 ease-in-out hover:bg-gray-300 dark:hover:bg-gray-600"
                >
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
              ))}
              {selectedFilters.brands.map((brandId) => (
                <div
                  key={`brand-${brandId}`}
                  className="flex py-1.5 items-center bg-gray-200 dark:bg-gray-700 rounded-lg px-3 transition-all duration-300 ease-in-out hover:bg-gray-300 dark:hover:bg-gray-600"
                >
                  <span className="text-sm text-gray-800 dark:text-gray-200">
                    {getFilterNameById("brands", brandId)}
                  </span>
                  <motion.button
                    className="ml-2 text-red-500 cursor-pointer hover:text-red-600 hover:bg-red-100 rounded-lg transition duration-300"
                    onClick={() =>
                      handleRemoveFilter("brands", brandId)
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
              {selectedFilters.price.max > 0 && (
                <div className="flex py-1.5 items-center bg-gray-200 dark:bg-gray-700 rounded-lg px-3 transition-all duration-300 ease-in-out hover:bg-gray-300 dark:hover:bg-gray-600">
                  <span className="text-sm text-gray-800 dark:text-gray-200">
                    £{selectedFilters.price.min} - £{selectedFilters.price.max}
                  </span>
                  <motion.button
                    className="ml-2 text-red-500 cursor-pointer hover:text-red-600 hover:bg-red-100 rounded-lg transition duration-300"
                    onClick={() =>
                      handleRemoveFilter("price", {})
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
              )}
              <Button
                onClick={resetFilters}
                size="md"
                variant={"secondary"}
              >
                Clear Filters
              </Button>
            </div>
          </div>
        )}

        {/* Products */}
        {loading ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, index) => (
                <ProductCardSkeleton key={index} />
              ))}
            </div>
          </>
        ) : products.length === 0 ? (
          <NoProductsFound
            message="No products found"
            description="Try adjusting your filters or check back later."
            showResetButton={isAnyFilterSelected}
            onReset={resetFilters}
          />
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map((product, index) => (
                <motion.div
                  key={`product-${index}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <ProductCard
                    id={product.id}
                    slug={product.slug}
                    name={product.name}
                    price={product.price}
                    sale_price={product.sale_price}
                    default_image={product.default_image}
                    images={product.images}
                    brand={product.brand}
                    is_favourite={product.is_favourite}
                  />
                </motion.div>
              ))}
            </div>

            {/* Pagination - Updated to match first example */}
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
    </div>
  );
}
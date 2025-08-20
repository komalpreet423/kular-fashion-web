"use client";

import { use, useEffect, useState, useMemo } from "react";
import axios from "axios";
import { notFound } from "next/navigation";
import { apiBaseUrl, apiBaseRoot } from "@/config";
import ProductCard from "@/components/product/card";
import { ProductBase } from "@/types/product";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import FilterSidebar from "@/components/product/filter-sidebar";
import { Button } from "@/components/ui/button";
import { IoCloseSharp } from "react-icons/io5";
import { debounce } from "lodash";

interface CategoryData {
  id: number;
  slug: string;
  name: string;
  summary: string;
  description: string;
  heading: string;
  image: string | null;
  children: CategoryData[];
  meta_title?: string;
  meta_keywords?: string;
  meta_description?: string;
  status?: string;
  categories_product?: any[];
}

interface Filters {
  product_types: { id: number; name: string; slug: string }[];
  sizes: { id: number; size: string; name: string }[];
  colors: { id: number; name: string; hex: string }[];
  brands: { id: number; name: string; slug: string }[];
  price: { min: number; max: number };
  tags?: any[];
}

interface SelectedFilters {
  product_types: string[];
  sizes: string[];
  colors: string[];
  brands: string[];
  price: { min: number; max: number };
}

interface ApiResponse {
  success: boolean;
  data: {
    category: CategoryData;
    products: {
      current_page: number;
      data: ProductBase[];
      first_page_url: string;
      from: number;
      last_page: number;
      last_page_url: string;
      links: any[];
      next_page_url: string | null;
      path: string;
      per_page: number;
      prev_page_url: string | null;
      to: number;
      total: number;
    };
    filters: Filters;
  };
  message: string;
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

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default function CategoryPage({ params }: PageProps) {
  const { slug } = use(params);
  const [category, setCategory] = useState<CategoryData | null>(null);
  const [products, setProducts] = useState<ProductBase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage] = useState(12);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState<Filters>({
    product_types: [],
    sizes: [],
    colors: [],
    brands: [],
    price: { min: 0, max: 0 },
  });
  const [selectedFilters, setSelectedFilters] = useState<SelectedFilters>({
    product_types: [],
    sizes: [],
    colors: [],
    brands: [],
    price: { min: 0, max: -1 },
  });

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

  const fetchData = async () => {
    try {
      setLoading(true);
      const params: Record<string, string> = {
        per_page: perPage.toString(),
        page: currentPage.toString(),
      };

      // Add filters to params only if they have values
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

      const categoryRes = await axios.get<ApiResponse>(`${apiBaseUrl}category/${slug}`, {
        params,
      });

      if (categoryRes.status === 404 || !categoryRes.data.success) {
        setError("Category not found");
        return;
      }

      const responseData = categoryRes.data.data;
      const categoryData = responseData.category;
      const apiFilters = responseData.filters || {};
      const productsData = responseData.products?.data || [];
      const paginationData = responseData.products;

      const transformedColors = (apiFilters.colors || []).map(color => ({
        id: color.id.toString(),
        color_code: color.hex
      }));

      const parsedFilters: Filters = {
        product_types: apiFilters.product_types || [],
        sizes: apiFilters.sizes || [],
        colors: transformedColors,
        brands: apiFilters.brands || [],
        price: apiFilters.price || { min: 0, max: 0 },
        tags: apiFilters.tags || [],
      };

      setFilters(parsedFilters);
      setCategory(categoryData);

      // Map products with brand information
      const categoryProducts = productsData.map((product: any) => {
        const brandObj = parsedFilters.brands.find(
          (b) => b.id === product.brand_id
        ) || {
          id: product.brand_id,
          name: product.brand?.name || 'Unknown Brand',
          slug: product.brand?.slug || ''
        };

        return {
          ...product,
          brand: brandObj,
        };
      });

      setProducts(categoryProducts);
      setTotalPages(paginationData?.last_page || 1);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching category:', err);
      setError(err.response?.data?.message || 'Failed to fetch category');
    } finally {
      setLoading(false);
    }
  };

  const debouncedFetchData = debounce(fetchData, 300);

  useEffect(() => {
    if (slug) {
      debouncedFetchData();
    }
    return () => debouncedFetchData.cancel();
  }, [slug, currentPage, memoizedSelectedFilters]);

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
        const productType = filters.product_types.find(
          (cat) => cat.id.toString() === id.toString()
        );
        return productType?.name || id;
      case "sizes":
        return filters.sizes.find((size) => size.id.toString() === id.toString())?.name || id;
      case "colors":
        return filters.colors.find((color) => color.id.toString() === id.toString())?.hex || id;
      case "brands":
        return filters.brands.find((brand) => brand.id.toString() === id.toString())?.name || id;
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

  if (loading && !category) {
    return (
      <main className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading category data...</p>
        </div>
      </main>
    );
  }

  if (error || !category) {
    return notFound();
  }

  const imageUrl = category.image ? `${apiBaseRoot}${category.image}` : null;

  const renderProductGrid = () => {
    if (loading) {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      );
    }

    if (products.length > 0) {
      return (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product, index) => (
              <motion.div
                key={`product-${product.id}-${index}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <ProductCard
                  id={product.id}
                  slug={product.slug}
                  name={product.name}
                  price={product.price}
                  sale_price={product.sale_price}
                  default_image={product.default_image}
                  brand={product.brand}
                  images={product.images}
                  is_favourite={product.is_favourite}
                />
              </motion.div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-8">
              <div className="flex space-x-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-2 rounded ${currentPage === page
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
            </div>
          )}
        </>
      );
    }

    return (
      <div className="text-center py-10">
        <p className="text-gray-600">No products found in this category.</p>
        {isAnyFilterSelected && (
          <Button onClick={resetFilters} className="mt-4">
            Clear Filters
          </Button>
        )}
      </div>
    );
  };

  return (
    <div>
      <div className="grid md:grid-cols-2 text-white">
        <div className="h-full flex items-center justify-center">
          {imageUrl && (
            <img
              src={imageUrl}
              alt={category.name}
              className="shadow-md w-full h-full object-cover"
            />
          )}
        </div>
        <div className="bg-gray-100 text-black px-8 py-16">
          <h2 className="text-3xl font-bold mb-4">
            {category.heading || category.name}
          </h2>
          <div
            className="text-sm text-gray-700"
            dangerouslySetInnerHTML={{ __html: category.summary || "" }}
          />
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 p-4">
        {/* Filter Sidebar */}
        <div className="w-full md:w-1/4">
          <FilterSidebar
            filters={filters}
            selectedFilters={selectedFilters}
            onFilterChange={(type, value) => {
              setSelectedFilters((prev) => ({ ...prev, [type]: value }));
              setCurrentPage(1);
            }}
            onResetFilters={resetFilters}
          />
        </div>

        {/* Product List */}
        <div className="w-full md:w-3/4">
          {/* Active Filters */}
          {isAnyFilterSelected && (
            <div className="flex flex-wrap gap-3 mt-2 mb-4">
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
                    onClick={() => handleRemoveFilter("product_types", categoryId)}
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
                    onClick={() => handleRemoveFilter("sizes", sizeId)}
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
                    onClick={() => handleRemoveFilter("brands", id)}
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
                  key={colorId}
                  className="flex py-1.5 items-center bg-gray-200 dark:bg-gray-700 rounded-lg px-3 transition-all duration-300 ease-in-out hover:bg-gray-300 dark:hover:bg-gray-600"
                >
                  <span
                    style={{
                      backgroundColor: getFilterNameById("colors", colorId),
                    }}
                    className="py-2.5 px-4 rounded-lg text-white font-bold"
                  ></span>
                  <motion.button
                    className="ml-2 text-red-500 cursor-pointer hover:text-red-600 hover:bg-red-100 rounded-lg transition duration-300"
                    onClick={() => handleRemoveFilter("colors", colorId)}
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
              {selectedFilters.price.min !== selectedFilters.price.max &&
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
                size="sm"
                variant={"secondary"}
              >
                Clear Filters
              </Button>
            </div>
          )}

          {renderProductGrid()}
        </div>
      </div>

      {category.description && (
        <div className="bg-gray-50 py-12">
          <div className="max-w-7xl mx-auto px-4">
            <div
              className="prose max-w-none mx-auto"
              dangerouslySetInnerHTML={{ __html: category.description }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
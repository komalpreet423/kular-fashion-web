'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';
import { apiBaseUrl } from '@/config';
import ProductCard from '@/components/product/card';
import { Skeleton } from '@/components/ui/skeleton';
import FilterSidebar from '@/components/product/filter-sidebar';
import { Button } from '@/components/ui/button';
import { IoCloseSharp } from 'react-icons/io5';
import { motion } from 'framer-motion';
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { debounce } from 'lodash';

type ProductBase = {
  id: number;
  slug: string;
  name: string;
  price: number;
  sale_price?: number;
  default_image?: string;
  brand?: { id: number; name: string; slug: string };
  productType?: { id: number; name: string };
  images?: { path: string }[];
  is_favourite?: boolean;
  sizes?: { sizeDetail: { id: number; name: string } }[];
  colors?: { colorDetail: { id: number; name: string; hex: string } }[];
};

type CollectionType = {
  id: number;
  name: string;
  description: string;
  heading: string;
  image: string | null;
  listing_options: {
    hide_filters?: boolean;
    show_all_filters?: boolean;
    visible_filters?: string[];
    show_per_page?: number;
  };
};

type ApiResponse = {
  success: boolean;
  data: {
    collection: CollectionType;
    products: ProductBase[];
    pagination: {
      total: number;
      current_page: number;
      total_pages: number;
    };
    filters: {
      brands: { id: number; name: string; slug: string }[];
      sizes: { id: number; name: string }[];
      colors: { id: number; name: string; hex: string }[];
      product_types: { id: number; name: string }[];
      price: { min: number; max: number };
    };
  };
};

interface SelectedFilters {
  product_types: string[];
  sizes: string[];
  colors: string[];
  brands: string[];
  price: { min: number; max: number };
}

export default function CollectionPage() {
  const { slug } = useParams();
  const [collection, setCollection] = useState<CollectionType | null>(null);
  const [products, setProducts] = useState<ProductBase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage] = useState(12);
  const [filters, setFilters] = useState({
    product_types: [] as { id: string; name: string }[],
    sizes: [] as { id: string; name: string }[],
    colors: [] as { id: string; color_code: string }[],
    brands: [] as { id: string; name: string }[],
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

  const fetchCollection = async () => {
    try {
      setLoading(true);
      const params: Record<string, string> = {
        per_page: perPage.toString(),
        page: currentPage.toString(),
        filters: 'true',
      };

      // Add filter params if they exist
      if (selectedFilters.product_types.length > 0) {
        params.product_types = selectedFilters.product_types.join(',');
      }
      if (selectedFilters.sizes.length > 0) {
        params.sizes = selectedFilters.sizes.join(',');
      }
      if (selectedFilters.colors.length > 0) {
        params.colors = selectedFilters.colors.join(',');
      }
      if (selectedFilters.brands.length > 0) {
        params.brands = selectedFilters.brands.join(',');
      }
      if (selectedFilters.price.min >= 0) {
        params.min_price = selectedFilters.price.min.toString();
      }
      if (selectedFilters.price.max > selectedFilters.price.min) {
        params.max_price = selectedFilters.price.max.toString();
      }

      const res = await axios.get<ApiResponse>(`${apiBaseUrl}collection/${slug}`, { params });
      
      if (res.data.success) {
        setCollection(res.data.data.collection);
        setProducts(res.data.data.products);

        // Set filters from API response
        const apiFilters = res.data.data.filters;
        setFilters({
          product_types: apiFilters.product_types?.map(type => ({
            id: type.id.toString(),
            name: type.name
          })) || [],
          sizes: apiFilters.sizes?.map(size => ({
            id: size.id.toString(),
            name: size.name
          })) || [],
          colors: apiFilters.colors?.map(color => ({
            id: color.id.toString(),
            color_code: color.hex
          })) || [],
          brands: apiFilters.brands?.map(brand => ({
            id: brand.id.toString(),
            name: brand.name
          })) || [],
          price: apiFilters.price || { min: 0, max: 0 }
        });
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const debouncedFetchCollection = debounce(fetchCollection, 300);
  
  useEffect(() => {
    if (slug) {
      debouncedFetchCollection();
    }
    return () => debouncedFetchCollection.cancel();
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
        return filters.sizes.find((size) => size.id === id)?.name || id;
      case "colors":
        return filters.colors.find((color) => color.id === id)?.color_code || id;
      case "brands":
        return filters.brands.find((brand) => brand.id === id)?.name || id;
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

  if (loading && !collection) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Loading...</h1>
        <Skeleton className="h-8 w-1/3 mb-2" />
        <Skeleton className="h-96 w-full mb-4" />
      </div>
    );
  }

  if (!collection) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold text-red-500">Collection not found.</h1>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row gap-4 p-4">
      {error ? (
        <div className="p-6">
          <h1 className="text-2xl font-bold text-red-500">Error: {error}</h1>
          <Button onClick={fetchCollection} className="mt-4">
            Try Again
          </Button>
        </div>
      ) : (
        <>
          {/* Filter Sidebar */}
          {!collection.listing_options?.hide_filters && (
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
          )}

          {/* Product List */}
          <div className={`w-full ${collection.listing_options?.hide_filters ? '' : 'md:w-3/4'}`}>
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

            {/* Product Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
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
                    sale_price={product.sale_price}
                    default_image={product.default_image}
                    brand={product.brand}
                    images={product.images}
                    is_favourite={product.is_favourite}
                  />
                </motion.div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
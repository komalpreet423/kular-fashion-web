'use client';

import { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { useParams } from 'next/navigation';
import { apiBaseUrl, apiBaseRoot } from '@/config';
import ProductCard from '@/components/product/card';
import { ProductBase } from '@/types/product';
import { Skeleton } from '@/components/ui/skeleton';
import { IoCloseSharp } from 'react-icons/io5';
import { motion } from 'framer-motion';
import FilterSidebar from '@/components/product/filter-sidebar';
import { Button } from '@/components/ui/button';
import { debounce } from 'lodash';

interface WebPage {
  id: number;
  title: string;
  slug: string;
  heading: string;
  content: string;
  description: string;
  summary: string;
  image_large: string | null;
  rules: Array<{
    type: 'must' | 'must_not';
    condition: 'has_tags' | 'has_all_tags';
    tag_ids: number[];
  }>;
}

interface Filter {
  product_types: { id: string; name: string }[];
  sizes: { id: string; name: string }[];
  colors: { id: string; color_code: string }[];
  price: { min: number; max: number };
  brands: { id: string; name: string }[];
}

interface SelectedFilters {
  product_types: string[];
  sizes: string[];
  colors: string[];
  brands: string[];
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

export default function WebPage() {
  const { slug } = useParams() as { slug: string };
  const [webPage, setWebPage] = useState<WebPage | null>(null);
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

  const fetchData = async () => {
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

      const pageRes = await axios.get(`${apiBaseUrl}web-pages/${slug}`, { params });
      if (!pageRes.data.success) throw new Error("Page not found");

      const filtersRes = await axios.get(`${apiBaseUrl}products`, {
        params: { filters: true },
      });

      const brandsRes = await axios.get(`${apiBaseUrl}brands`);

      setWebPage(pageRes.data.data.page);
      setProducts(pageRes.data.data.products || []);
      setFilters({
        product_types: filtersRes.data.filters?.product_types?.data?.map((type: any) => ({
          id: type.id.toString(),
          name: type.name
        })) || [],
        sizes: filtersRes.data.filters?.sizes?.data?.map((size: any) => ({
          id: size.id.toString(),
          name: size.name
        })) || [],
        colors: filtersRes.data.filters?.colors?.map((color: any) => ({
          id: color.id.toString(),
          color_code: color.hex || color.color_code
        })) || [],
        brands: brandsRes.data?.data?.map((brand: any) => ({
          id: brand.id.toString(),
          name: brand.name
        })) || [],
        price: filtersRes.data.filters?.price || { min: 0, max: 0 },
      });

      setError(null);
    } catch (err: any) {
      setError('Failed to load page');
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

  const imageUrl = webPage?.image_large ? `${apiBaseRoot}assets/images/${webPage.image_large}` : null;

  return (
    <div>
      {webPage && (
        <div className="grid md:grid-cols-2 text-white">
          <div className="h-full flex items-center justify-center">
            {imageUrl && (
              <img
                src={imageUrl}
                alt={webPage.title}
                className="shadow-md w-full h-full object-cover"
              />
            )}
          </div>
          <div className="bg-gray-100 text-black px-8 py-16">
            <h2 className="text-3xl font-bold mb-4">{webPage.heading || webPage.title}</h2>
            <div
              className="text-sm text-gray-700"
              dangerouslySetInnerHTML={{ __html: webPage.summary || '' }}
            />
          </div>
        </div>
      )}
      <div className="flex flex-col md:flex-row container mx-auto px-4 py-12 gap-6">
        <div className="w-full md:w-1/4">
          {loading ? (
            <div className="space-y-6 px-6">
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
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
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
          ) : (
            <div className="text-center py-10">
              <p>No products found matching your filters.</p>
            </div>
          )}
        </div>
      </div>
           {webPage?.description && (
        <div className="bg-gray-50 py-12">
          <div className="max-w-7xl mx-auto px-4">
            <div 
              className="prose max-w-none mx-auto"
              dangerouslySetInnerHTML={{ __html: webPage.description }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
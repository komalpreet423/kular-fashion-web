'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import axios from 'axios';
import { useParams } from 'next/navigation';
import { apiBaseUrl, apiBaseRoot } from '@/config';
import ProductCard from '@/components/product/card';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';
import FilterSidebar from '@/components/product/filter-sidebar';
import { Button } from '@/components/ui/button';
import { IoCloseSharp, IoChevronBack, IoChevronForward } from 'react-icons/io5';
import { debounce } from 'lodash';

interface WebPageType {
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

interface ProductBase {
  id: number;
  slug: string;
  name: string;
  price: number;
  sale_price?: number;
  default_image?: string;
  brand?: { id: number; name: string; slug: string };
  images?: { path: string }[];
  is_favourite?: boolean;
}

interface FilterType {
  price: { min: number; max: number };
  brands: Record<string, { id: number; name: string; slug: string }>;
  sizes: Record<string, { id: number; size: string; name: string }>;
  colors: Record<string, { id: number; name: string; hex: string }>;
  product_types: Record<string, { id: number; name: string; slug: string }>;
  tags: Record<string, { id: number; name: string | null; slug: string | null }>;
}
const PaginationComponent = ({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) => {
  if (totalPages <= 1) return null;

  const pages = [];
  const maxVisiblePages = 5;
  
  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
  
  if (endPage - startPage + 1 < maxVisiblePages) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }
  pages.push(
    <button
      key="prev"
      onClick={() => onPageChange(currentPage - 1)}
      disabled={currentPage === 1}
      className={`flex items-center justify-center px-3 h-10 ms-0 leading-tight border border-gray-300 rounded-s-lg
        ${currentPage === 1 
          ? 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-800 dark:border-gray-700' 
          : 'bg-white text-gray-700 hover:bg-blue-50 hover:text-blue-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white'}`}
    >
      <IoChevronBack className="w-4 h-4" />
      <span className="sr-only">Previous</span>
    </button>
  );
  if (startPage > 1) {
    pages.push(
      <button
        key={1}
        onClick={() => onPageChange(1)}
        className={`flex items-center justify-center px-4 h-10 leading-tight border border-gray-300
          ${1 === currentPage 
            ? 'bg-blue-800 text-white border-blue-800 dark:border-blue-700 dark:bg-blue-700' 
            : 'bg-white text-gray-700 hover:bg-blue-50 hover:text-blue-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white'}`}
      >
        1
      </button>
    );
    
    if (startPage > 2) {
      pages.push(
        <span key="ellipsis1" className="flex items-center justify-center px-2 h-10 leading-tight text-gray-500 dark:text-gray-400">
          ...
        </span>
      );
    }
  }
  for (let i = startPage; i <= endPage; i++) {
    pages.push(
      <button
        key={i}
        onClick={() => onPageChange(i)}
        className={`flex items-center justify-center px-4 h-10 leading-tight border border-gray-300
          ${i === currentPage 
            ? 'bg-black text-white border-blue-800 dark:border-blue-700 dark:bg-blue-700' 
            : 'bg-white text-gray-700 hover:bg-blue-50 hover:text-blue-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white'}`}
      >
        {i}
      </button>
    );
  }
  if (endPage < totalPages) {
    if (endPage < totalPages - 1) {
      pages.push(
        <span key="ellipsis2" className="flex items-center justify-center px-2 h-10 leading-tight text-gray-500 dark:text-gray-400">
          ...
        </span>
      );
    }
    
    pages.push(
      <button
        key={totalPages}
        onClick={() => onPageChange(totalPages)}
        className={`flex items-center justify-center px-4 h-10 leading-tight border border-gray-300
          ${totalPages === currentPage 
            ? 'bg-blue-800 text-white border-blue-800 dark:border-blue-700 dark:bg-blue-700' 
            : 'bg-white text-gray-700 hover:bg-blue-50 hover:text-blue-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white'}`}
      >
        {totalPages}
      </button>
    );
  }
  pages.push(
    <button
      key="next"
      onClick={() => onPageChange(currentPage + 1)}
      disabled={currentPage === totalPages}
      className={`flex items-center justify-center px-3 h-10 leading-tight border border-gray-300 rounded-e-lg
        ${currentPage === totalPages 
          ? 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-800 dark:border-gray-700' 
          : 'bg-white text-gray-700 hover:bg-blue-50 hover:text-blue-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white'}`}
    >
      <IoChevronForward className="w-4 h-4" />
      <span className="sr-only">Next</span>
    </button>
  );

  return (
    <div className="flex flex-col items-center mt-8">
      <div className="flex text-base">
        {pages}
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
        Showing page {currentPage} of {totalPages}
      </p>
    </div>
  );
};
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
  const [webPage, setWebPage] = useState<WebPageType | null>(null);
  const [products, setProducts] = useState<ProductBase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [perPage] = useState(12);
  const [filters, setFilters] = useState<FilterType>({
    price: { min: 0, max: 0 },
    brands: {},
    sizes: {},
    colors: {},
    product_types: {},
    tags: {},
  });

  const [selectedFilters, setSelectedFilters] = useState({
    product_types: [] as string[],
    sizes: [] as string[],
    colors: [] as string[],
    brands: [] as string[],
    price: { min: 0, max: -1 },
  });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const params: Record<string, string> = {
        per_page: perPage.toString(),
        page: currentPage.toString(),
        filters: 'true',
      };
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
      if (selectedFilters.price.min >= 0 && selectedFilters.price.max > selectedFilters.price.min) {
        params.min_price = selectedFilters.price.min.toString();
        params.max_price = selectedFilters.price.max.toString();
      }
      const pageRes = await axios.get(`${apiBaseUrl}web-pages/${slug}`, { params });
      if (!pageRes.data.success) throw new Error('Page not found');
      setWebPage(pageRes.data.data.page);
      setProducts(pageRes.data.data.products || []);
      if (pageRes.data.data.pagination) {
        setTotalPages(pageRes.data.data.pagination.last_page || 1);
      } else {
        const productCount = pageRes.data.data.products?.length || 0;
        setTotalPages(Math.ceil(productCount / perPage) || 1);
      }

      if (pageRes.data.data.filters) {
        const apiFilters = pageRes.data.data.filters;
        setFilters({
          price: apiFilters.price || { min: 0, max: 0 },
          brands: apiFilters.brands || {},
          sizes: apiFilters.sizes || {},
          colors: apiFilters.colors || {},
          product_types: apiFilters.product_types || {},
          tags: apiFilters.tags || {},
        });
      }

      setError(null);
    } catch (err) {
      setError('Failed to load page');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  }, [slug, currentPage, perPage, selectedFilters]);
  const debouncedFetchData = useMemo(
    () => debounce(fetchData, 300),
    [fetchData]
  );
  useEffect(() => {
    if (slug) {
      fetchData();
    }
  }, [slug]); 
  useEffect(() => {
    if (slug) {
      debouncedFetchData();
    }
    
    return () => {
      debouncedFetchData.cancel();
    };
  }, [slug, debouncedFetchData, currentPage, selectedFilters]);

  const resetFilters = () => {
    setSelectedFilters({
      product_types: [],
      sizes: [],
      colors: [],
      brands: [],
      price: { min: 0, max: -1 }, 
    });
    setCurrentPage(1);
  };

  const handleRemoveFilter = (
    type: keyof typeof selectedFilters,
    value: string | { min: number; max: number }
  ) => {
    setSelectedFilters(prev => {
      if (type === 'price') {
        return {
          ...prev,
          price: { min: 0, max: -1 }, 
        };
      } else if (Array.isArray(prev[type])) {
        return {
          ...prev,
          [type]: (prev[type] as string[]).filter(item => item !== value),
        };
      }
      return prev;
    });
    setCurrentPage(1);
  };

  const getFilterNameById = (
    type: 'product_types' | 'sizes' | 'colors' | 'brands',
    id: string
  ) => {
    const filterMap = {
      product_types: filters.product_types,
      sizes: filters.sizes,
      colors: filters.colors,
      brands: filters.brands,
    };

    const filter = filterMap[type][id];
    if (!filter) return id;

    if (type === 'colors') {
      return (filter as { hex: string }).hex;
    }
    return (filter as { name: string }).name;
  };

  const isAnyFilterSelected =
    selectedFilters.product_types.length > 0 ||
    selectedFilters.sizes.length > 0 ||
    selectedFilters.colors.length > 0 ||
    selectedFilters.brands.length > 0 ||
    (selectedFilters.price.max !== -1); 

  const imageUrl = webPage?.image_large
    ? `${apiBaseRoot}assets/images/${webPage.image_large}`
    : null;
  const filterArrays = useMemo(() => ({
    product_types: Object.values(filters.product_types).map(type => ({
      id: type.id.toString(),
      name: type.name,
    })),
    sizes: Object.values(filters.sizes).map(size => ({
      id: size.id.toString(),
      name: size.name,
    })),
    colors: Object.values(filters.colors).map(color => ({
      id: color.id.toString(),
      color_code: color.hex,
    })),
    brands: Object.values(filters.brands).map(brand => ({
      id: brand.id.toString(),
      name: brand.name,
    })),
    price: filters.price,
  }), [filters]);

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
            <h2 className="text-3xl font-bold mb-4">
              {webPage.heading || webPage.title}
            </h2>
            <div
              className="text-sm text-gray-700"
              dangerouslySetInnerHTML={{ __html: webPage.summary || '' }}
            />
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-4 p-4">
        {!error && (
          <div className="w-full md:w-1/4">
            <FilterSidebar
              filters={filterArrays}
              selectedFilters={selectedFilters}
              onFilterChange={(type, value) => {
                setSelectedFilters(prev => ({ ...prev, [type]: value }));
                setCurrentPage(1);
              }}
              onResetFilters={resetFilters}
            />
          </div>
        )}

        <div className="w-full md:w-3/4">
          {isAnyFilterSelected && (
            <div className="flex flex-wrap gap-3 mt-2 mb-4">
              {selectedFilters.product_types.map(categoryId => (
                <div
                  key={categoryId}
                  className="flex py-1.5 items-center bg-gray-200 rounded-lg px-3"
                >
                  <span>{getFilterNameById('product_types', categoryId)}</span>
                  <motion.button
                    className="ml-2 text-red-500"
                    onClick={() => handleRemoveFilter('product_types', categoryId)}
                    whileHover={{ scale: 1.2 }}
                  >
                    <IoCloseSharp />
                  </motion.button>
                </div>
              ))}
              {selectedFilters.sizes.map(sizeId => (
                <div
                  key={sizeId}
                  className="flex py-1.5 items-center bg-gray-200 rounded-lg px-3"
                >
                  <span>{getFilterNameById('sizes', sizeId)}</span>
                  <motion.button
                    className="ml-2 text-red-500"
                    onClick={() => handleRemoveFilter('sizes', sizeId)}
                    whileHover={{ scale: 1.2 }}
                  >
                    <IoCloseSharp />
                  </motion.button>
                </div>
              ))}
              {selectedFilters.brands.map(id => (
                <div
                  key={id}
                  className="flex py-1.5 items-center bg-gray-200 rounded-lg px-3"
                >
                  <span>{getFilterNameById('brands', id)}</span>
                  <motion.button
                    className="ml-2 text-red-500"
                    onClick={() => handleRemoveFilter('brands', id)}
                    whileHover={{ scale: 1.2 }}
                  >
                    <IoCloseSharp />
                  </motion.button>
                </div>
              ))}
              {selectedFilters.colors.map(colorId => (
                <div
                  key={colorId}
                  className="flex py-1.5 items-center bg-gray-200 rounded-lg px-3"
                >
                  <span
                    style={{
                      backgroundColor: getFilterNameById('colors', colorId),
                    }}
                    className="inline-block w-4 h-4 rounded-full mr-2"
                  />
                  <motion.button
                    className="text-red-500"
                    onClick={() => handleRemoveFilter('colors', colorId)}
                    whileHover={{ scale: 1.2 }}
                  >
                    <IoCloseSharp />
                  </motion.button>
                </div>
              ))}
              {/* Only show price filter if it's actively set by user */}
              {selectedFilters.price.max !== -1 && (
                <div className="flex py-1.5 items-center bg-gray-200 rounded-lg px-3">
                  <span>{`£${selectedFilters.price.min} - £${selectedFilters.price.max}`}</span>
                  <button
                    className="ml-2 text-red-500"
                    onClick={() => handleRemoveFilter('price', { min: 0, max: 0 })}
                  >
                    <IoCloseSharp />
                  </button>
                </div>
              )}
              <Button onClick={resetFilters} size="sm" variant="secondary">
                Clear Filters
              </Button>
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : products.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map(product => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <ProductCard {...product} />
                  </motion.div>
                ))}
              </div>
              
             
              <PaginationComponent
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </>
          ) : (
            <div className="text-center py-10">
              <p>No products found.</p>
              {isAnyFilterSelected && (
                <Button onClick={resetFilters} className="mt-4">
                  Clear Filters
                </Button>
              )}
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
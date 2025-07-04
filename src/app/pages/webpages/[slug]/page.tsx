'use client';

import { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { apiBaseUrl } from '@/config';
import ProductCard from "@/components/product/card";
import { ProductBase } from '@/types/product';
import FilterSidebar from "@/components/product/filter-sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
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

interface ActiveFilter {
  type: string;
  value: string;
  label: string;
  display?: React.ReactNode;
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

const ActiveFiltersDisplay = ({
  selectedFilters,
  availableFilters,
  onRemove
}: {
  selectedFilters: SelectedFilters;
  availableFilters: Filter;
  onRemove: (type: string, value?: string) => void;
}) => {
  const activeFilters = useMemo(() => {
    const filters: ActiveFilter[] = [];

    // Product Types
    selectedFilters.product_types.forEach(id => {
      const filter = availableFilters.product_types.find(f => f.id === id);
      if (filter) {
        filters.push({
          type: 'product_types',
          value: id,
          label: filter.name
        });
      }
    });

    // Sizes
    selectedFilters.sizes.forEach(id => {
      const filter = availableFilters.sizes.find(f => f.id === id);
      if (filter) {
        filters.push({
          type: 'sizes',
          value: id,
          label: filter.name
        });
      }
    });

    // Colors
    selectedFilters.colors.forEach(id => {
      const filter = availableFilters.colors.find(f => f.id === id);
      if (filter) {
        filters.push({
          type: 'colors',
          value: id,
          label: 'Color',
          display: (
            <div className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full border"
                style={{ backgroundColor: filter.color_code }}
              />
              <span>Color</span>
            </div>
          )
        });
      }
    });

    // Brands
    selectedFilters.brands.forEach(id => {
      const filter = availableFilters.brands.find(f => f.id === id);
      if (filter) {
        filters.push({
          type: 'brands',
          value: id,
          label: filter.name
        });
      }
    });

    // Price
    if (selectedFilters.price.max > 0 && 
        (selectedFilters.price.min !== availableFilters.price.min || 
         selectedFilters.price.max !== availableFilters.price.max)) {
      filters.push({
        type: 'price',
        value: 'price-range',
        label: `£${selectedFilters.price.min} - £${selectedFilters.price.max}`
      });
    }

    return filters;
  }, [selectedFilters, availableFilters]);

  if (activeFilters.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {activeFilters.map((filter) => (
        <Button
          key={`${filter.type}-${filter.value}`}
          variant="outline"
          size="sm"
          onClick={() => onRemove(filter.type, filter.value)}
          className="flex items-center gap-1"
        >
          {filter.display || filter.label}
          <X className="h-3 w-3" />
        </Button>
      ))}
    </div>
  );
};

export default function ProductListingPage() {
  const [products, setProducts] = useState<ProductBase[]>([]);
  const [filters, setFilters] = useState<Filter>({
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
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(12);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

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
      // Fetch brands separately since they might not change often
      let brandData = { data: [] };
      try {
        const brandResponse = await axios.get(`${apiBaseUrl}brands`);
        brandData = brandResponse.data;
      } catch (brandError) {
        console.error("Failed to fetch brands", brandError);
      }

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

      // Always request filters data
      params.filters = "true";

      const response = await axios.get(`${apiBaseUrl}products`, { params });
      const data = response.data;

      const tempFilters = {
        product_types: data.filters?.product_types?.data || [],
        sizes: data.filters?.sizes?.data || [],
        colors: data.filters?.colors || [],
        brands: brandData.data || [],
        price: { 
          min: data.filters?.price?.min || 0, 
          max: data.filters?.price?.max || 0 
        },
      };

      setFilters(tempFilters);

      // Adjust based on your API's structure
      const productArray = data.data ?? data;

      const cleaned = productArray.map((product: any) => ({
        ...product,
        is_favourite: product.is_favourite ?? false,
      }));

      setProducts(cleaned);
      setError(null);
    } catch (err: any) {
      console.error('Failed to fetch products:', err);
      setError('Something went wrong while fetching products.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [currentPage, perPage, memoizedSelectedFilters]);

  const handleRemoveFilter = (type: keyof SelectedFilters, value?: string) => {
    setSelectedFilters(prev => {
      if (type === 'price') {
        return {
          ...prev,
          price: { min: 0, max: -1 }
        };
      }
      
      if (value && Array.isArray(prev[type])) {
        return {
          ...prev,
          [type]: (prev[type] as string[]).filter(item => item !== value)
        };
      }
      
      return {
        ...prev,
        [type]: []
      };
    });
    setCurrentPage(1);
  };

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

  const isAnyFilterSelected =
    selectedFilters.product_types.length > 0 ||
    selectedFilters.sizes.length > 0 ||
    selectedFilters.colors.length > 0 ||
    selectedFilters.brands.length > 0 ||
    ((selectedFilters.price.min !== 0 || selectedFilters.price.max !== -1) &&
      selectedFilters.price.max >= 0);

  return (
    <div className="flex flex-col md:flex-row gap-4 p-4">
      {error ? (
        <div className="text-center text-red-500 py-10">{error}</div>
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
            <ActiveFiltersDisplay
              selectedFilters={selectedFilters}
              availableFilters={filters}
              onRemove={handleRemoveFilter}
            />

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
            ) : (
              <>
                {products.length === 0 ? (
                  <div className="text-center py-10">
                    <p>No products found matching your filters.</p>
                    <button
                      onClick={resetFilters}
                      className="mt-4 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                    >
                      Reset Filters
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {products.map((product) => (
                      <ProductCard key={product.id} {...product} />
                    ))}
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

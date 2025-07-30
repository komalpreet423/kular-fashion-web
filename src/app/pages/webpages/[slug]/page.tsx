'use client';

import { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { useParams } from 'next/navigation';
import { apiBaseUrl, apiBaseRoot } from '@/config';
import ProductCard from '@/components/product/card';
import { ProductBase } from '@/types/product';
import { Skeleton } from '@/components/ui/skeleton';
import { X, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface WebPage {
  id: number;
  title: string;
  slug: string;
  heading: string;
  content: string;
  description: string;
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
  onRemove,
}: {
  selectedFilters: SelectedFilters;
  availableFilters: Filter;
  onRemove: (type: string, value?: string) => void;
}) => {
  const activeFilters = useMemo(() => {
    const filters: ActiveFilter[] = [];

    selectedFilters.product_types.forEach(id => {
      const f = availableFilters.product_types.find(i => i.id === id);
      if (f) filters.push({ type: 'product_types', value: id, label: f.name });
    });

    selectedFilters.sizes.forEach(id => {
      const f = availableFilters.sizes.find(i => i.id === id);
      if (f) filters.push({ type: 'sizes', value: id, label: f.name });
    });

    selectedFilters.colors.forEach(id => {
      const f = availableFilters.colors.find(i => i.id === id);
      if (f) filters.push({
        type: 'colors',
        value: id,
        label: 'Color',
        display: (
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full border" style={{ backgroundColor: f.color_code }} />
            <span>Color</span>
          </div>
        ),
      });
    });

    selectedFilters.brands.forEach(id => {
      const f = availableFilters.brands.find(i => i.id === id);
      if (f) filters.push({ type: 'brands', value: id, label: f.name });
    });

    if (
      selectedFilters.price.max > 0 &&
      (selectedFilters.price.min !== availableFilters.price.min ||
        selectedFilters.price.max !== availableFilters.price.max)
    ) {
      filters.push({
        type: 'price',
        value: 'price-range',
        label: `£${selectedFilters.price.min} - £${selectedFilters.price.max}`,
      });
    }

    return filters;
  }, [selectedFilters, availableFilters]);

  if (activeFilters.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {activeFilters.map(filter => (
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

const FilterSidebar = ({
  filters,
  selectedFilters,
  onFilterChange,
  onResetFilters,
}: {
  filters: Filter;
  selectedFilters: SelectedFilters;
  onFilterChange: (type: keyof SelectedFilters, value: any) => void;
  onResetFilters: () => void;
}) => {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    product_types: false,
    sizes: false,
    colors: false,
    brands: false,
    price: false,
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="font-bold text-lg">Filters</h3>
        <button
          onClick={onResetFilters}
          className="text-sm text-blue-600 hover:underline"
        >
          Reset all
        </button>
      </div>

      {/* Product Types Filter */}
      <div className="border-b pb-4">
        <button
          className="flex justify-between items-center w-full"
          onClick={() => toggleSection('product_types')}
        >
          <span className="font-medium">Product Types</span>
          {expandedSections.product_types ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
        {expandedSections.product_types && (
          <div className="mt-2 space-y-2">
            {filters.product_types.map(type => (
              <div key={type.id} className="flex items-center">
                <input
                  type="checkbox"
                  id={`type-${type.id}`}
                  checked={selectedFilters.product_types.includes(type.id)}
                  onChange={() => {
                    const newTypes = selectedFilters.product_types.includes(type.id)
                      ? selectedFilters.product_types.filter(id => id !== type.id)
                      : [...selectedFilters.product_types, type.id];
                    onFilterChange('product_types', newTypes);
                  }}
                  className="mr-2"
                />
                <label htmlFor={`type-${type.id}`}>{type.name}</label>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sizes Filter */}
      <div className="border-b pb-4">
        <button
          className="flex justify-between items-center w-full"
          onClick={() => toggleSection('sizes')}
        >
          <span className="font-medium">Sizes</span>
          {expandedSections.sizes ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
        {expandedSections.sizes && (
          <div className="mt-2 space-y-2">
            {filters.sizes.map(size => (
              <div key={size.id} className="flex items-center">
                <input
                  type="checkbox"
                  id={`size-${size.id}`}
                  checked={selectedFilters.sizes.includes(size.id)}
                  onChange={() => {
                    const newSizes = selectedFilters.sizes.includes(size.id)
                      ? selectedFilters.sizes.filter(id => id !== size.id)
                      : [...selectedFilters.sizes, size.id];
                    onFilterChange('sizes', newSizes);
                  }}
                  className="mr-2"
                />
                <label htmlFor={`size-${size.id}`}>{size.name}</label>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Colors Filter */}
      <div className="border-b pb-4">
        <button
          className="flex justify-between items-center w-full"
          onClick={() => toggleSection('colors')}
        >
          <span className="font-medium">Colors</span>
          {expandedSections.colors ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
        {expandedSections.colors && (
          <div className="mt-2 grid grid-cols-4 gap-2">
            {filters.colors.map(color => (
              <div key={color.id} className="flex flex-col items-center">
                <button
                  onClick={() => {
                    const newColors = selectedFilters.colors.includes(color.id)
                      ? selectedFilters.colors.filter(id => id !== color.id)
                      : [...selectedFilters.colors, color.id];
                    onFilterChange('colors', newColors);
                  }}
                  className={`w-8 h-8 rounded-full border-2 ${selectedFilters.colors.includes(color.id) ? 'border-blue-500' : 'border-transparent'}`}
                  style={{ backgroundColor: color.color_code }}
                  aria-label={color.color_code}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Brands Filter */}
      <div className="border-b pb-4">
        <button
          className="flex justify-between items-center w-full"
          onClick={() => toggleSection('brands')}
        >
          <span className="font-medium">Brands</span>
          {expandedSections.brands ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
        {expandedSections.brands && (
          <div className="mt-2 space-y-2">
            {filters.brands.map(brand => (
              <div key={brand.id} className="flex items-center">
                <input
                  type="checkbox"
                  id={`brand-${brand.id}`}
                  checked={selectedFilters.brands.includes(brand.id)}
                  onChange={() => {
                    const newBrands = selectedFilters.brands.includes(brand.id)
                      ? selectedFilters.brands.filter(id => id !== brand.id)
                      : [...selectedFilters.brands, brand.id];
                    onFilterChange('brands', newBrands);
                  }}
                  className="mr-2"
                />
                <label htmlFor={`brand-${brand.id}`}>{brand.name}</label>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Price Filter */}
      <div className="border-b pb-4">
        <button
          className="flex justify-between items-center w-full"
          onClick={() => toggleSection('price')}
        >
          <span className="font-medium">Price Range</span>
          {expandedSections.price ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
        {expandedSections.price && (
          <div className="mt-4">
            <div className="flex justify-between mb-2">
              <span>£{filters.price.min}</span>
              <span>£{filters.price.max}</span>
            </div>
            <input
              type="range"
              min={filters.price.min}
              max={filters.price.max}
              value={selectedFilters.price.max > 0 ? selectedFilters.price.max : filters.price.max}
              onChange={(e) => {
                onFilterChange('price', {
                  min: filters.price.min,
                  max: parseInt(e.target.value),
                });
              }}
              className="w-full"
            />
            <div className="flex justify-between mt-4">
              <button
                className="px-3 py-1 border rounded text-sm"
                onClick={() => onFilterChange('price', { min: filters.price.min, max: filters.price.max })}
              >
                Apply
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default function WebPage() {
  const { slug } = useParams() as { slug: string };
  const [webPage, setWebPage] = useState<WebPage | null>(null);
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isAnyFilterSelected = useMemo(() => (
    selectedFilters.product_types.length > 0 ||
    selectedFilters.sizes.length > 0 ||
    selectedFilters.colors.length > 0 ||
    selectedFilters.brands.length > 0 ||
    selectedFilters.price.max > 0
  ), [selectedFilters]);

  const handleRemoveFilter = (type: keyof SelectedFilters, value?: string) => {
    setSelectedFilters(prev => {
      if (type === 'price') return { ...prev, price: { min: 0, max: -1 } };
      if (value) {
        return {
          ...prev,
          [type]: (prev[type] as string[]).filter(item => item !== value),
        };
      }
      return { ...prev, [type]: [] };
    });
  };

  const resetFilters = () => {
    setSelectedFilters({
      product_types: [],
      sizes: [],
      colors: [],
      brands: [],
      price: { min: 0, max: -1 },
    });
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const pageRes = await axios.get(`${apiBaseUrl}web-pages/${slug}`);
        if (!pageRes.data.success) throw new Error("Page not found");

        const filtersRes = await axios.get(`${apiBaseUrl}products`, {
          params: { filters: true },
        });

        const brandsRes = await axios.get(`${apiBaseUrl}brands`);

        setWebPage(pageRes.data.data.page);
        setProducts(pageRes.data.data.products || []);
        setFilters({
          product_types: filtersRes.data.filters?.product_types?.data || [],
          sizes: filtersRes.data.filters?.sizes?.data || [],
          colors: filtersRes.data.filters?.colors || [],
          brands: brandsRes.data?.data || [],
          price: filtersRes.data.filters?.price || { min: 0, max: 0 },
        });

        setError(null);
      } catch (err: any) {
        setError('Failed to load page');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [slug]);

  const imageUrl = webPage?.image_large ? `${apiBaseRoot}assets/images/${webPage.image_large}` : null;

  return (
    <div>
      {/* Header */}
      {webPage && (
        <div className="grid md:grid-cols-2  text-white">
          <div className="h-full flex items-center justify-center">
            {imageUrl && (
              <img
                src={imageUrl}
                alt={webPage.title}
                className=" shadow-md w-full h-full object-cover"
              />
            )}
          </div>
          <div className="bg-gray-100 text-black px-8 py-16">
            <h2 className="text-3xl font-bold mb-4">{webPage.heading || webPage.title}</h2>
            <div
              className="text-sm text-gray-700"
              dangerouslySetInnerHTML={{ __html: webPage.description || '' }}
            />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex flex-col md:flex-row container mx-auto px-4 py-12 gap-6">
        <div className="w-full md:w-1/4">
          {loading ? (
            <div className="space-y-6 px-6">
              <FiltersSkeleton />
              <FiltersSkeleton />
            </div>
          ) : (
            <FilterSidebar
              filters={filters}
              selectedFilters={selectedFilters}
              onFilterChange={(type, value) => {
                setSelectedFilters(prev => ({ ...prev, [type]: value }));
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map(product => (
                <ProductCard key={product.id} {...product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <p>No products found matching your tags.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
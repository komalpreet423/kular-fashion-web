"use client";

import { use, useEffect, useState } from "react";
import axios from "axios";
import { notFound } from "next/navigation";
import { apiBaseUrl, apiBaseRoot } from "@/config";
import ProductCard from "@/components/product/card";
import { ProductBase } from "@/types/product";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import FilterSidebar from "@/components/product/filter-sidebar";

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
  categories_product?: {
    products: ProductBase & {
      brand_id: number;
    };
  }[];
}

interface Filters {
  product_types: { id: string; name: string }[];
  sizes: { id: string; name: string }[];
  colors: { id: string; color_code: string }[];
  brands: { id: string; name: string }[];
  price: { min: number; max: number };
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

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default function CategoryPage({ params }: PageProps) {
  const { slug } = use(params);

  const [category, setCategory] = useState<CategoryData | null>(null);
  const [products, setProducts] = useState<ProductBase[]>([]);
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetchData = async () => {
    try {
      setLoading(true);
      const params: Record<string, string> = { per_page: "12" };
      if (selectedFilters.product_types.length > 0)
        params.product_types = selectedFilters.product_types.join(",");
      if (selectedFilters.sizes.length > 0)
        params.sizes = selectedFilters.sizes.join(",");
      if (selectedFilters.colors.length > 0)
        params.colors = selectedFilters.colors.join(",");
      if (selectedFilters.brands.length > 0)
        params.brands = selectedFilters.brands.join(",");
      if (selectedFilters.price.min >= 0)
        params.min_price = selectedFilters.price.min.toString();
      if (selectedFilters.price.max > selectedFilters.price.min)
        params.max_price = selectedFilters.price.max.toString();
      const categoryRes = await axios.get(`${apiBaseUrl}category/${slug}`, {
        params,
      });

      if (categoryRes.status === 404 || !categoryRes.data.success) {
        setError("Category not found");
        return;
      }
      const categoryData = categoryRes.data.data;
      const apiFilters = categoryRes.data.filters || {};
      const parsedFilters: Filters = {
        product_types: Object.values(apiFilters.product_types || {}).map(
          (t: any) => ({ id: t.id.toString(), name: t.name })
        ),
        sizes: Object.values(apiFilters.sizes || {}).map((s: any) => ({
          id: s.id.toString(),
          name: s.name,
        })),
        colors: Object.values(apiFilters.colors || {}).map((c: any) => ({
          id: c.id.toString(),
          color_code: c.hex,
        })),
        brands: Object.values(apiFilters.brands || {}).map((b: any) => ({
          id: b.id.toString(),
          name: b.name,
        })),
        price: apiFilters.price || { min: 0, max: 0 },
      };

      setFilters(parsedFilters);
      setCategory(categoryData);
      const categoryProducts =
        categoryData.categories_product?.map((cp: any) => {
          const brandObj =
            parsedFilters.brands.find(
              (b) => b.id === cp.products.brand_id.toString()
            ) || {
              id: cp.products.brand_id.toString(),
              name: cp.products.brand_id.toString(),
            };

          return {
            ...cp.products,
            brand: brandObj,
          };
        }) || [];

      setProducts(categoryProducts);
      setError(null);
    } catch (err: any) {
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 404) {
          setError("Category not found");
        } else {
          setError(`Server error: ${err.response?.status || "Unknown"}`);
        }
      } else {
        setError("Failed to fetch category data");
      }
      console.error("Error fetching category:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (slug) {
      fetchData();
    }
  }, [slug, selectedFilters]);

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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
                brand={product.brand}
                images={product.images}
                is_favourite={product.is_favourite}
              />
            </motion.div>
          ))}
        </div>
      );
    }

    return (
      <div className="text-center py-10">
        <p>No products found in this category.</p>
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
        <div className="w-full md:w-1/4">
          <FilterSidebar
            filters={filters}
            selectedFilters={selectedFilters}
            onFilterChange={(type, value) => {
              setSelectedFilters((prev) => ({ ...prev, [type]: value }));
            }}
            onResetFilters={() =>
              setSelectedFilters({
                product_types: [],
                sizes: [],
                colors: [],
                brands: [],
                price: { min: filters.price.min, max: filters.price.max },
              })
            }
          />
        </div>
        <div className="w-full md:w-3/4">{renderProductGrid()}</div>
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

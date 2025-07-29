'use client';

import { useEffect, useState, use } from 'react';
import axios from 'axios';
import { apiBaseUrl } from '@/config';
import ProductCard from "@/components/product/card";
import { ProductBase } from '@/types/product';
import { Skeleton } from "@/components/ui/skeleton";

interface WebPage {
  id: number;
  title: string;
  slug: string;
  description: string;
  rules: Array<{
    type: 'must' | 'must_not';
    condition: 'has_tags' | 'has_all_tags';
    tag_ids: number[];
  }>;
}

export default function WebPage({ params }: { params: { slug: string } }) {
  const { slug } = use(params);
  const [webPage, setWebPage] = useState<WebPage | null>(null);
  const [products, setProducts] = useState<ProductBase[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWebPage = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${apiBaseUrl}web-pages/${slug}`);
        console.log(response);
        if (!response.data.success) {
          throw new Error(response.data.message || 'Failed to load page');
        }

        setWebPage(response.data.data.page);
        setProducts(response.data.data.products || []);
        setError(null);
      } catch (err) {
        if (axios.isAxiosError(err)) {
          if (err.response?.status === 404) {
            setError('Page not found');
          } else {
            setError(err.response?.data?.message || 'Failed to load page');
          }
        } else {
          setError('An unexpected error occurred');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchWebPage();
  }, [slug]);

  if (loading) {
    return <PageSkeleton />;
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 text-center text-red-500">
        {error}
      </div>
    );
  }

  if (!webPage) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        Page not found
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Display products */}
      {products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <ProductCard 
              key={product.id} 
              {...product} 
              className={product.tags?.length ? 'border-blue-200' : ''}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-10">
          <p>No products found matching the current tag rules.</p>
          {webPage.rules?.length > 0 && (
            <p className="text-sm text-gray-500 mt-2">
              Current rules require products to match specific tag conditions.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function PageSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-8">
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="flex flex-col space-y-3">
              <Skeleton className="h-[200px] w-full rounded-lg" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

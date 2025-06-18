'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';
import { Product } from '@/types/product';
import { apiBaseUrl } from '@/config';
import ProductCard from '@/components/product/card';
import NoProductsFound from '@/components/product/not-found';

export default function DeptPage() {
  const { dept } = useParams() as { dept: string };
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await axios.get(`${apiBaseUrl}products`, {
          params: {
            department_slug: dept, 
          },
        });

        if (response.data?.success && Array.isArray(response.data.data)) {
          setProducts(response.data.data);
        } else {
          setProducts([]);
          setError('No products found in this department.');
        }
      } catch (err) {
        console.error(err);
        setError('Failed to load products. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (dept) {
      fetchProducts();
    }
  }, [dept]);

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

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
    <div className="container mx-auto px-4 py-4">
      <h1 className="text-2xl font-bold mb-2 capitalize">{dept}</h1>
      {products.length === 0 ? (
        <NoProductsFound
          message="No products found"
          description="Check back later or try a different department."
          showResetButton={false}
        />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((product) => (
            <ProductCard
              key={product.id}
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
          ))}
        </div>
      )}
    </div>
  );
}

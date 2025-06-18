'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';
import { Product } from '@/types/product';
import { apiBaseUrl } from '@/config';
import ProductCard from '@/components/product/card';
import NoProductsFound from '@/components/product/not-found';

export default function ProductTypePage() {
  const { dept, type } = useParams() as { dept: string; type: string };
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
            product_type_slug: type,
          },
        });

        if (response.data?.success && Array.isArray(response.data.data)) {
          setProducts(response.data.data);
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
  }, [dept, type]);

  if (loading) {
    return <div className="text-center py-8">Loading products...</div>;
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
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6 capitalize">
        {dept} / {type.replace(/-/g, ' ')}
      </h1>

      {products.length === 0 ? (
        <NoProductsFound
          message="No products found"
          description="Try adjusting your filters or check back later."
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

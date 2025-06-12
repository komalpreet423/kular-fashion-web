// src/app/product/[slug]/page.tsx
'use client';

import React from 'react';
import { useEffect, useState, Suspense } from 'react';
import { useCart } from '@/context/cart-context';
import ProductImages from '@/components/product/detail/images';
import ProductVariants from '@/components/product/variants';
import ProductSummary from '@/components/product/detail/summary';
import ProductHeader from '@/components/product/detail/header';
import ProductActions from '@/components/product/detail/actions';
import RelatedProducts from '@/components/product/detail/related';
import { formatCurrency } from '@/utils/formatCurrency';
import { toast } from 'react-toastify';
import LoadingProduct from '@/components/product/detail/loading';
import NoProductsFound from '@/components/product/not-found';
import { apiBaseUrl } from '@/config';
import { Product, ProductSize, ProductColor } from '@/types/product';

// Move main content to separate component
function ProductPageContent({ slug }: { slug: string }) {
  const [selectedColor, setSelectedColor] = useState<ProductColor | null>(null);
  const [selectedSize, setSelectedSize] = useState<ProductSize | null>(null);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`${apiBaseUrl}products/${slug}`);
        
        // Check for HTML response
        const contentType = res.headers.get('content-type');
        if (contentType?.includes('text/html')) {
          throw new Error('API endpoint returned HTML - check your backend routes');
        }

        if (!res.ok) {
          throw new Error('Product not found');
        }

        const apiResponse = await res.json();
        setProduct(apiResponse.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load product');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [slug]);

  const handleSelectionChange = (color: ProductColor | null, size: ProductSize | null) => {
    if (color) setSelectedColor(color);
    setSelectedSize(size);
  };

  const handleAddToCart = async () => {
    if (!selectedColor || !selectedSize) {
      toast.error("Please select color and size");
      return;
    }

    if (!product) {
      toast.error("Product not loaded");
      return;
    }

    const variant = product.variants.find(
      v => v.product_color_id === selectedColor.id && 
           v.product_size_id === selectedSize.id
    );

    if (!variant) {
      toast.error("Selected variant not found");
      return;
    }

    if (variant.quantity <= 0) {
      toast.error("Sorry! Quantity not available");
      return;
    }

    try {
      await addToCart({
        ...product,
        selectedColor,
        selectedSize
      }, variant.id, 1);
    } catch (err) {
      console.error("Add to cart error:", err);
      toast.error("Failed to add to cart. Please try again.");
    }
  };

  if (loading) return <LoadingProduct />;
  if (error) return <div>{error}</div>;
  if (!product) return <NoProductsFound 
    message='Product not found!' 
    description={`Sorry, the product you're looking for is not available`} 
  />;

  const prices = product.sizes?.map(size => size.price) || [];
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const priceText = minPrice === maxPrice
    ? formatCurrency(minPrice)
    : `${formatCurrency(minPrice)} - ${formatCurrency(maxPrice)}`;

  return (
    <>
      <div className="container mx-auto py-8 px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
          <div className="flex justify-center">
            <ProductImages 
              images={product.images} 
              selectedColorId={selectedColor?.id} 
              defaultImage={product.default_image} 
            />
          </div>

          <div className="flex flex-col">
            <ProductHeader productName={product.name} />
            
            {selectedSize && selectedColor && (
              <div className='text-gray-700'>
                {product.variants.find(
                  v => v.product_color_id === selectedColor.id &&
                       v.product_size_id === selectedSize.id
                )?.sku}
              </div>
            )}

            <div className='px-0'>
              <h4 className="text-2xl font-semibold">{product.name}</h4>
              
              {product.webInfo?.summary && (
                <div className="mb-0" dangerouslySetInnerHTML={{ __html: product.webInfo.summary }} />
              )}

              <div className="text-xl font-semibold mt-2">
                {!selectedSize ? priceText : formatCurrency(selectedSize.price)}
              </div>

              <ProductVariants
                colors={product.colors}
                sizes={product.sizes}
                variants={product.variants}
                onSelectionChange={handleSelectionChange}
              />

              <ProductActions 
                isDisabled={!selectedColor || !selectedSize} 
                onAddToCart={handleAddToCart} 
                productId={product.id} 
              />
              
              <ProductSummary 
                description={product.webInfo?.description} 
                specifications={product.specifications} 
              />
            </div>
          </div>
        </div>
      </div>

      {product.relatedProducts?.length > 0 && (
        <RelatedProducts relatedProducts={product.relatedProducts} />
      )}
    </>
  );
}

// Main page component that handles the Promise params
export default function ProductDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = React.use(params);
  
  return (
    <Suspense fallback={<LoadingProduct />}>
      <ProductPageContent slug={slug} />
    </Suspense>
  );
}

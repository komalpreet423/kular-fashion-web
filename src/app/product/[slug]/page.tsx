'use client';

import { useEffect, useState } from 'react';
import ProductImages from '@/components/product/detail/images';
import ProductVariants from '@/components/product/variants';
import React from 'react';
import NoProductsFound from '@/components/product/not-found';
import LoadingProduct from '@/components/product/detail/loading';
import ProductSummary from '@/components/product/detail/summary';
import { apiBaseUrl } from '@/config';
import { Product, ProductSize, ProductColor } from '@/types/product';
import ProductHeader from '@/components/product/detail/header';
import ProductActions from '@/components/product/detail/actions';
import RelatedProducts from '@/components/product/detail/related';
import { formatCurrency } from '@/utils/formatCurrency';

const ProductDetail = ({ params }: { params: Promise<{ slug: string }> }) => {
    const { slug } = React.use(params);

    const [selectedColor, setSelectedColor] = useState<ProductColor | null>(null);
    const [selectedSize, setSelectedSize] = useState<ProductSize | null>(null);
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const res = await fetch(`${apiBaseUrl}products/${slug}`);
                if (!res.ok) {
                    throw new Error('Product not found');
                }
                const apiResponse = await res.json();
                setProduct(apiResponse.data);

               /*  if(apiResponse.data.colors.length===1){
                    setSelectedColor(apiResponse.data.colors[0]);
                } */
            } catch (err) {
                setError((err as Error).message);
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [slug]);

    if (loading) {
        return (<LoadingProduct />);
    }

    if (!product) {
        return <NoProductsFound message='Product not found!' description={`Sorry, the product you're looking for is not available. Please check back later or explore other options`} />;
    }

    if (error) {
        return <div>{error}</div>;
    }

    const prices = product.sizes?.map((size) => size.price) || [];
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const priceText =
        minPrice === maxPrice
            ? formatCurrency(minPrice)
            : `${formatCurrency(minPrice)} - ${formatCurrency(maxPrice)}`;


    // Handle selection changes
    const handleSelectionChange = (color: ProductColor | null, size: ProductSize | null) => {
        if(color){
            setSelectedColor(color);
        }

        setSelectedSize(size);
    };

    const handleAddToCart = () => {
        // Add to cart logic here
    };

    const handleAddToWishlist = () => {
        // Add to wishlist logic here
    };

    return (
        <>
            <div className="container mx-auto py-8 px-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
                    {/* Product Image */}
                    <div className="flex justify-center">
                        <ProductImages images={product.images} selectedColorId={selectedColor?.id} defaultImage={product.default_image} />
                    </div>

                    {/* Product Details */}
                    <div className="flex flex-col">
                        <ProductHeader productName={product.name} />

                        {selectedSize && selectedColor ? <div className='text-gray-700'>
                            {product.variants.find(
                                (variant) =>
                                    variant.product_color_id === selectedColor.id &&
                                    variant.product_size_id === selectedSize.id
                            )?.sku}
                        </div> : null}

                        <div className='px-0'>
                            <h4 className="text-2xl font-semibold">{product.name}</h4>

                            {product.webInfo.summary &&
                                <div className="mb-0">
                                    <div dangerouslySetInnerHTML={{ __html: product.webInfo.summary }} />
                                </div>}

                            <div className="text-xl font-semibold mt-2">
                                {!selectedSize ? priceText : formatCurrency(selectedSize.price)}
                            </div>

                            {/* Color and Size Selection */}
                            <ProductVariants
                                colors={product.colors}
                                sizes={product.sizes}
                                onSelectionChange={handleSelectionChange}
                            />

                            <ProductActions isDisabled={!selectedColor || !selectedSize} onAddToCart={handleAddToCart} onAddToWishlist={handleAddToWishlist} />
                            <ProductSummary description={product.webInfo.description} specifications={product.specifications} />
                        </div>
                    </div>
                </div>
            </div>

            {Array.isArray(product.relatedProducts) && product.relatedProducts.length > 0 ? (
                <RelatedProducts relatedProducts={product.relatedProducts} />
            ) : null}

        </>
    );
};

export default ProductDetail;
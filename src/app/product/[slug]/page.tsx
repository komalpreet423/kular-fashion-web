'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import ProductImages from '@/components/product/images';
import ProductVariants from '@/components/product/variants';
import React from 'react';
import { FiShoppingCart } from 'react-icons/fi';
import { CiHeart } from 'react-icons/ci';
import NoProductsFound from '@/components/product/not-found';
import LoadingProduct from '@/components/product/loading-single';
import ProductSummary from '@/components/product/summary';
import { apiBaseUrl } from '@/config';
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Product, ProductSize, ProductColor } from '@/types/interfaces';

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

    // Handle selection changes
    const handleSelectionChange = (color: ProductColor | null, size: ProductSize | null) => {
        setSelectedColor(color);
        setSelectedSize(size);
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
                        <Breadcrumb>
                            <BreadcrumbList>
                                <BreadcrumbItem>
                                    <BreadcrumbLink href="/">Home</BreadcrumbLink>
                                </BreadcrumbItem>
                                <BreadcrumbSeparator />
                                <BreadcrumbItem>
                                    <BreadcrumbLink href="/products">Products</BreadcrumbLink>
                                </BreadcrumbItem>
                                <BreadcrumbSeparator />
                                <BreadcrumbItem>
                                    <BreadcrumbPage>{product.name}</BreadcrumbPage>
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>

                        <div className='px-0'>
                            <h4 className="text-2xl font-semibold">{product.name}</h4>

                            {product.webInfo.summary &&
                                <div className="mb-0">
                                    <div dangerouslySetInnerHTML={{ __html: product.webInfo.summary }} />
                                </div>}
                            <div className="text-lg font-semibold">${product.price}</div>

                            {/* Color and Size Selection */}
                            <ProductVariants
                                colors={product.colors}
                                sizes={product.sizes}
                                onSelectionChange={handleSelectionChange}
                            />

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                                <Button className="rounded-none uppercase" disabled={!selectedColor || !selectedSize}>
                                    <FiShoppingCart />
                                    Add to Cart
                                </Button>
                                <Button variant="outline" className="rounded-none uppercase">
                                    <CiHeart />
                                    Add to Wishlist
                                </Button>
                            </div>

                            <ProductSummary description={product.webInfo.description} specifications={product.specifications} />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ProductDetail;
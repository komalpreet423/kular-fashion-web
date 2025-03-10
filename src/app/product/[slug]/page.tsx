'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import ProductImages from '@/components/product/images';
import ProductVariants from '@/components/product/variants';
import React from 'react';
import { FiShoppingCart } from 'react-icons/fi';
import { config } from '@/config';
import { CiHeart } from 'react-icons/ci';
import NoProductsFound from '@/components/product/not-found';
import LoadingProduct from '@/components/product/loading-single';
import ProductSummary from '@/components/product/summary';

interface Brand {
    id: number;
    name: string;
    slug: string;
    short_name: string;
    image: string | null;
    small_image: string | null;
    medium_image: string | null;
    large_image: string | null;
}

interface Department {
    id: number;
    name: string;
    slug: string;
    image: string;
    description: string;
    status: string;
}

interface ProductType {
    id: number;
    name: string;
    slug: string;
    short_name: string;
    image: string | null;
    small_image: string | null;
    medium_image: string | null;
    large_image: string | null;
}

interface WebInfo {
    id: number;
    product_id: number;
    summary: string;
    description: string;
    is_splitted_with_colors: number;
    heading: string;
    meta_title: string;
    meta_keywords: string;
    meta_description: string;
    status: number;
}

interface SizeDetail {
    id: number;
    size_scale_id: number;
    name: string;
    new_code: string;
    old_code: string | null;
    length: string | null;
    status: string;
}

interface ProductSize {
    id: number;
    product_id: number;
    size_id: number;
    mrp: string;
    web_price: string;
    web_sale_price: string;
    detail: SizeDetail;
}

interface ColorDetail {
    id: number;
    name: string;
    slug: string;
    short_name: string;
    code: string;
    ui_color_code: string;
    status: string;
}

interface ProductColor {
    id: number;
    product_id: number;
    color_id: number;
    supplier_color_code: string;
    supplier_color_name: string;
    swatch_image_path: string | null;
    detail: ColorDetail;
}

// Define the main Product interface
interface Product {
    id: number;
    slug: string;
    name: string;
    article_code: string;
    manufacture_code: string;
    brand_id: number;
    department_id: number;
    product_type_id: number;
    price: string;
    sale_price: string | null;
    sale_start: string | null;
    sale_end: string | null;
    season: string | null;
    size_scale_id: number;
    min_size_id: number;
    max_size_id: number;
    brand: Brand;
    department: Department;
    productType: ProductType;
    webInfo: WebInfo;
    images: any[];
    specifications: any[];
    sizes: ProductSize[];
    colors: ProductColor[];
}


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
                const res = await fetch(`${config.apiBaseUrl}products/${slug}`);
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

    const productImages = [
        { src: "/images/temp/product1.jpg", alt: "Product 1" },
        { src: "/images/temp/product7.jpg", alt: "Product 7" },
        { src: "/images/temp/product3.jpg", alt: "Product 3" },
        { src: "/images/temp/product5.jpg", alt: "Product 5" },
        { src: "/images/temp/product6.jpg", alt: "Product 6" },
    ];

    // Handle selection changes
    const handleSelectionChange = (color: ProductColor | null, size: ProductSize | null) => {
        setSelectedColor(color);
        setSelectedSize(size);
    };

    return (
        <>
            <div className="container mx-auto py-8 px-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
                    {/* Product Image */}
                    <div className="flex justify-center">
                        <ProductImages images={productImages} />
                    </div>

                    {/* Product Details */}
                    <div className="flex flex-col">
                        <div className='px-0'>
                            <h4 className="text-2xl font-semibold">{product.name}</h4>

                            {product.webInfo.summary && 
                            <div className="mb-0">
                                <div dangerouslySetInnerHTML={{ __html: product.webInfo.summary }} />
                            </div> }
                            <div className="text-lg font-semibold">${product.price}</div>

                            {/* Color and Size Selection */}
                            <ProductVariants
                                colors={product.colors}
                                sizes={product.sizes}
                                onSelectionChange={handleSelectionChange}
                            />

                            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 w-full">
                                <Button className="rounded-none w-full sm:w-1/2 mt-4 uppercase" disabled={!selectedColor || !selectedSize}>
                                    <FiShoppingCart />
                                    Add to Cart
                                </Button>
                                <Button variant="outline" className="rounded-none w-full sm:w-1/2 mt-4 uppercase">
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
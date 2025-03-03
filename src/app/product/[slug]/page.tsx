'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import ProductImages from '@/components/product/images';
import ProductVariants from '@/components/product/variants';
import React from 'react';
import { FiShoppingCart } from 'react-icons/fi';

// Define types for the product
interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    imageUrl: string;
    colors: string[];
    sizes: string[];
    details: string[];
}

// Mock product data (replace with actual data fetching logic if needed)
const products: Product[] = [
    {
        id: '1',
        name: 'Product 1',
        imageUrl: '/product1.jpg',
        description: 'A great product!',
        price: 29.99,
        colors: ['#FF0000', '#00FF00', '#0000FF'],
        sizes: ['S', 'M', 'L', 'XL'],
        details: [
            'Material: 100% Cotton',
            'Care Instructions: Machine wash cold, tumble dry low',
            'Fit: Regular fit'
        ]
    },
    {
        id: '2',
        name: 'Product 2',
        imageUrl: '/product2.jpg',
        description: 'Another great product!',
        price: 49.99,
        colors: ['#FFFF00', '#00FFFF', '#FF00FF'],
        sizes: ['M', 'L', 'XL'],
        details: [
            'Material: 100% Polyester',
            'Care Instructions: Hand wash cold, lay flat to dry',
            'Fit: Slim fit'
        ]
    },
];

const ProductDetail = ({ params }: { params: Promise<{ slug: string }> }) => {
    // Unwrap the params object using React.use()
    const { slug } = React.use(params);

    const [selectedColor, setSelectedColor] = useState<string | null>(null);
    const [selectedSize, setSelectedSize] = useState<string | null>(null);

    // Find the product based on the slug
    const product = products.find((product) => product.id === slug);

    if (!product) {
        return <div>Product not found</div>; // or a 404 page
    }

    const productImages = [
        { src: "/images/temp/product1.jpg", alt: "Product 1" },
        { src: "/images/temp/product2.jpg", alt: "Product 2" },
        { src: "/images/temp/product3.jpg", alt: "Product 3" },
        { src: "/images/temp/product4.jpg", alt: "Product 4" },
    ];

    // Handle selection changes
    const handleSelectionChange = (color: string | null, size: string | null) => {
        setSelectedColor(color);
        setSelectedSize(size);
    };

    return (
        <>
            <div className="container mx-auto py-8 px-4">
                <div className="grid md:grid-cols-2 gap-8">
                    {/* Product Image */}
                    <div className="flex justify-center">
                        <ProductImages images={productImages} />
                    </div>

                    {/* Product Details */}
                    <div className="flex flex-col">
                        <div className='px-4'>
                            <h4 className="text-2xl font-semibold">{product.name}</h4>
                            <p className="text-lg">{product.description}</p>
                            <div className="mt-4 text-xl font-semibold">${product.price}</div>

                            {/* Product Details */}
                            <div className="mt-4">
                                <h3 className="text-lg font-semibold">Product Details</h3>
                                <ul className="list-disc list-inside mt-2">
                                    {product.details.map((detail, index) => (
                                        <li key={index} className="text-sm">{detail}</li>
                                    ))}
                                </ul>
                            </div>

                            {/* Color and Size Selection */}
                            <ProductVariants
                                colors={product.colors}
                                sizes={product.sizes}
                                onSelectionChange={handleSelectionChange}
                            />

                            {/* Display Selected Options */}
                            <div className="mt-1 mb-4">
                                {selectedColor && (
                                    <p className="text-sm">
                                        Selected Color: <span style={{ color: selectedColor }}>⬤</span>
                                    </p>
                                )}
                                {selectedSize && (
                                    <p className="text-sm">Selected Size: {selectedSize}</p>
                                )}
                            </div>
                            <Button className='rounded-none w-50'>
                                <FiShoppingCart />
                                Add to Cart
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ProductDetail;
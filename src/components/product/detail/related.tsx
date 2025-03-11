import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ProductBase } from '@/types/product';
import ProductCard from '@/components/product/card';

interface RelatedProductsProps {
    relatedProducts: ProductBase[];
}

const RelatedProducts = ({ relatedProducts }: RelatedProductsProps) => {
    const numberOfProducts = relatedProducts.length;
    const gridColumns = numberOfProducts < 4 ? numberOfProducts + 1 : 5;

    return (
        <div className="py-8 px-4 bg-gray-100">
            <h3 className="text-2xl font-semibold mb-4 text-center">Related Products</h3>
            <div
                className={`grid gap-4 justify-center`}
                style={{
                    gridTemplateColumns: `repeat(auto-fit, minmax(250px, 1fr))`, // Auto-adjust card width
                    maxWidth: `${gridColumns * 250}px`, // Limit max width based on number of items
                    margin: '0 auto', // Center the grid container
                }}
            >
                {relatedProducts.map((product, index: number) => (
                    <ProductCard {...product} key={`related-product-${index}`} />
                ))}
            </div>
        </div>
    );
};

export default RelatedProducts;
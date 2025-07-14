'use client';
import { apiBaseRoot } from '@/config';
import { ProductColor, ProductSize, ProductVariant } from '@/types/product';
import { useState, useEffect } from 'react';

interface ProductOptionsProps {
    colors: ProductColor[];
    sizes: ProductSize[];
    variants: ProductVariant[];
     selectedColor: ProductColor | null;
    selectedSize: ProductSize | null;
    onSelectionChange: (selectedColor: ProductColor | null, selectedSize: ProductSize | null) => void;
}

const ProductVariants = ({ 
    colors, 
    sizes, 
    variants, 
    selectedColor: initialSelectedColor, 
    selectedSize: initialSelectedSize,
    onSelectionChange 
}: ProductOptionsProps) => {
    const [selectedColor, setSelectedColor] = useState<ProductColor | null>(initialSelectedColor);
    const [selectedSize, setSelectedSize] = useState<ProductSize | null>(initialSelectedSize);

    // Update internal state when props change
    useEffect(() => {
        setSelectedColor(initialSelectedColor);
    }, [initialSelectedColor]);

    useEffect(() => {
        setSelectedSize(initialSelectedSize);
    }, [initialSelectedSize]);

    const getVariantQuantity = (sizeId: number): number => {
        if (!selectedColor) return 0;
        const match = variants.find(
            v => v.product_color_id === selectedColor.id && v.product_size_id === sizeId
        );
        return match?.quantity ?? 0;
    };

    return (
        <>
            {/* Color Swatches */}
            <div className="mt-2">
                <h3 className="text-lg font-semibold">Colors</h3>
                <div className="flex space-x-2">
                    {colors.map((color, index) => (
                        <button
                            key={index}
                            className={`w-12 h-12 rounded-full border-2 cursor-pointer ${selectedColor?.id === color.id
                                ? 'border-primary'
                                : 'border-gray-300'
                                }`}
                            style={{
                                background: color.swatch_image_path
                                    ? `url(${apiBaseRoot + color.swatch_image_path}) no-repeat center center / cover`
                                    : color.detail.ui_color_code
                            }}
                            onClick={() => setSelectedColor(color)}
                            aria-label={`Select color ${color.detail.name}`}
                        ></button>
                    ))}
                </div>
            </div>

            {/* Sizes */}
            <div className="mt-4">
                <h3 className="text-lg font-semibold">Sizes</h3>
                <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-6 gap-2">
                    {sizes.map((size, index) => {
                        const quantity = getVariantQuantity(size.id);
                        const isUnavailable = quantity <= 0;

                        return (
                            <button
                                key={index}
                                disabled={isUnavailable}
                                onClick={() => !isUnavailable && setSelectedSize(size)}
                                className={`
                                    px-4 py-2 border-2 uppercase rounded-none
                                    ${selectedSize === size ? 'border-primary bg-primary/50 text-primary' : ''}
                                    ${isUnavailable
                                        ? 'text-gray-400 line-through border-gray-300 cursor-not-allowed'
                                        : 'border-gray-300 hover:bg-gray-100 cursor-pointer'}
                                `}
                            >
                                {size.detail.name}
                            </button>
                        );
                    })}
                </div>
            </div>
        </>
    );
};

export default ProductVariants;
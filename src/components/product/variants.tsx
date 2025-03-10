'use client'; // Mark this as a Client Component

import { useState, useEffect } from 'react';

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

interface ProductOptionsProps {
    colors: ProductColor[];
    sizes: ProductSize[];
    onSelectionChange: (selectedColor: ProductColor | null, selectedSize: ProductSize | null) => void;
}

const ProductVariants = ({ colors, sizes, onSelectionChange }: ProductOptionsProps) => {
    const [selectedColor, setSelectedColor] = useState<ProductColor | null>(null);
    const [selectedSize, setSelectedSize] = useState<ProductSize | null>(null);

    // Notify parent whenever selectedColor or selectedSize changes
    useEffect(() => {
        onSelectionChange(selectedColor, selectedSize);
    }, [selectedColor, selectedSize, onSelectionChange]);

    return (
        <div>
            {/* Color Swatches */}
            <div className="mt-4">
                <h3 className="text-lg font-semibold">Colors</h3>
                <div className="flex space-x-2 mt-2">
                    {colors.map((color, index) => (
                        <button
                            key={index}
                            className={`w-8 h-8 rounded-full border-2 cursor-pointer ${selectedColor === color
                                ? 'border-primary'
                                : 'border-gray-300'
                                }`}
                            style={{ backgroundColor: color.detail.ui_color_code }}
                            onClick={() => setSelectedColor(color)}
                            aria-label={`Select color ${color}`}
                        ></button>
                    ))}
                </div>
            </div>

            {/* Sizes */}
            <div className="mt-2">
                <h3 className="text-lg font-semibold">Sizes</h3>
                <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-6 gap-2 mt-2">
                    {sizes.map((size, index) => (
                        <button
                            key={index}
                            className={`px-4 py-2 border-2 rounded-md cursor-pointer ${selectedSize === size
                                ? 'border-primary bg-primary/50'
                                : 'border-gray-300 hover:bg-gray-100'
                                }`}
                            onClick={() => setSelectedSize(size)}
                        >
                            {size.detail.name}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ProductVariants;
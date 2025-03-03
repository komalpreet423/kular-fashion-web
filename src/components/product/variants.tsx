'use client'; // Mark this as a Client Component

import { useState, useEffect } from 'react';

interface ProductOptionsProps {
    colors: string[];
    sizes: string[];
    onSelectionChange: (selectedColor: string | null, selectedSize: string | null) => void;
}

const ProductVariants = ({ colors, sizes, onSelectionChange }: ProductOptionsProps) => {
    const [selectedColor, setSelectedColor] = useState<string | null>(null);
    const [selectedSize, setSelectedSize] = useState<string | null>(null);

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
                            className={`w-8 h-8 rounded-full border-2 cursor-pointer ${
                                selectedColor === color
                                    ? 'border-primary' // Highlight selected color
                                    : 'border-gray-300'
                            }`}
                            style={{ backgroundColor: color }}
                            onClick={() => setSelectedColor(color)}
                            aria-label={`Select color ${color}`}
                        ></button>
                    ))}
                </div>
            </div>

            {/* Sizes */}
            <div className="mt-4">
                <h3 className="text-lg font-semibold">Sizes</h3>
                <div className="flex space-x-2 mt-2">
                    {sizes.map((size, index) => (
                        <button
                            key={index}
                            className={`px-4 py-2 border-2 rounded-md cursor-pointer ${
                                selectedSize === size
                                    ? 'border-primary bg-primary/50' // Highlight selected size
                                    : 'border-gray-300 hover:bg-gray-100'
                            }`}
                            onClick={() => setSelectedSize(size)}
                        >
                            {size}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ProductVariants;
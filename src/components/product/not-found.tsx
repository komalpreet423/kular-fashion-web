'use client';

import { Button } from '@/components/ui/button';
import Image from 'next/image';

interface NoProductsFoundProps {
    onResetFilters?: () => void;
    message?: string;
    showResetButton?: boolean;
}

export default function NoProductsFound({ onResetFilters, message, showResetButton = true }: NoProductsFoundProps) {
    return (
        <div className="flex flex-col items-center justify-center text-center py-12">
            <Image
                src="/images/search-404.svg"
                alt="No products found"
                width={400}
                height={200}
                className="mb-6"
            />

            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
                {message || "No Products Found"}
            </h2>

            <p className="text-gray-600 dark:text-gray-400 mb-6">
                We couldn't find any products matching your criteria. Try adjusting your filters or browsing other categories.
            </p>

            {showResetButton && onResetFilters && (
                <Button
                    onClick={onResetFilters}
                    size="lg"
                    variant="outline"
                    className="mt-4"
                >
                    Reset Filters
                </Button>
            )}
        </div>
    );
}
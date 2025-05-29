'use client';

import { Button } from '@/components/ui/button';
import Image from 'next/image';

interface NoAddressFoundProps {
    onResetFilters?: () => void;
    message?: string;
    description?: string;
    showResetButton?: boolean;
}

export default function NoAddressFound({ onResetFilters, message, description, showResetButton = true }: NoAddressFoundProps) {
    return (
        <div className="flex flex-col items-center justify-center text-center py-12">
            <Image
                src="/images/search-404.svg"
                alt="Address list is empty."
                width={400}
                height={200}
                className="mb-6"
            />

            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
                {message || "Address list is empty."}
            </h2>

            <p className="text-gray-600 dark:text-gray-400 mb-6">
                {description || `Your address list is currently empty. Add some addresses here!`}
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
import React from 'react';
import CustomTabs from '@/components/ui/custom-tabs';

interface Specification {
    label: string;
    value: string;
}

interface ProductSummaryProps {
    description: string;
    specifications: Specification[];
}

const ProductSummary: React.FC<ProductSummaryProps> = ({ description, specifications }) => {
    const productSummary = [];
    if (description) {
        productSummary.push({ label: 'Description', content: description });
    }

    if (specifications.length > 0) {
        const specificationsContent = `
            <table class="min-w-full bg-white border border-gray-300">
                ${specifications.map(spec => `
                    <tr>
                        <td class="py-2 px-4 border-b border-r border-gray-200 font-medium">${spec.label}</td>
                        <td class="py-2 px-4 border-b border-gray-200">${spec.value}</td>
                    </tr>
                `).join('')}
            </table>
        `;

        productSummary.push({ label: 'Specifications', content: specificationsContent });
    }

    return (
        <div className="mt-2">
            <div className="space-y-3">
                {productSummary.length > 0 &&
                    <div className='mt-2'>
                        <CustomTabs tabs={productSummary} />
                    </div>}
            </div>
        </div>
    );
};

export default ProductSummary;
    'use client';

    import { useState } from 'react';
    import { MdFilterAlt } from "react-icons/md";
    import { Checkbox } from '@/components/ui/checkbox';
    import { Slider } from '@/components/ui/slider';
    import { SlArrowDown, SlArrowUp } from 'react-icons/sl';
    import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
    import { Button } from '@/components/ui/button';
    import { motion, AnimatePresence } from 'framer-motion';

    interface Filter {
        product_types: { id: string; name: string }[];
        sizes: { id: string; name: string }[];
        colors: { id: string; color_code: string }[];
        price: { min: number; max: number };
        brands: { id: string; name: string }[];
    }

    interface SelectedFilters {
        product_types: string[];
        sizes: string[];
        colors: string[];
        price: { min: number; max: number };
        brands: string[];
    }

    interface FilterSidebarProps {
        filters: Filter;
        selectedFilters: SelectedFilters;
        onFilterChange: (type: keyof SelectedFilters, value: any) => void;
        onResetFilters: () => void;
    }

    export default function FilterSidebar({ filters, selectedFilters, onFilterChange, onResetFilters }: FilterSidebarProps) {
        const [filterOpen, setFilterOpen] = useState({
            product_types: true,
            sizes: true,
            colors: true,
            price: true,
            brands: true,
        });

        // State to track how many items to show for each filter
        const [visibleItems, setVisibleItems] = useState({
            product_types: 5,
            sizes: 5,
            colors: 5,
            brands: 5,
        });

        const toggleFilter = (filter: keyof typeof filterOpen) => {
            setFilterOpen((prev) => ({ ...prev, [filter]: !prev[filter] }));
        };

        const toggleSelection = <T,>(selected: T[], value: T) => {
            return selected.includes(value) ? selected.filter((v) => v !== value) : [...selected, value];
        };

        const shouldShowFilterSection = (filter: keyof typeof filters) => {
            switch (filter) {
                case 'product_types':
                    return filters.product_types.length > 0;
                case 'sizes':
                    return filters.sizes.length > 0;
                case 'colors':
                    return filters.colors.length > 0;
                case 'brands':
                    return filters.brands.length > 0;
                case 'price':
                    return filters.price.min !== filters.price.max;
                default:
                    return false;
            }
        };

        const toggleShowMore = (filterType: keyof typeof visibleItems) => {
            setVisibleItems(prev => {
                let maxItems = 5;
                switch (filterType) {
                    case 'colors':
                        maxItems = filters.colors.length;
                        break;
                    case 'product_types':
                        maxItems = filters.product_types.length;
                        break;
                    case 'sizes':
                        maxItems = filters.sizes.length;
                        break;
                    case 'brands':
                        maxItems = filters.brands.length;
                        break;
                    default:
                        maxItems = 10;
                }

                return {
                    ...prev,
                    [filterType]: prev[filterType] === 5 ? maxItems : 5
                };
            });
        };

        return (
            <>
                {/* Mobile View */}
                <div className="md:hidden">
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button size={'sm'} className='rounded-none ml-auto'>
                                <MdFilterAlt /> Apply Filters
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="right">
                            <SheetHeader>
                                <SheetTitle>Filters</SheetTitle>
                                <SheetDescription>Apply your filter preferences</SheetDescription>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={onResetFilters}
                                    className="w-fit mt-2"
                                >
                                    Reset Filters
                                </Button>
                            </SheetHeader>
                            <div className="px-3 py-4">
                                {['product_types', 'sizes', 'colors', 'brands', 'price'].map((filter) => (
                                    shouldShowFilterSection(filter as keyof typeof filters) && (
                                        <div key={filter} className="mb-6 border-b pb-4 last:border-b-0">
                                            <div
                                                className="flex justify-between items-center cursor-pointer py-2"
                                                onClick={() => toggleFilter(filter as keyof typeof filterOpen)}
                                            >
                                                <h3 className="text-md font-medium capitalize">
                                                    {filter.replace('_', ' ')}
                                                </h3>
                                                <span className="text-gray-500">
                                                    {filterOpen[filter as keyof typeof filterOpen] ? <SlArrowUp /> : <SlArrowDown />}
                                                </span>
                                            </div>
                                            <AnimatePresence>
                                                {filter === 'product_types' && filterOpen.product_types && (
                                                    <motion.div
                                                        initial={{ opacity: 0, height: 0 }}
                                                        animate={{ opacity: 1, height: 'auto' }}
                                                        exit={{ opacity: 0, height: 0 }}
                                                        transition={{ duration: 0.3 }}
                                                        className="space-y-2"
                                                    >
                                                        {filters.product_types.slice(0, visibleItems.product_types).map((category) => (
                                                            <div key={`category-m-${category.id}`} className="flex items-center space-x-2">
                                                                <Checkbox
                                                                    id={`category-m-${category.id}`}
                                                                    checked={selectedFilters.product_types.includes(category.id)}
                                                                    onCheckedChange={() => onFilterChange('product_types', toggleSelection(selectedFilters.product_types, category.id))}
                                                                />
                                                                <label htmlFor={`category-m-${category.id}`} className="text-sm cursor-pointer">
                                                                    {category.name}
                                                                </label>
                                                            </div>
                                                        ))}
                                                        {filters.product_types.length > 5 && (
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="text-sm w-full mt-2 text-primary"
                                                                onClick={() => toggleShowMore('product_types')}
                                                            >
                                                                {visibleItems.product_types > 5 ? 'Show Less' : `Show More (${filters.product_types.length - 5})`}
                                                            </Button>
                                                        )}
                                                    </motion.div>
                                                )}
                                                {filter === 'sizes' && filterOpen.sizes && (
                                                    <motion.div
                                                        initial={{ opacity: 0, height: 0 }}
                                                        animate={{ opacity: 1, height: 'auto' }}
                                                        exit={{ opacity: 0, height: 0 }}
                                                        transition={{ duration: 0.3 }}
                                                        className="space-y-2"
                                                    >
                                                        {filters.sizes.slice(0, visibleItems.sizes).map((size) => (
                                                            <div key={`size-m-${size.id}`} className="flex items-center space-x-2">
                                                                <Checkbox
                                                                    id={`size-m-${size.id}`}
                                                                    checked={selectedFilters.sizes.includes(size.id)}
                                                                    onCheckedChange={() => onFilterChange('sizes', toggleSelection(selectedFilters.sizes, size.id))}
                                                                />
                                                                <label htmlFor={`size-m-${size.id}`} className="text-sm cursor-pointer">
                                                                    {size.name}
                                                                </label>
                                                            </div>
                                                        ))}
                                                        {filters.sizes.length > 5 && (
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="text-sm w-full mt-2 text-primary"
                                                                onClick={() => toggleShowMore('sizes')}
                                                            >
                                                                {visibleItems.sizes > 5 ? 'Show Less' : `Show More (${filters.sizes.length - 5})`}
                                                            </Button>
                                                        )}
                                                    </motion.div>
                                                )}
                                                {filter === 'colors' && filterOpen.colors && (
                                                    <motion.div
                                                        initial={{ opacity: 0, height: 0 }}
                                                        animate={{ opacity: 1, height: 'auto' }}
                                                        exit={{ opacity: 0, height: 0 }}
                                                        transition={{ duration: 0.3 }}
                                                    >
                                                        <div className="flex flex-wrap gap-2 mt-2">
                                                            {filters.colors.slice(0, visibleItems.colors).map((color) => (
                                                                <button
                                                                    key={`color-m-${color.id}`}
                                                                    className={`w-8 h-8 rounded-full border ${selectedFilters.colors.includes(color.id) ? 'ring-2 ring-offset-1 ring-primary' : ''}`}
                                                                    style={{ backgroundColor: color.color_code }}
                                                                    onClick={() => onFilterChange('colors', toggleSelection(selectedFilters.colors, color.id))}
                                                                    aria-label={`Color ${color.color_code}`}
                                                                />
                                                            ))}
                                                        </div>
                                                        {filters.colors.length > 5 && (
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="text-sm w-full mt-2 text-primary"
                                                                onClick={() => toggleShowMore('colors')}
                                                            >
                                                                {visibleItems.colors > 5 ? 'Show Less' : `Show More (${filters.colors.length - 5})`}
                                                            </Button>
                                                        )}
                                                    </motion.div>
                                                )}
                                                {filter === 'brands' && filterOpen.brands && (
                                                    <motion.div
                                                        initial={{ opacity: 0, height: 0 }}
                                                        animate={{ opacity: 1, height: 'auto' }}
                                                        exit={{ opacity: 0, height: 0 }}
                                                        transition={{ duration: 0.3 }}
                                                        className="space-y-2"
                                                    >
                                                        {filters.brands.slice(0, visibleItems.brands).map((brand) => (
                                                            <div key={`brand-m-${brand.id}`} className="flex items-center space-x-2">
                                                                <Checkbox
                                                                    id={`brand-m-${brand.id}`}
                                                                    checked={selectedFilters.brands.includes(brand.id)}
                                                                    onCheckedChange={() =>
                                                                        onFilterChange('brands', toggleSelection(selectedFilters.brands, brand.id))
                                                                    }
                                                                />
                                                                <label htmlFor={`brand-m-${brand.id}`} className="text-sm cursor-pointer">
                                                                    {brand.name}
                                                                </label>
                                                            </div>
                                                        ))}
                                                        {filters.brands.length > 5 && (
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="text-sm w-full mt-2 text-primary"
                                                                onClick={() => toggleShowMore('brands')}
                                                            >
                                                                {visibleItems.brands > 5 ? 'Show Less' : `Show More (${filters.brands.length - 5})`}
                                                            </Button>
                                                        )}
                                                    </motion.div>
                                                )}
                                                {filter === 'price' && filterOpen.price && (
                                                    <motion.div
                                                        initial={{ opacity: 0, height: 0 }}
                                                        animate={{ opacity: 1, height: 'auto' }}
                                                        exit={{ opacity: 0, height: 0 }}
                                                        transition={{ duration: 0.3 }}
                                                    >
                                                        <div className="mt-4 space-y-4">
                                                            <Slider
                                                                min={filters.price.min}
                                                                max={filters.price.max}
                                                                step={1}
                                                                value={[
                                                                    selectedFilters.price.min,
                                                                    selectedFilters.price.max > -1 ? selectedFilters.price.max : filters.price.max
                                                                ]}
                                                                onValueChange={(val) => onFilterChange('price', { min: val[0], max: val[1] })}
                                                            />
                                                            <div className="flex justify-between text-sm">
                                                                <span>£{selectedFilters.price.min}</span>
                                                                <span>£{selectedFilters.price.max > -1 ? selectedFilters.price.max : filters.price.max}</span>
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    )
                                ))}
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>

                {/* Desktop View */}
                <div className="hidden md:block rounded-lg shadow-lg bg-white p-4 sticky top-4">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-semibold">Filters</h2>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onResetFilters}
                            className="text-primary"
                        >
                            Reset all
                        </Button>
                    </div>

                    {['product_types', 'sizes', 'colors', 'brands', 'price'].map((filter) => (
                        shouldShowFilterSection(filter as keyof typeof filters) && (
                            <div key={filter} className="mb-6 border-b pb-4 last:border-b-0">
                                <div
                                    className="flex justify-between items-center cursor-pointer py-2"
                                    onClick={() => toggleFilter(filter as keyof typeof filterOpen)}
                                >
                                    <h3 className="text-md font-medium capitalize">
                                        {filter.replace('_', ' ')}
                                    </h3>
                                    <span className="text-gray-500">
                                        {filterOpen[filter as keyof typeof filterOpen] ? <SlArrowUp /> : <SlArrowDown />}
                                    </span>
                                </div>
                                <AnimatePresence>
                                    {filter === 'product_types' && filterOpen.product_types && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            transition={{ duration: 0.3 }}
                                            className="space-y-2"
                                        >
                                            {filters.product_types.slice(0, visibleItems.product_types).map((category) => (
                                                <div key={`category-d-${category.id}`} className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id={`category-d-${category.id}`}
                                                        checked={selectedFilters.product_types.includes(category.id)}
                                                        onCheckedChange={() => onFilterChange('product_types', toggleSelection(selectedFilters.product_types, category.id))}
                                                    />
                                                    <label htmlFor={`category-d-${category.id}`} className="text-sm cursor-pointer">
                                                        {category.name}
                                                    </label>
                                                </div>
                                            ))}
                                            {filters.product_types.length > 5 && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-sm w-full mt-2 text-primary"
                                                    onClick={() => toggleShowMore('product_types')}
                                                >
                                                    {visibleItems.product_types > 5 ? 'Show Less' : `Show More (${filters.product_types.length - 5})`}
                                                </Button>
                                            )}
                                        </motion.div>
                                    )}
                                    {filter === 'sizes' && filterOpen.sizes && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            transition={{ duration: 0.3 }}
                                            className="space-y-2"
                                        >
                                            {filters.sizes.slice(0, visibleItems.sizes).map((size) => (
                                                <div key={`size-d-${size.id}`} className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id={`size-d-${size.id}`}
                                                        checked={selectedFilters.sizes.includes(size.id)}
                                                        onCheckedChange={() => onFilterChange('sizes', toggleSelection(selectedFilters.sizes, size.id))}
                                                    />
                                                    <label htmlFor={`size-d-${size.id}`} className="text-sm cursor-pointer">
                                                        {size.name}
                                                    </label>
                                                </div>
                                            ))}
                                            {filters.sizes.length > 5 && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-sm w-full mt-2 text-primary"
                                                    onClick={() => toggleShowMore('sizes')}
                                                >
                                                    {visibleItems.sizes > 5 ? 'Show Less' : `Show More (${filters.sizes.length - 5})`}
                                                </Button>
                                            )}
                                        </motion.div>
                                    )}
                                    {filter === 'colors' && filterOpen.colors && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            <div className="flex flex-wrap gap-2 mt-2">
                                                {filters.colors.slice(0, visibleItems.colors).map((color) => (
                                                    <button
                                                        key={`color-d-${color.id}`}
                                                        className={`w-8 h-8 rounded-full border ${selectedFilters.colors.includes(color.id) ? 'ring-2 ring-offset-1 ring-primary' : ''}`}
                                                        style={{ backgroundColor: color.color_code }}
                                                        onClick={() => onFilterChange('colors', toggleSelection(selectedFilters.colors, color.id))}
                                                        aria-label={`Color ${color.color_code}`}
                                                    />
                                                ))}
                                            </div>
                                            {filters.colors.length > 5 && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-sm w-full mt-2 text-primary"
                                                    onClick={() => toggleShowMore('colors')}
                                                >
                                                    {visibleItems.colors > 5 ? 'Show Less' : `Show More (${filters.colors.length - 5})`}
                                                </Button>
                                            )}
                                        </motion.div>
                                    )}
                                    {filter === 'brands' && filterOpen.brands && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            transition={{ duration: 0.3 }}
                                            className="space-y-2"
                                        >
                                            {filters.brands.slice(0, visibleItems.brands).map((brand) => (
                                                <div key={`brand-d-${brand.id}`} className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id={`brand-d-${brand.id}`}
                                                        checked={selectedFilters.brands.includes(brand.id)}
                                                        onCheckedChange={() =>
                                                            onFilterChange('brands', toggleSelection(selectedFilters.brands, brand.id))
                                                        }
                                                    />
                                                    <label htmlFor={`brand-d-${brand.id}`} className="text-sm cursor-pointer">
                                                        {brand.name}
                                                    </label>
                                                </div>
                                            ))}
                                            {filters.brands.length > 5 && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-sm w-full mt-2 text-primary"
                                                    onClick={() => toggleShowMore('brands')}
                                                >
                                                    {visibleItems.brands > 5 ? 'Show Less' : `Show More (${filters.brands.length - 5})`}
                                                </Button>
                                            )}
                                        </motion.div>
                                    )}
                                    {filter === 'price' && filterOpen.price && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            <div className="mt-4 space-y-4">
                                                <Slider
                                                    min={filters.price.min}
                                                    max={filters.price.max}
                                                    step={1}
                                                    value={[
                                                        selectedFilters.price.min,
                                                        selectedFilters.price.max > -1 ? selectedFilters.price.max : filters.price.max
                                                    ]}
                                                    onValueChange={(val) => onFilterChange('price', { min: val[0], max: val[1] })}
                                                />
                                                <div className="flex justify-between text-sm">
                                                    <span>£{selectedFilters.price.min}</span>
                                                    <span>£{selectedFilters.price.max > -1 ? selectedFilters.price.max : filters.price.max}</span>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        )
                    ))}
                </div>
            </>
        );
    }
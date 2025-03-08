'use client';

import { useEffect, useState } from 'react';
import { MdFilterAlt } from "react-icons/md";
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import ProductCard from '@/components/product/card';
import { motion } from 'framer-motion';
import { SlArrowDown, SlArrowUp } from 'react-icons/sl';
import { Pagination, PaginationContent, PaginationItem } from '@/components/ui/pagination';
import { IoCloseSharp } from 'react-icons/io5';
import { DropdownMenu, DropdownMenuItem, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { config } from '@/config';
import Image from 'next/image';
import Error500 from '@/components/errors/500';
import FilterSidebar from '@/components/product/filter-sidebar';
import NoProductsFound from '@/components/product/not-found';

interface Product {
    id: number;
    slug: string;
    name: string;
    price: number;
    sale_price: number;
    default_image: string;
    brand: {
        name: string;
    }
}

interface Filter {
    product_types: { id: string; name: string }[];
    sizes: { id: string; name: string }[];
    colors: { id: string; color_code: string }[];
    price: { min: number; max: number };
}

interface Pagination {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
}

export default function ProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [filters, setFilters] = useState<Filter>({
        product_types: [],
        sizes: [],
        colors: [],
        price: { min: 0, max: 500 },
    });
    const [pagination, setPagination] = useState<Pagination | null>(null);
    const [selectedFilters, setSelectedFilters] = useState<{
        categories: string[];
        sizes: string[];
        colors: string[];
        price: { min: number; max: number };
    }>({
        categories: [],
        sizes: [],
        colors: [],
        price: { min: 0, max: 500 },
    });
    const [currentPage, setCurrentPage] = useState(1);
    const [perPage, setPerPage] = useState(12);
    const [error, setError] = useState<string | null>(null);

    const fetchProducts = async () => {
        try {
            const res = await fetch(`${config.apiBaseUrl}products?per_page=${perPage}&page=${currentPage}`);
            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }

            const data = await res.json();
            setProducts(data.data);
            setFilters(data.filters);

            const price = {
                min: parseFloat(data.filters.price.min),
                max: parseFloat(data.filters.price.max),
            };

            setFilters({
                ...data.filters,
                price,
            });

            setSelectedFilters({
                ...selectedFilters,
                price,
            });

            setError(null);
            setPagination(data.pagination);
        } catch (error) {
            setError(error instanceof Error ? error.message : 'An unexpected error occurred');
        }
    };

    useEffect(() => {
        fetchProducts();
    }, [currentPage]);

    const [filterOpen, setFilterOpen] = useState({
        categories: true,
        sizes: true,
        colors: true,
        price: true,
    });

    const toggleFilter = (filter: keyof typeof filterOpen) => {
        setFilterOpen((prev) => ({ ...prev, [filter]: !prev[filter] }));
    };

    const handleSortChange = (option: string) => {
        // Add your sorting logic here based on the selected option
    };

    const toggleSelection = <T,>(selected: T[], setSelected: (value: T[]) => void, value: T) => {
        setSelected(selected.includes(value) ? selected.filter((v) => v !== value) : [...selected, value]);
    };

    const resetFilters = () => {
        setSelectedFilters({
            categories: [],
            sizes: [],
            colors: [],
            price: { min: filters.price.min, max: filters.price.max },
        });
    };

    const handleRemoveFilter = (type: keyof typeof selectedFilters, value: string) => {
        setSelectedFilters((prev) => {
            const currentFilter = prev[type];

            // Check if the current filter is an array of strings
            if (Array.isArray(currentFilter)) {
                return {
                    ...prev,
                    [type]: currentFilter.filter((item) => item !== value),
                };
            }

            // If it's not an array, return the previous state without changes
            return prev;
        });
    };

    const getFilterNameById = (type: 'categories' | 'sizes' | 'colors', id: string) => {
        switch (type) {
            case 'categories':
                return filters.product_types.find((cat) => cat.id === id)?.name || id;
            case 'sizes':
                return filters.sizes.find((size) => size.id === id)?.name || id;
            case 'colors':
                return filters.colors.find((color) => color.id === id)?.color_code || id;
            default:
                return id;
        }
    };

    const isAnyFilterSelected =
        selectedFilters.categories.length > 0 ||
        selectedFilters.sizes.length > 0 ||
        selectedFilters.colors.length > 0 ||
        selectedFilters.price.min !== filters.price.min ||
        selectedFilters.price.max !== filters.price.max;

    return (
        <div className="flex flex-col md:flex-row gap-4 p-4">
            {error ?
                <Error500 error={error} tryAgain={fetchProducts} />
                : <>
                    <FilterSidebar
                        filters={filters}
                        selectedFilters={selectedFilters}
                        onFilterChange={(type, value) => {
                            setSelectedFilters((prev) => ({ ...prev, [type]: value }));
                        }}
                        onResetFilters={resetFilters}
                    />

                    <div className="w-full md:w-3/4">
                        {!products.length ?
                            <NoProductsFound /> : <>
                                <div className='flex justify-between mb-2'>
                                    <h4 className='text-lg'>{pagination?.total || 0} Products</h4>
                                    <div>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant={'secondary'} size={'sm'}>Sort By: Price: Low to High</Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent>
                                                <DropdownMenuItem onClick={() => handleSortChange('Price: Low to High')}>Price: Low to High</DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleSortChange('Price: High to Low')}>Price: High to Low</DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleSortChange('Rating: High to Low')}>Rating: High to Low</DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleSortChange('Availability: In Stock')}>Availability: In Stock</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </div>

                                <div className="mb-4">
                                    {isAnyFilterSelected && (<>
                                        <div className="flex flex-wrap gap-3 mt-2">
                                            {selectedFilters.categories.map((categoryId) => (
                                                <div key={categoryId} className="flex py-1.5 items-center bg-gray-200 dark:bg-gray-700 rounded-lg px-3 transition-all duration-300 ease-in-out hover:bg-gray-300 dark:hover:bg-gray-600">
                                                    <span className="text-sm text-gray-800 dark:text-gray-200">{getFilterNameById('categories', categoryId)}</span>
                                                    <motion.button className="ml-2 text-red-500 cursor-pointer hover:text-red-600 hover:bg-red-100 rounded-lg transition duration-300" onClick={() => handleRemoveFilter('categories', categoryId)} whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }} animate={{ opacity: 1 }} initial={{ opacity: 0 }} transition={{ duration: 0.3 }}>
                                                        <IoCloseSharp />
                                                    </motion.button>
                                                </div>
                                            ))}
                                            {selectedFilters.sizes.map((sizeId) => (
                                                <div key={sizeId} className="flex py-1.5 items-center bg-gray-200 dark:bg-gray-700 rounded-lg px-3 transition-all duration-300 ease-in-out hover:bg-gray-300 dark:hover:bg-gray-600">
                                                    <span className="text-sm text-gray-800 dark:text-gray-200">{getFilterNameById('sizes', sizeId)}</span>
                                                    <motion.button className="ml-2 text-red-500 cursor-pointer hover:text-red-600 hover:bg-red-100 rounded-lg transition duration-300" onClick={() => handleRemoveFilter('sizes', sizeId)} whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }} animate={{ opacity: 1 }} initial={{ opacity: 0 }} transition={{ duration: 0.3 }}>
                                                        <IoCloseSharp />
                                                    </motion.button>
                                                </div>
                                            ))}
                                            {selectedFilters.colors.map((colorId) => (
                                                <div key={colorId} className="flex py-1.5 items-center bg-gray-200 dark:bg-gray-700 rounded-lg px-3 transition-all duration-300 ease-in-out hover:bg-gray-300 dark:hover:bg-gray-600">
                                                    <span style={{ backgroundColor: getFilterNameById('colors', colorId) }} className="py-2.5 px-4 rounded-lg text-white font-bold"></span>
                                                    <motion.button className="ml-2 text-red-500 cursor-pointer hover:text-red-600 hover:bg-red-100 rounded-lg transition duration-300" onClick={() => handleRemoveFilter('colors', colorId)} whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }} animate={{ opacity: 1 }} initial={{ opacity: 0 }} transition={{ duration: 0.3 }}>
                                                        <IoCloseSharp />
                                                    </motion.button>
                                                </div>
                                            ))}
                                            {(selectedFilters.price.min > 0 || selectedFilters.price.max < 200) && (
                                                <div className="flex py-1.5 items-center bg-gray-200 dark:bg-gray-700 rounded-lg px-3 transition-all duration-300 ease-in-out hover:bg-gray-300 dark:hover:bg-gray-600">
                                                    <span className="text-sm text-gray-800 dark:text-gray-200">{`£${selectedFilters.price.min} - £${selectedFilters.price.max}`}</span>
                                                    <button className="ml-2 text-red-500 cursor-pointer hover:text-red-600 transition duration-300" onClick={resetFilters}>
                                                        <IoCloseSharp />
                                                    </button>
                                                </div>
                                            )}
                                            <Button onClick={resetFilters} size="md" variant={'ghost'}>
                                                Clear Filters
                                            </Button>
                                        </div>
                                    </>)}
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {products.map((product, index) => (
                                        <motion.div key={`product-${index}`} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                                            <ProductCard {...product} />
                                        </motion.div>
                                    ))}
                                </div>
                                {pagination && (
                                    <div className='flex'>
                                        <Pagination className="mt-4">
                                            <PaginationContent>
                                                <PaginationItem>
                                                    <button className="px-3 py-1 cursor-pointer rounded-md disabled:opacity-50" disabled={currentPage === 1} onClick={() => setCurrentPage((prev) => prev - 1)}>
                                                        Previous
                                                    </button>
                                                </PaginationItem>
                                                {[...Array(pagination.last_page)].map((_, index) => (
                                                    <PaginationItem key={index}>
                                                        <button className={`px-3 py-1 cursor-pointer rounded-md ${currentPage === index + 1 ? 'bg-gray-900 text-white' : 'bg-gray-200'}`} onClick={() => setCurrentPage(index + 1)}>
                                                            {index + 1}
                                                        </button>
                                                    </PaginationItem>
                                                ))}
                                                <PaginationItem>
                                                    <button className="px-3 py-1 cursor-pointer rounded-md disabled:opacity-50" disabled={currentPage === pagination.last_page} onClick={() => setCurrentPage((prev) => prev + 1)}>
                                                        Next
                                                    </button>
                                                </PaginationItem>
                                            </PaginationContent>
                                        </Pagination>
                                    </div>
                                )}
                            </>
                        }
                    </div>
                </>
            }
        </div>
    );
}
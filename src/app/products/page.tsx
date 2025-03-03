'use client';

import { useState } from 'react';
import Header from '@/components/global/header';
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

interface Product {
    id: number;
    name: string;
    price: number;
    category: string;
    description: string;
    image: string;
    size: Size;
    color: Color;
}

type Size = 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL';
type Color = '#000000' | '#FFFFFF' | '#FF5733' | '#3498DB' | '#27AE60' | '#F1C40F';

const products: Product[] = [
    { id: 1, name: 'Leather Jacket', price: 120, category: 'Outerwear', description: 'Brown', image: '/images/temp/product1.jpg', size: 'L', color: '#000000' },
    { id: 2, name: 'Denim Jeans', price: 60, category: 'Bottoms', description: 'Blue', image: '/images/temp/product2.jpg', size: 'M', color: '#3498DB' },
    { id: 3, name: 'Sneakers', price: 90, category: 'Footwear', description: 'White', image: '/images/temp/product3.jpg', size: 'XL', color: '#FFFFFF' },
    { id: 4, name: 'Graphic T-Shirt', price: 35, category: 'Tops', description: 'Red', image: '/images/temp/product4.jpg', size: 'S', color: '#FF5733' },
    { id: 5, name: 'Hoodie', price: 80, category: 'Outerwear', description: 'Green', image: '/images/temp/product5.jpg', size: 'XXL', color: '#27AE60' },
];

const categories: string[] = ['Outerwear', 'Bottoms', 'Footwear', 'Tops'];
const sizes: Size[] = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const colors: Color[] = ['#000000', '#FFFFFF', '#FF5733', '#3498DB', '#27AE60', '#F1C40F'];

export default function ProductsPage() {
    const [filterOpen, setFilterOpen] = useState({
        categories: true,
        sizes: true,
        colors: true,
        price: true,
    });

    const toggleFilter = (filter: keyof typeof filterOpen) => {
        setFilterOpen((prev) => ({ ...prev, [filter]: !prev[filter] }));
    };

    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [selectedSizes, setSelectedSizes] = useState<Size[]>([]);
    const [selectedColors, setSelectedColors] = useState<Color[]>([]);
    const [minPrice, setMinPrice] = useState<number>(0);
    const [maxPrice, setMaxPrice] = useState<number>(200);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 2;
    const [sortOption, setSortOption] = useState<string>('Price: Low to High');

    const handleSortChange = (option: string) => {
        setSortOption(option);
        // Add your sorting logic here based on the selected option
    };

    const toggleSelection = <T,>(selected: T[], setSelected: (value: T[]) => void, value: T) => {
        setSelected(selected.includes(value) ? selected.filter((v) => v !== value) : [...selected, value]);
    };

    const resetFilters = () => {
        setSelectedCategories([]);
        setSelectedSizes([]);
        setSelectedColors([]);
        setMinPrice(0);
        setMaxPrice(200);
        setSearchQuery('');
    };

    const filteredProducts = products.filter((product) => {
        return (
            (selectedCategories.length === 0 || selectedCategories.includes(product.category)) &&
            (selectedSizes.length === 0 || selectedSizes.includes(product.size)) &&
            (selectedColors.length === 0 || selectedColors.includes(product.color)) &&
            product.price >= minPrice && product.price <= maxPrice &&
            product.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
    });

    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
    const displayedProducts = filteredProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const handleRemoveCategory = (category: string) => {
        setSelectedCategories(selectedCategories.filter(item => item !== category));
    };

    const handleRemoveSize = (size: Size) => {
        setSelectedSizes(selectedSizes.filter(item => item !== size));
    };

    const handleRemoveColor = (color: Color) => {
        setSelectedColors(selectedColors.filter(item => item !== color));
    };

    return (
        <>
            <Header />
            <div className="flex flex-col md:flex-row gap-4 p-4">
                <div className="w-full md:w-1/4">
                    {/* Apply Filters button on mobile */}
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
                                </SheetHeader>

                                <div className="px-3">
                                    {['categories', 'sizes', 'colors', 'price'].map((filter) => (
                                        <div key={filter} className="mb-4">
                                            <div className="flex justify-between items-center cursor-pointer" onClick={() => toggleFilter(filter as keyof typeof filterOpen)}>
                                                <h3 className="text-md font-medium capitalize">{filter}</h3>
                                                <span>{filterOpen[filter as keyof typeof filterOpen] ? <SlArrowUp /> : <SlArrowDown />}</span>
                                            </div>
                                            {filter === 'categories' && filterOpen.categories && categories.map((category) => (
                                                <div key={category} className="flex items-center space-x-2 mt-2">
                                                    <Checkbox id={category} checked={selectedCategories.includes(category)} onCheckedChange={() => toggleSelection(selectedCategories, setSelectedCategories, category)} />
                                                    <label htmlFor={category} className="text-sm cursor-pointer">{category}</label>
                                                </div>
                                            ))}
                                            {filter === 'sizes' && filterOpen.sizes && sizes.map((size) => (
                                                <div key={size} className="flex items-center space-x-2 mt-2">
                                                    <Checkbox id={size} checked={selectedSizes.includes(size)} onCheckedChange={() => toggleSelection(selectedSizes, setSelectedSizes, size)} />
                                                    <label htmlFor={size} className="text-sm cursor-pointer">{size}</label>
                                                </div>
                                            ))}
                                            {filter === 'colors' && filterOpen.colors && (
                                                <div className="flex flex-wrap gap-2 mt-2">
                                                    {colors.map((color) => (
                                                        <button key={color} className={`w-6 h-6 rounded-full border ${selectedColors.includes(color) ? 'ring-2 ring-black' : ''}`} style={{ backgroundColor: color }} onClick={() => toggleSelection(selectedColors, setSelectedColors, color)} />
                                                    ))}
                                                </div>
                                            )}
                                            {filter === 'price' && filterOpen.price && (
                                                <div className="mt-2">
                                                    <Slider min={0} max={200} step={10} value={[minPrice, maxPrice]} onValueChange={(val) => { setMinPrice(val[0]); setMaxPrice(val[1]); }} />
                                                    <div className="flex justify-between">
                                                        <span>£{minPrice}</span>
                                                        <span>£{maxPrice}</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>

                    {/* Filter panel */}
                    <div className="hidden md:block  rounded-lg shadow-lg bg-white  p-4">
                        {['categories', 'sizes', 'colors', 'price'].map((filter) => (
                            <div key={filter} className="mb-4">
                                <div className="flex justify-between items-center cursor-pointer" onClick={() => toggleFilter(filter as keyof typeof filterOpen)}>
                                    <h3 className="text-md font-medium capitalize">{filter}</h3>
                                    <span>{filterOpen[filter as keyof typeof filterOpen] ? <SlArrowUp /> : <SlArrowDown />}</span>
                                </div>
                                {filter === 'categories' && filterOpen.categories && categories.map((category) => (
                                    <div key={category} className="flex items-center space-x-2 mt-2">
                                        <Checkbox id={category} checked={selectedCategories.includes(category)} onCheckedChange={() => toggleSelection(selectedCategories, setSelectedCategories, category)} />
                                        <label htmlFor={category} className="text-sm cursor-pointer">{category}</label>
                                    </div>
                                ))}
                                {filter === 'sizes' && filterOpen.sizes && sizes.map((size) => (
                                    <div key={size} className="flex items-center space-x-2 mt-2">
                                        <Checkbox id={size} checked={selectedSizes.includes(size)} onCheckedChange={() => toggleSelection(selectedSizes, setSelectedSizes, size)} />
                                        <label htmlFor={size} className="text-sm cursor-pointer">{size}</label>
                                    </div>
                                ))}
                                {filter === 'colors' && filterOpen.colors && (
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {colors.map((color) => (
                                            <button key={color} className={`w-6 h-6 rounded-full border ${selectedColors.includes(color) ? 'ring-2 ring-black' : ''}`} style={{ backgroundColor: color }} onClick={() => toggleSelection(selectedColors, setSelectedColors, color)} />
                                        ))}
                                    </div>
                                )}
                                {filter === 'price' && filterOpen.price && (
                                    <div className="mt-2">
                                        <Slider min={0} max={200} step={10} value={[minPrice, maxPrice]} onValueChange={(val) => { setMinPrice(val[0]); setMaxPrice(val[1]); }} />
                                        <div className="flex justify-between">
                                            <span>£{minPrice}</span>
                                            <span>£{maxPrice}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>


                <div className="w-full w-3/4 md:w-3/4">
                    <div className='flex justify-between mb-2'>
                        <h4 className='text-lg'>3 Products</h4>
                        <div>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant={'secondary'} size={'sm'}>Sort By: {sortOption}</Button>
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

                    {/* Show Selected Filters */}
                    {filteredProducts.length !== products.length && (
                        <div className="mb-4">
                            <div className="flex flex-wrap gap-3 mt-2">
                                {/* Categories */}
                                {selectedCategories.map((category) => (
                                    <div
                                        key={category}
                                        className="flex items-center bg-gray-200 dark:bg-gray-700 rounded-lg px-3 transition-all duration-300 ease-in-out hover:bg-gray-300 dark:hover:bg-gray-600"
                                    >
                                        <span className="text-sm text-gray-800 dark:text-gray-200">{category}</span>
                                        <motion.button
                                            className="ml-2 text-red-500 cursor-pointer hover:text-red-600 hover:bg-red-100 rounded-lg transition duration-300"
                                            onClick={() => handleRemoveCategory(category)}
                                            whileHover={{ scale: 1.2 }} // Scale up on hover
                                            whileTap={{ scale: 0.9 }} // Scale down on click
                                            animate={{ opacity: 1 }} // Ensure button is visible
                                            initial={{ opacity: 0 }} // Start with opacity 0, fade in on hover
                                            transition={{ duration: 0.3 }}
                                        >
                                            <IoCloseSharp />
                                        </motion.button>
                                    </div>
                                ))}

                                {/* Sizes */}
                                {selectedSizes.map((size) => (
                                    <div
                                        key={size}
                                        className="flex items-center bg-gray-200 dark:bg-gray-700 rounded-lg px-3 transition-all duration-300 ease-in-out hover:bg-gray-300 dark:hover:bg-gray-600"
                                    >
                                        <span className="text-sm text-gray-800 dark:text-gray-200">{size}</span>
                                        <motion.button
                                            className="ml-2 text-red-500 cursor-pointer hover:text-red-600 hover:bg-red-100 rounded-lg transition duration-300"
                                            onClick={() => handleRemoveSize(size)}
                                            whileHover={{ scale: 1.2 }} // Scale up on hover
                                            whileTap={{ scale: 0.9 }} // Scale down on click
                                            animate={{ opacity: 1 }} // Ensure button is visible
                                            initial={{ opacity: 0 }} // Start with opacity 0, fade in on hover
                                            transition={{ duration: 0.3 }}
                                        >
                                            <IoCloseSharp />
                                        </motion.button>
                                    </div>
                                ))}

                                {/* Colors */}
                                {selectedColors.map((color) => (
                                    <div
                                        key={color}
                                        className="flex items-center bg-gray-200 dark:bg-gray-700 rounded-lg px-3 transition-all duration-300 ease-in-out hover:bg-gray-300 dark:hover:bg-gray-600"
                                    >
                                        <span
                                            style={{ backgroundColor: color }}
                                            className="py-2.5 px-4 rounded-lg text-white font-bold"
                                        ></span>

                                        <motion.button
                                            className="ml-2 text-red-500 cursor-pointer hover:text-red-600 hover:bg-red-100 rounded-lg transition duration-300"
                                            onClick={() => handleRemoveColor(color)}
                                            whileHover={{ scale: 1.2 }} // Scale up on hover
                                            whileTap={{ scale: 0.9 }} // Scale down on click
                                            animate={{ opacity: 1 }} // Ensure button is visible
                                            initial={{ opacity: 0 }} // Start with opacity 0, fade in on hover
                                            transition={{ duration: 0.3 }}
                                        >
                                            <IoCloseSharp />
                                        </motion.button>
                                    </div>
                                ))}

                                {/* Price Filter */}
                                {minPrice > 0 && maxPrice < 200 && (
                                    <div
                                        className="flex items-center bg-gray-200 dark:bg-gray-700 rounded-lg px-3 transition-all duration-300 ease-in-out hover:bg-gray-300 dark:hover:bg-gray-600"
                                    >
                                        <span className="text-sm text-gray-800 dark:text-gray-200">
                                            {`$${minPrice} - $${maxPrice}`}
                                        </span>

                                        <button
                                            className="ml-2 text-red-500 cursor-pointer hover:text-red-600 transition duration-300"
                                            onClick={resetFilters}
                                        >
                                            <IoCloseSharp />
                                        </button>
                                    </div>
                                )}

                                {/* Clear Filters Button */}
                                <Button
                                    onClick={resetFilters}
                                    size="md"
                                    variant={'ghost'}
                                >
                                    Clear Filters
                                </Button>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {displayedProducts.length > 0 ? displayedProducts.map((product) => (
                            <motion.div key={product.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                                <ProductCard {...product} />
                            </motion.div>
                        )) : <p className="col-span-full text-center">No products found</p>}
                    </div>

                    <div className='flex'>
                        <Pagination className="mt-4">
                            <PaginationContent>
                                <PaginationItem>
                                    <button
                                        className="px-3 py-1 rounded-md disabled:opacity-50"
                                        disabled={currentPage === 1}
                                        onClick={() => setCurrentPage((prev) => prev - 1)}
                                    >
                                        Previous
                                    </button>
                                </PaginationItem>
                                {[...Array(totalPages)].map((_, index) => (
                                    <PaginationItem key={index}>
                                        <button
                                            className={`px-3 py-1 rounded-md ${currentPage === index + 1 ? 'bg-gray-900 text-white' : 'bg-gray-200'}`}
                                            onClick={() => setCurrentPage(index + 1)}
                                        >
                                            {index + 1}
                                        </button>
                                    </PaginationItem>
                                ))}
                                <PaginationItem>
                                    <button
                                        className="px-3 py-1 rounded-md disabled:opacity-50"
                                        disabled={currentPage === totalPages}
                                        onClick={() => setCurrentPage((prev) => prev + 1)}
                                    >
                                        Next
                                    </button>
                                </PaginationItem>
                            </PaginationContent>
                        </Pagination>
                    </div>
                </div>
            </div>
        </>
    );
}

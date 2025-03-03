'use client';

import { useState } from 'react';
import Header from '@/components/global/header';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import ProductCard from '@/components/product/card';
import { motion } from 'framer-motion';
import { SlArrowDown, SlArrowUp } from 'react-icons/sl';
import { Pagination, PaginationContent, PaginationItem } from '@/components/ui/pagination';

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

    return (
        <>
            <Header />
            <div className="flex flex-col md:flex-row gap-4 p-4">
                <div className="w-full md:w-1/4 p-4 border rounded-lg shadow-sm bg-white">
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
                                <Slider min={0} max={200} step={10} value={[minPrice, maxPrice]} onValueChange={(val) => { setMinPrice(val[0]); setMaxPrice(val[1]); }} />
                            )}
                        </div>
                    ))}
                </div>

                <div className="w-full md:w-3/4">
                    <Button onClick={resetFilters} className=" mt-4">Clear Filters</Button>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {displayedProducts.length > 0 ? displayedProducts.map((product) => (
                            <motion.div key={product.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                                <ProductCard {...product} />
                            </motion.div>
                        )) : <p className="col-span-full text-center">No products found</p>}
                    </div>

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
        </>
    );
}

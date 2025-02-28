"use client"
import React, { useState } from 'react';
import FilterSidebar from '@/components/products/filter-sidebar';
import ProductList from '@/components/products/product-list';
import Header from "@/components/header";
import Footer from "@/components/footer";

const App: React.FC = () => {
    const allProducts = [
        { id: 1, name: 'Leather Jacket', category: 'Outerwear', price: 999, image: 'https://portotheme.com/html/molla/assets/images/products/product-4.jpg' },
        { id: 2, name: 'Graphic Tee', category: 'Tops', price: 25, image: 'https://portotheme.com/html/molla/assets/images/products/product-6.jpg' },
        { id: 3, name: 'Sneakers', category: 'Footwear', price: 49, image: 'https://portotheme.com/html/molla/assets/images/products/product-8.jpg' },
        { id: 4, name: 'Hoodie', category: 'Tops', price: 799, image: 'https://portotheme.com/html/molla/assets/images/demos/demo-7/products/product-8-2.jpg' },
        { id: 5, name: 'Denim Jacket', category: 'Outerwear', price: 60, image: 'https://portotheme.com/html/molla/assets/images/demos/demo-7/products/product-13-2.jpg' },
    ];

    const [filter, setFilter] = useState<string>('All');
    const [activeFilters, setActiveFilters] = useState<string[]>([]);
    const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);

    const filteredProducts = allProducts.filter((product) => {
        if (filter === 'All') return true;
        if (filter === 'Outerwear' && product.category === 'Outerwear') return true;
        if (filter === 'Tops' && product.category === 'Tops') return true;
        if (filter === 'Footwear' && product.category === 'Footwear') return true;
        if (filter === 'Under $50' && product.price < 50) return true;
        if (filter === '$50 - $100' && product.price >= 50 && product.price <= 100) return true;
        if (filter === 'Above $100' && product.price > 100) return true;
        return false;
    });

    const handleFilterChange = (newFilter: string) => {
        setFilter(newFilter);
        if (!activeFilters.includes(newFilter)) {
            setActiveFilters((prevFilters) => [...prevFilters, newFilter]);
        } else {
            setActiveFilters(activeFilters.filter(filter => filter !== newFilter));
        }
    };

    const clearAllFilters = () => {
        setFilter('All');
        setActiveFilters([]);
    };

    return (
        <>
            <Header />
            <div className="flex flex-col lg:flex-row">
                {/* Mobile Sidebar Drawer */}
                <div
                    className={`fixed inset-0 products-filter-sidebar-bg z-40 lg:hidden transition-all duration-300 ${sidebarOpen ? 'block' : 'hidden'
                        }`}
                    onClick={() => setSidebarOpen(false)}
                ></div>

                {/* Mobile Filter Toggle Button */}
                <button
                    className="lg:hidden p-2 bg-primary text-white"
                    onClick={() => setSidebarOpen(true)}
                >
                    Filters
                </button>

                {/* Filter Sidebar */}
                <FilterSidebar
                    setFilter={handleFilterChange}
                    isMobile={sidebarOpen}
                    sidebarOpen={sidebarOpen}
                    setSidebarOpen={setSidebarOpen}
                />

                {/* Main Content Area */}
                <div className="flex-1 p-4 bg-white">
                    <div className="flex flex-wrap items-center">
                        <h3 className="text-md font-semibold mr-4">Selected Filters:</h3>
                        <div className="flex flex-wrap gap-2">
                            {activeFilters.length > 0 ? (
                                activeFilters.map((activeFilter, index) => (
                                    <div key={index} className="flex items-center btn-secondary px-3 py-1 rounded-full text-sm">
                                        {activeFilter}
                                        <button
                                            className="ml-2 text-xs font-bold bg-transparent rounded-full p-1"
                                            onClick={() => {
                                                setActiveFilters(activeFilters.filter(f => f !== activeFilter));
                                                setFilter('All');
                                            }}
                                        >
                                            X
                                        </button>
                                    </div>
                                ))
                            ) : (
                                <span className="text-gray-500 text-sm">No filters applied</span>
                            )}
                        </div>
                        {activeFilters.length > 0 && (
                            <button
                                onClick={clearAllFilters}
                                className="ml-4 bg-red-500 text-white px-4 py-2 rounded-md text-sm hover:bg-red-600"
                            >
                                Clear All Filters
                            </button>
                        )}
                    </div>

                    <ProductList products={filteredProducts} />
                </div>
            </div>
            <Footer />
        </>
    );
};

export default App;

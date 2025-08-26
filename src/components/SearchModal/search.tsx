"use client";
import ProductPrice from "@/components/product/ProductPrice";
import { useEffect, useState, useCallback } from "react";
import { CiSearch } from "react-icons/ci";
import { X, Filter, ChevronDown, ChevronUp } from "lucide-react";
import axios from "axios";
import { apiBaseUrl } from "@/config";

const ProductCard = ({
  name,
  brand,
  price,
  image,
  slug,
  compact = false,
}: {
  name: string;
  brand: string;
  price: number;
  image: string;
  slug: string;
  compact?: boolean;
}) => {
  const [imgError, setImgError] = useState(false);

  return (
    <a
      href={`/product/${slug}`}
      className={`group flex flex-col items-center w-full ${
        compact ? "max-w-[160px]" : ""
      } mx-auto cursor-pointer transition-all duration-300 hover:scale-[1.03]`}
    >
      <div
        className={`relative w-full ${
          compact ? "aspect-[4/5]" : "aspect-square"
        } rounded-xl overflow-hidden border border-gray-200 shadow-sm bg-gray-50 flex items-center justify-center`}
      >
        <img
          src={imgError ? "/images/default-product.png" : image}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          onError={() => setImgError(true)}
        />
        <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-5 transition-opacity duration-300"></div>
      </div>
      <div className="mt-3 text-center w-full px-1">
        <h3
          className={`font-medium text-gray-900 transition-all duration-300 group-hover:text-[var(--primary)] ${
            compact ? "text-sm" : "text-base"
          } truncate`}
          title={name}
        >
          {name}
        </h3>
        <p
          className={`text-gray-500 transition-all duration-300 ${
            compact ? "text-xs" : "text-sm"
          } mt-1`}
        >
          {brand || "No Brand"}
        </p>
        <p
          className={`font-semibold text-[var(--primary)] transition-all duration-300 mt-1 ${
            compact ? "text-sm" : "text-base"
          }`}
        >
          <ProductPrice basePrice={price} />
        </p>
      </div>
    </a>
  );
};

const FilterSection = ({
  title,
  options,
  selectedValue,
  onChange,
  isOpen,
  toggleOpen,
}: {
  title: string;
  options: { id: string; name: string; [key: string]: any }[];
  selectedValue: string;
  onChange: (value: string) => void;
  isOpen: boolean;
  toggleOpen: () => void;
}) => {
  return (
    <div className="border-b border-gray-200 py-4">
      <button
        className="flex justify-between items-center w-full text-left font-medium text-gray-900"
        onClick={toggleOpen}
      >
        <span>{title}</span>
        {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </button>
      {isOpen && (
        <div className="mt-3 space-y-2 max-h-60 overflow-y-auto">
          <label className="flex items-center py-1">
            <input
              type="radio"
              name={title.toLowerCase()}
              value=""
              checked={selectedValue === ""}
              onChange={() => onChange("")}
              className="h-4 w-4 text-[var(--primary)] border-gray-300 focus:ring-[var(--primary)]"
            />
            <span className="ml-2 text-gray-700">All {title}</span>
          </label>
          {options.map((option) => (
            <label key={option.id} className="flex items-center py-1">
              <input
                type="radio"
                name={title.toLowerCase()}
                value={option.id}
                checked={selectedValue === option.id}
                onChange={() => onChange(option.id)}
                className="h-4 w-4 text-[var(--primary)] border-gray-300 focus:ring-[var(--primary)]"
              />
              <span className="ml-2 text-gray-700">
                {option.name || option.size}
              </span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
};

const SearchModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [visibleCount, setVisibleCount] = useState(12);
  const [products, setProducts] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [colors, setColors] = useState<any[]>([]);
  const [sizes, setSizes] = useState<any[]>([]);
  const [selectedBrandId, setSelectedBrandId] = useState<string>("");
  const [selectedColorId, setSelectedColorId] = useState<string>("");
  const [selectedSizeId, setSelectedSizeId] = useState<string>("");
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [openFilterSection, setOpenFilterSection] = useState<string | null>(null);

  // Debounced search
  useEffect(() => {
    if (!isOpen) return;
    
    const handler = setTimeout(() => {
      fetchProducts();
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [isOpen, searchTerm, selectedBrandId, selectedColorId, selectedSizeId]);

  const fetchProducts = useCallback(async () => {
    try {
      const response = await axios.get(`${apiBaseUrl}search-product`, {
        params: {
          searchValue: searchTerm,
          brand_id: selectedBrandId || null,
          color_id: selectedColorId || null,
          size_id: selectedSizeId || null,
        },
      });

      setProducts(response.data.products || []);
      setBrands(response.data.brands || []);
      setColors(response.data.colors || []);
      setSizes(response.data.sizes || []);
      setVisibleCount(12); // Reset visible count when filters change
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  }, [searchTerm, selectedBrandId, selectedColorId, selectedSizeId]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  const toggleFilterSection = (section: string) => {
    setOpenFilterSection(openFilterSection === section ? null : section);
  };

  const clearAllFilters = () => {
    setSelectedBrandId("");
    setSelectedColorId("");
    setSelectedSizeId("");
    setSearchTerm("");
  };

  const hasActiveFilters = selectedBrandId || selectedColorId || selectedSizeId;

  if (!isOpen) return null;

  const visibleProducts = products.slice(0, visibleCount);
  const remainingCount = products.length - visibleCount;

  return (
    <div className="fixed inset-0 bg-white z-50 overflow-auto">
      {/* Full-width Search Header */}
      <div className="sticky top-0 bg-white border-b border-gray-200 z-10 shadow-sm">
        <div className="flex items-center p-4 gap-3">
          <div className="flex-1 relative">
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search products, brands, categories..."
                className="w-full border border-gray-300 rounded-xl py-3 px-5 pl-12 text-base focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
                autoFocus
              />
              <CiSearch
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500"
                size={20}
              />
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-gray-600 hover:text-black hover:bg-gray-100 transition-all flex-shrink-0"
          >
            <X size={24} />
          </button>
        </div>
        
        {/* Filter Toggle for Mobile */}
        <div className="px-4 pb-3 flex justify-between items-center">
          <div className="text-sm text-gray-500">
            {products.length} product{products.length !== 1 ? 's' : ''} found
          </div>
          <button 
            onClick={() => setIsFiltersOpen(!isFiltersOpen)}
            className="md:hidden flex items-center text-sm font-medium text-gray-700"
          >
            <Filter size={16} className="mr-1" />
            Filters
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row">
        {/* Sidebar Filters - Desktop */}
        <div className="hidden md:block w-full md:w-64 border-r border-gray-200 bg-gray-50 p-5 overflow-y-auto max-h-[calc(100vh-80px)]">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-lg">Filters</h3>
            {hasActiveFilters && (
              <button 
                onClick={clearAllFilters}
                className="text-sm text-[var(--primary)] hover:underline"
              >
                Clear all
              </button>
            )}
          </div>
          
          <FilterSection
            title="Brands"
            options={brands}
            selectedValue={selectedBrandId}
            onChange={setSelectedBrandId}
            isOpen={openFilterSection === "brands"}
            toggleOpen={() => toggleFilterSection("brands")}
          />
          
          <FilterSection
            title="Colors"
            options={colors}
            selectedValue={selectedColorId}
            onChange={setSelectedColorId}
            isOpen={openFilterSection === "colors"}
            toggleOpen={() => toggleFilterSection("colors")}
          />
          
          <FilterSection
            title="Sizes"
            options={sizes}
            selectedValue={selectedSizeId}
            onChange={setSelectedSizeId}
            isOpen={openFilterSection === "sizes"}
            toggleOpen={() => toggleFilterSection("sizes")}
          />
        </div>

        {/* Mobile Filters Overlay */}
        {isFiltersOpen && (
          <div className="md:hidden fixed inset-0 bg-white z-20 p-5 overflow-auto">
            <div className="flex justify-between items-center mb-5">
              <h3 className="font-semibold text-lg">Filters</h3>
              <button onClick={() => setIsFiltersOpen(false)}>
                <X size={24} />
              </button>
            </div>
            
            {hasActiveFilters && (
              <button 
                onClick={clearAllFilters}
                className="mb-4 text-sm text-[var(--primary)] hover:underline"
              >
                Clear all filters
              </button>
            )}
            
            <FilterSection
              title="Brands"
              options={brands}
              selectedValue={selectedBrandId}
              onChange={setSelectedBrandId}
              isOpen={openFilterSection === "brands"}
              toggleOpen={() => toggleFilterSection("brands")}
            />
            
            <FilterSection
              title="Colors"
              options={colors}
              selectedValue={selectedColorId}
              onChange={setSelectedColorId}
              isOpen={openFilterSection === "colors"}
              toggleOpen={() => toggleFilterSection("colors")}
            />
            
            <FilterSection
              title="Sizes"
              options={sizes}
              selectedValue={selectedSizeId}
              onChange={setSelectedSizeId}
              isOpen={openFilterSection === "sizes"}
              toggleOpen={() => toggleFilterSection("sizes")}
            />
            
            <button 
              onClick={() => setIsFiltersOpen(false)}
              className="mt-6 w-full bg-[var(--primary)] text-white py-3 rounded-xl font-medium"
            >
              Show results
            </button>
          </div>
        )}

        {/* Products Grid */}
        <div className="flex-1 p-4">
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2 mb-4">
              {selectedBrandId && (
                <div className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm flex items-center">
                  Brand: {brands.find(b => b.id === selectedBrandId)?.name}
                  <button 
                    onClick={() => setSelectedBrandId("")}
                    className="ml-2 text-gray-500 hover:text-gray-700"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}
              {selectedColorId && (
                <div className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm flex items-center">
                  Color: {colors.find(c => c.id === selectedColorId)?.name}
                  <button 
                    onClick={() => setSelectedColorId("")}
                    className="ml-2 text-gray-500 hover:text-gray-700"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}
              {selectedSizeId && (
                <div className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm flex items-center">
                  Size: {sizes.find(s => s.id === selectedSizeId)?.size}
                  <button 
                    onClick={() => setSelectedSizeId("")}
                    className="ml-2 text-gray-500 hover:text-gray-700"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}
            </div>
          )}

          {visibleProducts.length > 0 ? (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {visibleProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    name={product.name}
                    brand={product.brand?.name}
                    price={product.price}
                    slug={product.slug}
                    image={product.image || "/images/default-product.png"}
                  />
                ))}
              </div>
              {remainingCount > 0 && (
                <div className="flex justify-center mt-10">
                  <button
                    onClick={() => setVisibleCount((prev) => prev + 12)}
                    className="px-6 py-3 border border-[var(--primary)] bg-white text-[var(--primary)] rounded-xl cursor-pointer hover:bg-[var(--primary)] hover:text-white transition-all duration-300 font-medium"
                  >
                    Load More ({remainingCount} remaining)
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-16">
              <div className="text-gray-400 text-5xl mb-4">🔍</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
              <p className="text-gray-500 max-w-md mx-auto">
                Try adjusting your search or filter criteria to find what you're looking for.
              </p>
              {hasActiveFilters && (
                <button
                  onClick={clearAllFilters}
                  className="mt-4 text-[var(--primary)] hover:underline"
                >
                  Clear all filters
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchModal;
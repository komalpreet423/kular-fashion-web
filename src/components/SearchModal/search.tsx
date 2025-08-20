"use client";
import ProductPrice from "@/components/product/ProductPrice";
import { useEffect, useState } from "react";
import { CiSearch } from "react-icons/ci";
import { X } from "lucide-react";
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
      } mx-auto cursor-pointer transition-transform duration-300 hover:scale-[1.03]`}
    >
      <div
        className={`w-full ${
          compact ? "aspect-[4/5]" : "aspect-square"
        } rounded-lg overflow-hidden border shadow-sm bg-gray-100 flex items-center justify-center`}
      >
        <img
          src={imgError ? "/images/default-product.png" : image}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          onError={() => setImgError(true)}
        />
      </div>
      <div className="mt-2 text-center">
        <h3
          className={`font-medium transition-all duration-300 group-hover:underline ${
            compact ? "text-sm" : "text-base"
          }`}
        >
          {name}
        </h3>
        <p
          className={`text-gray-500 transition-all duration-300 ${
            compact ? "text-xs" : "text-sm"
          }`}
        >
          {brand || "No Brand"}
        </p>
        <p
          className={`font-semibold text-[var(--primary)] transition-all duration-300 ${
            compact ? "text-sm" : "text-base"
          }`}
        >
          <ProductPrice basePrice={price} />
        </p>
      </div>
    </a>
  );
};

const SearchModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [visibleCount, setVisibleCount] = useState(8);

  const [products, setProducts] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [colors, setColors] = useState<any[]>([]);
  const [sizes, setSizes] = useState<any[]>([]);

  const [selectedBrandId, setSelectedBrandId] = useState<string>("");
  const [selectedColorId, setSelectedColorId] = useState<string>("");
  const [selectedSizeId, setSelectedSizeId] = useState<string>("");

  // API Fetch
  useEffect(() => {
    if (isOpen) {
      fetchProducts();
    }
  }, [isOpen, searchTerm, selectedBrandId, selectedColorId, selectedSizeId]);

  const fetchProducts = async () => {
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
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const visibleProducts = products.slice(0, visibleCount);
  const remainingCount = products.length - visibleCount;

  return (
    <div className="fixed inset-0 bg-white z-50 overflow-auto">
      <div className="relative p-4 sm:p-6">
        {/* Top Bar */}
        <div className="relative flex items-center justify-between mb-6 px-2 sm:px-6">
          <div className="flex-1 max-w-full sm:max-w-xl mx-auto">
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search products..."
                className="w-full border border-gray-300 rounded-xl py-2.5 sm:py-3 px-5 pl-11 text-base sm:text-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              />
              <CiSearch
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500"
                size={20}
              />
            </div>
          </div>
          <button
            onClick={onClose}
            className="ml-2 p-2 sm:p-2.5 rounded-full text-gray-600 hover:text-black hover:bg-gray-100 transition-all"
          >
            <X size={24} className="sm:w-7 sm:h-7 w-6 h-6" />
          </button>
        </div>

        {/* Main Layout */}
        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar Filters */}
          <div className="w-full md:w-[30%] space-y-6">
            {/* Brand Dropdown */}
            <div>
              <label className="block text-xl font-semibold mb-2">Brands</label>
              <select
                className="w-full p-2 border border-gray-300 rounded-md"
                value={selectedBrandId}
                onChange={(e) => setSelectedBrandId(e.target.value)}
              >
                <option value="">All Brands</option>
                {brands.map((brand) => (
                  <option key={brand.id} value={brand.id}>
                    {brand.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Color Dropdown */}
            <div>
              <label className="block text-xl font-semibold mb-2">Colors</label>
              <select
                className="w-full p-2 border border-gray-300 rounded-md"
                value={selectedColorId}
                onChange={(e) => setSelectedColorId(e.target.value)}
              >
                <option value="">All Colors</option>
                {colors.map((color) => (
                  <option key={color.id} value={color.id}>
                    {color.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Size Dropdown */}
            <div>
              <label className="block text-xl font-semibold mb-2">Sizes</label>
              <select
                className="w-full p-2 border border-gray-300 rounded-md"
                value={selectedSizeId}
                onChange={(e) => setSelectedSizeId(e.target.value)}
              >
                <option value="">All Sizes</option>
                {sizes.map((size) => (
                  <option key={size.id} value={size.id}>
                    {size.size}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Products Grid */}
          <div className="w-full md:w-[70%]">
            <h2 className="text-xl font-semibold mb-4">Products</h2>
            {visibleProducts.length > 0 ? (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
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
                  <div className="flex justify-center mt-8">
                    <button
                      onClick={() => setVisibleCount((prev) => prev + 8)}
                      className="px-6 py-3 border border-[var(--primary)] bg-[var(--primary)] text-white rounded-[10px] cursor-pointer hover:bg-white hover:text-[var(--primary)] transition-all duration-300"
                    >
                      Load More Product{remainingCount > 1 ? "s" : ""}
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-gray-500 text-center mt-10 text-lg">
                No Product Available
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchModal;

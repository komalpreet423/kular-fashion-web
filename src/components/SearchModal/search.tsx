"use client";

import { useEffect, useState } from "react";
import { CiSearch } from "react-icons/ci";
import { X } from "lucide-react";

const staticBrands = [
  { name: "Nike", image: "/images/brands/nike.png" },
  { name: "Adidas", image: "/images/brands/adidas.png" },
  { name: "Puma", image: "/images/brands/puma.png" },
  { name: "Reebok", image: "/images/brands/reebok.png" },
];

const staticProductTypes = [
  { name: "Shoes", image: "/images/types/shoes.png" },
  { name: "Shirts", image: "/images/types/shirts.png" },
  { name: "Accessories", image: "/images/types/accessories.png" },
  { name: "Bags", image: "/images/types/bags.png" },
];

const staticProducts = Array.from({ length: 50 }, (_, i) => {
  const brandId = i % staticBrands.length;
  const productTypeId = i % staticProductTypes.length;
  const allColors = ["Red", "Black", "White", "Blue", "Green", "Yellow", "Orange"];
  const shuffled = [...allColors].sort(() => 0.5 - Math.random());
  const colors = shuffled.slice(0, Math.floor(Math.random() * 3) + 2);

  return {
    name: `Product ${i + 1}`,
    colors,
    image: `/images/product${(i % 4) + 1}.jpg`,
    brandId,
    productTypeId,
  };
});

const ProductCard = ({
  name,
  colors,
  image,
  compact = false,
}: {
  name: string;
  colors: string[];
  image: string;
  compact?: boolean;
}) => {
  const [imgError, setImgError] = useState(false);

  return (
    <a
      href="#"
      className={`group flex flex-col items-center w-full ${compact ? "max-w-[160px]" : ""} mx-auto cursor-pointer transition-transform duration-300 hover:scale-[1.03]`}
    >
      <div
        className={`w-full ${compact ? "aspect-[4/5]" : "aspect-square"} rounded-lg overflow-hidden border shadow-sm bg-gray-100 flex items-center justify-center`}
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
          className={`font-medium transition-all duration-300 group-hover:underline ${compact ? "text-sm" : "text-base"}`}
        >
          {name}
        </h3>
        <p
          className={`text-gray-500 transition-all duration-300 group-hover:underline ${compact ? "text-xs" : "text-sm"}`}
        >
          {colors.join(", ")}
        </p>
      </div>
    </a>
  );
};

const SearchModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [visibleCount, setVisibleCount] = useState(8);
  const [selectedBrandId, setSelectedBrandId] = useState<number | null>(null);
  const [selectedProductTypeId, setSelectedProductTypeId] = useState<number | null>(null);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setSearchTerm("");
      setSelectedBrandId(null);
      setSelectedProductTypeId(null);
      setVisibleCount(8);
    }
  }, [isOpen]);

  useEffect(() => {
    setVisibleCount(8);
  }, [searchTerm, selectedBrandId, selectedProductTypeId]);

  const toggleBrand = (id: number) => {
    setSelectedBrandId((prev) => (prev === id ? null : id));
  };

  const toggleProductType = (id: number) => {
    setSelectedProductTypeId((prev) => (prev === id ? null : id));
  };

  const filteredProducts = staticProducts.filter((p) => {
    const brandName = staticBrands[p.brandId]?.name.toLowerCase() || "";
    const typeName = staticProductTypes[p.productTypeId]?.name.toLowerCase() || "";

    const matchesSearch =
      searchTerm.trim() === "" ||
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.colors.some((c) => c.toLowerCase().includes(searchTerm.toLowerCase())) ||
      brandName.includes(searchTerm.toLowerCase()) ||
      typeName.includes(searchTerm.toLowerCase());

    const matchesBrand = selectedBrandId === null || p.brandId === selectedBrandId;
    const matchesType = selectedProductTypeId === null || p.productTypeId === selectedProductTypeId;

    return matchesSearch && matchesBrand && matchesType;
  });

  const visibleProducts = filteredProducts.slice(0, visibleCount);
  const remainingCount = filteredProducts.length - visibleCount;

  const filteredBrands = [...staticBrands]
    .map((brand, idx) => ({ ...brand, id: idx }))
    .sort((a, b) => {
      const aMatch = a.name.toLowerCase().includes(searchTerm.toLowerCase());
      const bMatch = b.name.toLowerCase().includes(searchTerm.toLowerCase());
      return Number(bMatch) - Number(aMatch);
    });

  const filteredProductTypes = [...staticProductTypes]
    .map((type, idx) => ({ ...type, id: idx }))
    .sort((a, b) => {
      const aMatch = a.name.toLowerCase().includes(searchTerm.toLowerCase());
      const bMatch = b.name.toLowerCase().includes(searchTerm.toLowerCase());
      return Number(bMatch) - Number(aMatch);
    });

  if (!isOpen) return null;

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
                placeholder="Search..."
                className="w-full border border-gray-300 rounded-xl py-2.5 sm:py-3 px-5 pl-11 text-base sm:text-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              />
              <CiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500" size={20} />
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
          {/* Sidebar */}
          <div className="w-full md:w-[30%] space-y-10">
            {/* Brands */}
            <div>
              <h2 className="text-xl font-semibold mb-3">Brands</h2>
              <div className="flex flex-wrap gap-3">
                {filteredBrands.map((brand) => {
                  const isSelected = selectedBrandId === brand.id;
                  return (
                    <div key={brand.name} className="flex flex-col items-center">
                      <button
                        onClick={() => toggleBrand(brand.id)}
                        className={`p-2 border rounded-xl transition-all duration-300 flex items-center justify-center w-20 h-20 bg-white cursor-pointer hover:border-[var(--primary)] ${
                          isSelected ? "border-[var(--primary)] bg-[var(--primary)]/10" : "border-gray-300"
                        }`}
                      >
                        <img
                          src={brand.image}
                          alt={brand.name}
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "/images/default-brand.jpg";
                          }}
                        />
                      </button>
                      <span className="text-sm mt-1">{brand.name}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Product Types */}
            <div>
              <h2 className="text-xl font-semibold mb-3">Product Types</h2>
              <div className="flex flex-wrap gap-3">
                {filteredProductTypes.map((type) => {
                  const isSelected = selectedProductTypeId === type.id;
                  return (
                    <div key={type.name} className="flex flex-col items-center">
                      <button
                        onClick={() => toggleProductType(type.id)}
                        className={`p-2 border rounded-xl transition-all duration-300 flex items-center justify-center w-20 h-20 bg-white cursor-pointer hover:border-[var(--primary)] ${
                          isSelected ? "border-[var(--primary)] bg-[var(--primary)]/10" : "border-gray-300"
                        }`}
                      >
                        <img
                          src={type.image}
                          alt={type.name}
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "/images/default-brand.jpg";
                          }}
                        />
                      </button>
                      <span className="text-sm mt-1">{type.name}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="w-full md:w-[70%]">
            <h2 className="text-xl font-semibold mb-4">Products</h2>
            {visibleProducts.length > 0 ? (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {visibleProducts.map((product, idx) => (
                    <ProductCard
                      key={idx}
                      name={product.name}
                      colors={product.colors}
                      image={product.image}
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
              <div className="text-gray-500 text-center mt-10 text-lg">No Product Available</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchModal;

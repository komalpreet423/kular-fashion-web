import React from 'react';

interface FilterSidebarProps {
  setFilter: (filter: string) => void;
  isMobile: boolean;
  sidebarOpen: boolean;
  setSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const FilterSidebar: React.FC<FilterSidebarProps> = ({ setFilter, isMobile, sidebarOpen, setSidebarOpen }) => {
  return (
    <div
      className={`${
        isMobile
          ? 'fixed top-0 left-0 w-3/4 h-full bg-white z-50 transition-transform transform' // Mobile: full-screen overlay
          : 'w-64 bg-white' // Desktop: fixed sidebar width (w-64 = 16rem/256px)
      } p-4 overflow-y-auto products-filter-sidebar lg:static ${
        isMobile && sidebarOpen ? 'expanded translate-x-0' : isMobile ? 'translate-x-[-100%]' : ''
      } transition-transform duration-300`}
    >
      {isMobile && (
        <button
          className="absolute top-4 right-4 text-2xl text-gray-500"
          onClick={() => setSidebarOpen(false)}
        >
          ×
        </button>
      )}

      <div className="mb-4">
        <h3 className="font-medium">Category</h3>
        <ul className="space-y-2">
          <li
            className="cursor-pointer hover:bg-gray-100 p-2 rounded"
            onClick={() => setFilter('All')}
          >
            All
          </li>
          <li
            className="cursor-pointer hover:bg-gray-100 p-2 rounded"
            onClick={() => setFilter('Outerwear')}
          >
            Outerwear
          </li>
          <li
            className="cursor-pointer hover:bg-gray-100 p-2 rounded"
            onClick={() => setFilter('Tops')}
          >
            Tops
          </li>
          <li
            className="cursor-pointer hover:bg-gray-100 p-2 rounded"
            onClick={() => setFilter('Footwear')}
          >
            Footwear
          </li>
        </ul>
      </div>
      <div>
        <h3 className="font-medium">Price</h3>
        <ul className="space-y-2">
          <li
            className="cursor-pointer hover:bg-gray-100 p-2 rounded"
            onClick={() => setFilter('Under $50')}
          >
            Under $50
          </li>
          <li
            className="cursor-pointer hover:bg-gray-100 p-2 rounded"
            onClick={() => setFilter('$50 - $100')}
          >
            $50 - $100
          </li>
          <li
            className="cursor-pointer hover:bg-gray-100 p-2 rounded"
            onClick={() => setFilter('Above $100')}
          >
            Above $100
          </li>
        </ul>
      </div>
    </div>
  );
};

export default FilterSidebar;

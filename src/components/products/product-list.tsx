import React from 'react';
import { BsCartPlus } from "react-icons/bs";

interface Product {
    id: number;
    name: string;
    category: string;
    price: number;
    image: string
}

interface ProductListProps {
    products: Product[];
}

const ProductList: React.FC<ProductListProps> = ({ products }) => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-4">
            {products.map((product) => (
                <div key={product.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition duration-200 relative group">
                    {/* Product Image */}
                    <div className="relative">
                        <img src={product.image} alt={product.name} className="w-full h-64 object-cover rounded-t-lg" />

                        {/* Add to Cart Button on Hover */}
                        <button className="absolute bottom-0 w-full left-1/2 transform -translate-x-1/2 btn-secondary py-2 px-4 opacity-0 group-hover:opacity-100 transition duration-200 flex items-center justify-center space-x-2 hover:bg-primary">
                            <BsCartPlus />
                            <span>Add to Cart</span>
                        </button>
                    </div>

                    <div className="p-2">
                        {/* Product Details */}
                        <h3 className="text-lg font-semibold">{product.name}</h3>
                        <p className="text-gray-500">Category: {product.category}</p>
                        <p className="text-gray-700">Price: ${product.price}</p>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ProductList;

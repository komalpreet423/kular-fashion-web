'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { AiOutlineDelete, AiOutlineClose } from 'react-icons/ai';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

interface Product {
    id: number;
    name: string;
    brand: string;
    image: string;
    price: number;
    quantity: number;
    maxQty: number;
}

const OrderSummary = () => {
    const router = useRouter();
    const [showModal, setShowModal] = useState(false);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    const [products, setProducts] = useState<Product[]>([
        {
        id: 1,
        name: 'Cool Sneakers',
        brand: 'Nike',
        image: '/images/temp/product1.jpg',
        price: 1500,
        quantity: 1,
        maxQty: 3,
        },
        {
        id: 2,
        name: 'Running Shoes',
        brand: 'Adidas',
        image: '/images/temp/product2.jpg',
        price: 1000,
        quantity: 2,
        maxQty: 2,
        },
    ]);

    const updateQuantity = (id: number, change: number) => {
        setProducts((prev) =>
        prev.map((product) =>
            product.id === id
            ? {
                ...product,
                quantity: Math.max(1, Math.min(product.maxQty, product.quantity + change)),
                }
            : product
        )
        );
    };

    const deleteProduct = (id: number) => {
        setProducts((prev) => prev.filter((product) => product.id !== id));
    };

    const subtotal = products.reduce(
        (acc, item) => acc + item.price * item.quantity,
        0
    );
    const tax = products.length === 0 ? 0 : 199.0;
    const total = subtotal + tax;

    const handlePlaceOrder = () => {
        setShowModal(true);
        setTimeout(() => {
            setShowModal(false);
            router.push('/');
        }, 5000); 
    };

    const handleCloseModal = () => {
        setShowModal(false);
        if (isClient) {
          router.push('/');
        }
    };

    if (!isClient) return null;

  return (
    <>
        <div className="p-4 border rounded-md bg-white shadow-sm">
            <h2 className="text-xl font-semibold border-b pb-2">Order Summary</h2>

            {products.length === 0 ? (
                <p className="text-center py-10 text-gray-500">Your cart is empty.</p>
            ) : (
                <div className="mt-4 space-y-4">
                    {products.map((product) => (
                        <div key={product.id} className="flex gap-4 rounded-md">
                            <Image
                                src={product.image}
                                alt={product.name}
                                width={60}
                                height={60}
                                className="object-cover rounded"
                            />
                            <div className="flex-1">
                                <p className="text-sm font-semibold">{product.brand}</p>
                                <p className="text-sm text-gray-600">{product.name}</p>
                                <div className="flex items-center mt-2 gap-2">
                                    <Button
                                        variant="outline"
                                        size="xs"
                                        onClick={() => updateQuantity(product.id, -1)}
                                        disabled={product.quantity <= 1}
                                    >
                                        -
                                    </Button>
                                    <span className="px-2">{product.quantity}</span>
                                    <Button
                                        variant="outline"
                                        size="xs"
                                        onClick={() => updateQuantity(product.id, 1)}
                                        disabled={product.quantity >= product.maxQty}
                                    >
                                        +
                                    </Button>
                                </div>
                            </div>
                            <div className="flex flex-col items-end justify-between">
                                <p className="text-gray-900 font-medium">
                                    €{(product.price * product.quantity).toFixed(2)}
                                </p>
                                <button
                                    onClick={() => deleteProduct(product.id)}
                                    className="text-red-500 hover:text-red-700 cursor-pointer"
                                >
                                    <AiOutlineDelete size={18} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="mt-4 border-t pt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>€{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                    <span>Tax:</span>
                    <span>€{tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-semibold text-base">
                    <span>Total:</span>
                    <span>€{total.toFixed(2)}</span>
                </div>
            </div>

            <button
                disabled={products.length === 0}
                onClick={handlePlaceOrder}
                className={`w-full py-3 rounded-none font-medium mt-4 border transition cursor-pointer ${
                    products.length === 0
                    ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                    : 'bg-primary text-white border-primary hover:bg-white hover:text-primary'
                }`}
            >
                Place Order
            </button>
        </div>

        {showModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                <div className="bg-white rounded-2xl shadow-2xl w-[90%] max-w-md h-auto p-6 relative animate-fadeIn">
                    {/* Header */}
                    <div className="flex justify-between items-center border-b pb-3 mb-4">
                        <h3 className="text-lg font-bold text-gray-800">Order Confirmation</h3>
                        <button
                            onClick={handleCloseModal}
                            className="text-gray-500 hover:text-gray-800 cursor-pointer"
                        >
                            <AiOutlineClose size={20} />
                        </button>
                    </div>

                    {/* Body */}
                    <div className="text-center">
                        <p className="text-xl font-semibold text-green-600 mb-2">
                            Order Placed Successfully
                        </p>
                        <p className="text-sm text-gray-600">Thank you for shopping with us!</p>
                    </div>
                </div>
            </div>
        )}
    </>
  );
};

export default OrderSummary;

'use client';

import Image from 'next/image';
import { AiOutlineHeart, AiFillHeart } from 'react-icons/ai';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { useState } from 'react';
import Link from 'next/link';

type ProductCardProps = {
    id: number;
    name: string;
    price: number;
    image: string;
    description: string;
};

const ProductCard: React.FC<ProductCardProps> = ({ id, name, price, image, description }) => {
    const [isFavorited, setIsFavorited] = useState(false);

    return (
        <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
        >
            <Card className="p-0 gap-2 shadow-md rounded-xl overflow-hidden relative">
                <div className="relative overflow-hidden rounded-t-xl">
                    {/* Wishlist Icon inside the image container */}
                    <motion.div
                        className="absolute cursor-pointer top-3 right-3 bg-white p-2 rounded-full shadow-md cursor-pointer hover:bg-gray-200 z-10"
                        whileTap={{ scale: 0.8 }}
                        onClick={() => setIsFavorited(!isFavorited)}
                    >
                        {isFavorited ?
                            <AiFillHeart className="text-red-500 text-xl transition-transform duration-300 transform scale-100 hover:scale-110" /> :
                            <AiOutlineHeart className="text-gray-600 text-xl transition-transform duration-300 transform scale-100 hover:scale-110" />}
                    </motion.div>

                    <motion.div className="transition-transform duration-300 transform hover:scale-110">
                        <Image
                            src={image}
                            alt={name}
                            width={300}
                            height={350}
                            className="w-full h-64 object-cover"
                        />
                    </motion.div>
                </div>
                <CardContent className="px-4 pb-2">
                    <Link href={`/description/${id}`}>
                        <p className="text-gray-500 my-0 text-sm cursor-pointer">{description}</p>
                    </Link>

                    <Link href={`/product/${id}`}>
                        <h5 className="text-md font-semibold text-gray-800 cursor-pointer">{name}</h5>
                    </Link>

                    <Link href={`/pricing/${id}`}>
                        <p className="text-gray-900 text-sm cursor-pointer">£{price}</p>
                    </Link>
                </CardContent>
            </Card>
        </motion.div>
    );
};

export default ProductCard;

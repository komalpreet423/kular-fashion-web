'use client';

import Image from 'next/image';
import { AiOutlineHeart, AiFillHeart } from 'react-icons/ai';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { useState } from 'react';
import Link from 'next/link';
import { apiBaseRoot } from '@/config';
import { ProductBase } from '@/types/interfaces';

const ProductCard: React.FC<ProductBase> = ({
    slug,
    name,
    price,
    sale_price,
    default_image,
    brand,
    images
}) => {
    const [isFavorited, setIsFavorited] = useState(false);

    let thumbnail = `/images/default-product.png`;

    if(default_image){
        thumbnail = apiBaseRoot+default_image;
    }

    if((images || []).length > 0){
        thumbnail = apiBaseRoot+images[0].path;
    }

    return (
        <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
        >
            <Card className="p-0 gap-2 shadow-md rounded-none overflow-hidden relative">
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
                        <Link href={`/product/${slug}`}>
                            <Image
                                src={thumbnail}
                                alt={name}
                                width={300}
                                height={350}
                                className="w-full h-64 rounded-none object-cover"
                                priority 
                            />
                        </Link>
                    </motion.div>
                </div>
                <CardContent className="px-4 pb-2">
                    <Link href={`/product/${slug}`}>
                        <p className="text-gray-500 my-0 text-sm cursor-pointer">{brand?.name}</p>
                    </Link>

                    <Link href={`/product/${slug}`}>
                        <h5 className="text-md font-semibold text-gray-800 cursor-pointer">{name}</h5>
                    </Link>

                    <Link href={`/product/${slug}`}>
                        <p className="text-gray-900 text-sm cursor-pointer">£{price}</p>
                    </Link>
                </CardContent>
            </Card>
        </motion.div>
    );
};

export default ProductCard;

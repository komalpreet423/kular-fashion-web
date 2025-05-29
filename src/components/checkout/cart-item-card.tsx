'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface CartItemProps {
  id: number;
  name: string;
  brand: string;
  image: string;
  price: number;
  quantity: number;
}

const CartItemCard = ({
  id,
  name,
  brand,
  image,
  price,
  quantity,
}: CartItemProps) => {
  return (
    <motion.li layout className="flex items-center gap-4 border-b pb-1">
      <motion.img src={image} alt={name} className="w-16 h-16 object-cover rounded" whileHover={{ scale: 1.1, rotate: 2 }}/>
        <div className="flex-1">
          <div className="flex justify-between">
            <Link href={`/brands/${brand}`} className="block text-sm font-semibold">{brand}</Link>
          </div>
          <Link href={`/products/${id}`} passHref>
            <span className="block text-gray-700 hover:text-gray-900">{name}</span>
          </Link>
          <div className="flex justify-between my-1">
            <span className="text-sm text-gray-500">Quantity: {quantity}</span>
            <span className="block text-gray-900">${(price * quantity).toFixed(2)}</span>
          </div>
        </div>
    </motion.li>
  );
};

export default CartItemCard;

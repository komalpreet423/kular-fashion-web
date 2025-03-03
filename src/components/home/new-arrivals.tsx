'use client';

import { motion } from 'framer-motion';
import ProductCard from '@/components/product/card';

export default function NewArrivals() {
  const products = [
    { id: 1, name: 'Product 1', price: 49.99, description: 'Brown', image: '/images/temp/product1.jpg' },
    { id: 2, name: 'Product 2', price: 59.99, description: 'Blue', image: '/images/temp/product2.jpg' },
    { id: 3, name: 'Product 3', price: 69.99, description: 'Peach', image: '/images/temp/product3.jpg' },
    { id: 4, name: 'Product 4', price: 79.99, description: 'White', image: '/images/temp/product4.jpg' },
  ];

  return (
    <section className="py-12 px-6 bg-gray-100">
      <h2 className="text-3xl font-bold text-center mb-8">New Arrivals</h2>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: { opacity: 1, transition: { staggerChildren: 0.2 } },
        }}
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6"
      >
        {products.map((product) => (
          <motion.div key={product.id} variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
            <ProductCard {...product} />
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}

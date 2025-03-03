'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

export default function FeaturedCategories() {
  const categories = ['Men', 'Women', 'Accessories'];

  return (
    <section className="py-12 px-6 text-center">
      <h2 className="text-3xl font-bold mb-8">Featured Categories</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {categories.map((category, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: index * 0.2 }}
            viewport={{ once: true }}
            className="relative group overflow-hidden rounded-xl shadow-lg"
          >
            <Image
              src={`/images/temp/${category.toLowerCase()}.jpg`}
              alt={category}
              width={400}
              height={500}
              className="w-full h-full object-cover transform group-hover:scale-110 transition duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-70"></div>
            <div className="absolute inset-0 flex flex-col items-center justify-center transition-opacity opacity-0 group-hover:opacity-100">
              <p className="text-white text-2xl font-bold mb-3">{category}</p>
              <Button variant={'outline'} className="px-6 py-3 text-lg rounded-full">
                Shop Now
              </Button>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

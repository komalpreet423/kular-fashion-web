'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

export default function HeroSection() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="relative h-screen flex items-center justify-center bg-gray-100"
    >
      <div className="text-center px-6">
        <h1 className="text-5xl font-bold mb-4">Elevate Your Style</h1>
        <p className="text-lg text-gray-600 mb-6">
          Discover the latest trends in fashion and shop your favorite styles.
        </p>
        <Button className="px-6 py-3 text-lg">Shop Now</Button>
      </div>
    </motion.section>
  );
}

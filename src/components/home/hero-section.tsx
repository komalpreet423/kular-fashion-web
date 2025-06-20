'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { apiBaseUrl } from '@/config';

export default function HeroSection() {
  const [sliderImages, setSliderImages] = useState<string[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);

  useEffect(() => {
    axios.get(`${apiBaseUrl}home-images`).then((res) => {
      if (res.data.success && res.data.slider_images.length > 0) {
        const imageUrls = res.data.slider_images.map((img: any) => img.image_url);
        setSliderImages(imageUrls);
      }
    });
  }, []);

  useEffect(() => {
    if (sliderImages.length === 0) return;

    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % sliderImages.length);
    }, 5000); 

    return () => clearInterval(interval);
  }, [sliderImages]);

  const backgroundImageStyle = sliderImages.length
    ? { backgroundImage: `url(${sliderImages[currentImageIndex]})` }
    : {};

  return (
    <motion.section
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="relative h-[70vh] flex items-center justify-center bg-cover bg-center"
      style={backgroundImageStyle}
    >
      <div className="absolute inset-0 bg-black/30 z-0" />

      <div className="relative z-10 text-center px-6 text-white">
        <h1 className="text-5xl font-bold mb-4">Elevate Your Style</h1>
        <p className="text-lg text-gray-200 mb-6">
          Discover the latest trends in fashion and shop your favorite styles.
        </p>
        <Button className="px-6 py-3 text-lg">Shop Now</Button>
      </div>
    </motion.section>
  );
}

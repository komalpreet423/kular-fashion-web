'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { motion, PanInfo } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { apiBaseUrl, apiBaseRoot } from '@/config';
import Link from 'next/link';

export default function HeroSection() {
  const [title, setTitle] = useState('Default Title');
  const [description, setDescription] = useState('Discover the latest trends');
  const [sliderImages, setSliderImages] = useState<string[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [buttonLink, setButtonLink] = useState<{ name: string, slug: string } | null>(null);

  useEffect(() => {
    axios.get(`${apiBaseUrl}blocks/section/home`).then((res) => {
      const blockData = res?.data?.block || {};
      const attributes = blockData.attributes || [];
      const textAttr = attributes.find((a: any) => a.type === 'text');
      const descriptionAttr = attributes.find((a: any) => a.type === 'description');
      const imageAttrs = attributes.filter((a: any) => a.type === 'image');
      const linkAttr = attributes.find((a: any) => a.type === 'link');
      const images = imageAttrs
        .map((img: any) =>
          img.image_path ? `${apiBaseRoot}storage/${img.image_path}` : null
        )
        .filter((url: string | null): url is string => url !== null);
      setTitle(textAttr?.text || 'Default Title');
      setDescription(descriptionAttr?.text || blockData.description || 'Discover the latest trends');
      setSliderImages(images);
      if (linkAttr) {
        setButtonLink({
          name: linkAttr.name || 'Shop Now',
          slug: linkAttr.slug || '/'
        });
      }
    }).catch((error) => {
      console.error('Error fetching hero section data:', error);
    });
  }, []);

  useEffect(() => {
    if (sliderImages.length === 0 || isDragging) return;

    const interval = setInterval(() => {
      nextSlide();
    }, 5000);

    return () => clearInterval(interval);
  }, [sliderImages, currentImageIndex, isDragging]);

  const nextSlide = () => {
    setCurrentImageIndex((prev) => (prev + 1) % sliderImages.length);
  };

  const prevSlide = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? sliderImages.length - 1 : prev - 1
    );
  };

  const handleDragStart = () => {
    setIsDragging(true);
  };

  const handleDragEnd = (
    event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo
  ) => {
    setIsDragging(false);
    const threshold = 100;

    if (info.offset.x > threshold) {
      prevSlide();
    } else if (info.offset.x < -threshold) {
      nextSlide();
    }
  };

  const backgroundImageStyle = sliderImages.length > 0
    ? { backgroundImage: `url(${sliderImages[currentImageIndex]})` }
    : {};

  return (
    <div className="relative overflow-hidden h-[70vh]">
      <motion.div
        className="absolute inset-0 cursor-grab active:cursor-grabbing"
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.1}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        style={{
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          transition: 'background-image 0.5s ease-in-out',
          ...backgroundImageStyle
        }}
      >
        <div className="absolute inset-0 bg-black/30 z-0" />
        <div className="relative z-10 text-center px-6 text-white h-full flex items-center justify-center">
          <div className="max-w-2xl mx-auto">
            <motion.h1
              className="text-5xl font-bold mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {title}
            </motion.h1>
            <motion.p
              className="text-lg text-gray-200 mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              {description}
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              {buttonLink ? (
                <Link href={buttonLink.slug} passHref>
                  <Button className="px-6 py-3 text-lg hover:scale-105 transition-transform">
                    {buttonLink.name}
                  </Button>
                </Link>
              ) : (
                <Button className="px-6 py-3 text-lg hover:scale-105 transition-transform">
                  Shop Now
                </Button>
              )}
            </motion.div>
          </div>
        </div>
      </motion.div>
      {sliderImages.length > 1 && (
        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-20">
          {sliderImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentImageIndex(index)}
              className={`w-3 h-3 rounded-full transition-all ${index === currentImageIndex ? 'bg-white w-6' : 'bg-white/50'}`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
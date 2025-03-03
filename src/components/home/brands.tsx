'use client';

import Image from 'next/image';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';

export default function Brands() {
  const brands = [
    '/images/temp/brand1.jpg',
    '/images/temp/brand2.png',
    '/images/temp/brand3.png',
    '/images/temp/brand4.png',
    '/images/temp/brand5.png',
    '/images/temp/brand6.png',
  ];

  return (
    <section className="py-12 px-6 text-center bg-white relative">
      <h2 className="text-3xl font-bold mb-8">Our Trusted Brands</h2>
      <div className="max-w-6xl mx-auto relative">
        {/* Ensure padding so buttons are inside the visible area */}
        <Carousel className="w-full px-10 sm:px-0" opts={{ loop: true }}>
          <CarouselContent className="flex">
            {brands.map((brand, index) => (
              <CarouselItem
                key={index}
                className="basis-1/1 sm:basis-1/3 lg:basis-1/5 flex justify-center"
              >
                <Image src={brand} alt={`Brand ${index + 1}`} width={75} height={40} className="object-contain w-auto h-auto" />
              </CarouselItem>
            ))}
          </CarouselContent>
          {/* Position arrows inside the carousel with proper spacing */}
          <CarouselPrevious className="absolute left-2 sm:-left-6 top-1/2 transform -translate-y-1/2 bg-white shadow-lg rounded-full p-2" />
          <CarouselNext className="absolute right-2 sm:-right-6 top-1/2 transform -translate-y-1/2 bg-white shadow-lg rounded-full p-2" />
        </Carousel>
      </div>
    </section>
  );
}

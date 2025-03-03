'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';

export default function Testimonials() {
  const testimonials = [
    { id: 1, name: 'Alice Johnson', quote: 'Absolutely love the quality and style!', image: '/images/temp/user1.png' },
    { id: 2, name: 'Mark Peterson', quote: 'Fast delivery and amazing designs!', image: '/images/temp/user2.png' },
    { id: 3, name: 'Sophia Lee', quote: 'Great customer service and unique products!', image: '/images/temp/user3.png' },
  ];

  return (
    <section className="py-12 px-6 bg-gray-50 text-center">
      <h2 className="text-3xl font-bold mb-8">What Our Customers Say</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {testimonials.map((testimonial) => (
          <motion.div
            key={testimonial.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="bg-white p-6 rounded-xl shadow-lg flex flex-col items-center"
          >
            <Image src={testimonial.image} alt={testimonial.name} width={80} height={80} className="rounded-full w-auto h-auto mb-4" />
            <p className="text-gray-700 italic mb-4">"{testimonial.quote}"</p>
            <p className="font-bold">- {testimonial.name}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

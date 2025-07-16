"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { apiBaseRoot } from "@/config";

interface Brand {
  id: number;
  name: string;
  slug: string;
  image: string;
}

interface BrandCardProps {
  brand: Brand;
}

const BrandCard: React.FC<BrandCardProps> = ({ brand }) => {
  const thumbnail = brand.image
    ? apiBaseRoot + brand.image
    : "/images/default-product.png";

  return (
    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
      <Card className="p-0 gap-2 shadow-md rounded-none overflow-hidden relative">
        <div className="relative overflow-hidden rounded-t-xl">
          <motion.div className="transition-transform duration-300 transform hover:scale-110">
            <Link href={`/brand/${brand.slug}`}>
              <Image
                src={thumbnail}
                alt={brand.name}
                width={250}
                height={300}
                className="w-full h-64 rounded-none object-cover"
                priority
              />
            </Link>
          </motion.div>
        </div>
        <CardContent className="px-4 pb-2">
          {/* Mimicking the brand and product name layout */}
          <Link href={`/brand/${brand.slug}`}>
            <p className="text-gray-500 my-0 text-sm cursor-pointer">
              {brand.name}
            </p>
          </Link>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default BrandCard;

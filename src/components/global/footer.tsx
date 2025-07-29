"use client";
import { FaFacebookF, FaInstagram, FaTwitter } from "react-icons/fa";
import Image from "next/image";
import { useEffect, useState } from "react";
import axios from 'axios';
import { apiBaseUrl } from '@/config';

interface Attribute {
  id: number;
  block_id: number;
  name: string | null;
  type: 'text' | 'link' | 'image';
  slug: string | null;
  text: string | null;
  html: string | null;
  image_path: string | null;
}

interface Block {
  id: number;
  name: string;
  key: string;
  description: string;
  attributes: Attribute[];
}

interface ApiResponse {
  section: string;
  blocks: Block[];
}

export default function Footer() {
  const [footerData, setFooterData] = useState<Block[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFooterData = async () => {
      try {
        const response = await axios.get<ApiResponse>(`${apiBaseUrl}blocks/section/footer`);

        if (response.data.blocks?.length) {
          const sortedBlocks = response.data.blocks.sort((a, b) =>
            a.key.localeCompare(b.key)
          );
          setFooterData(sortedBlocks);
        } else {
          setError('No footer data available');
        }
      } catch (err) {
        setError('Failed to connect to the server');
        console.error('API Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFooterData();
  }, []);

  const renderSection = (block: Block) => {
    const titleAttr = block.attributes.find(attr => attr.type === 'text');
    const linkAttrs = block.attributes.filter(attr => attr.type === 'link');

    return (
      <div key={block.id}>
        {titleAttr && (
          <h3 className="text-lg font-semibold mb-4">{titleAttr.text}</h3>
        )}
        <ul>
          {linkAttrs.map(attr => (
            <li key={attr.id} className="mb-2">
              <a
                href={attr.slug || '#'}
                className="hover:text-gray-300 transition-colors"
              >
                {attr.name}
              </a>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  if (loading) return (
    <div className="bg-primary text-white py-8 text-center">
      Loading footer content...
    </div>
  );

  if (error) return (
    <div className="bg-primary text-white py-8 text-center">
      <p className="text-red-300">{error}</p>
    </div>
  );

  return (
    <footer className="bg-primary text-white py-8">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <Image src={'/logo.svg'} alt="" width={200} height={100} className="mx-auto" />
            <div className="mt-3">
              <div className="flex justify-center items-center space-x-4">
                <a href="#">
                  <FaFacebookF />
                </a>
                <a href="#">
                  <FaTwitter />
                </a>
                <a href="#">
                  <FaInstagram />
                </a>
              </div>
            </div>
          </div>
          {footerData.map(block => renderSection(block))}
        </div>
        <div className="mt-8 border-t border-gray-700 pt-4 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} Kular Fashion. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
}
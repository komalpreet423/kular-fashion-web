import { FaFacebookF, FaInstagram, FaTwitter } from "react-icons/fa";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="bg-primary text-white py-8">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Company Info */}
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
          <div>
            <h3 className="text-lg font-semibold mb-4">Company</h3>
            <ul>
              <li><a href="/about" className="">About Us</a></li>
              <li><a href="/contact" className="">Contact Us</a></li>
              <li><a href="/careers" className="">Careers</a></li>
              <li><a href="/privacy-policy" className="">Privacy Policy</a></li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Customer Service</h3>
            <ul>
              <li><a href="/faq" className="">FAQ</a></li>
              <li><a href="/returns" className="">Size Guides</a></li>
              <li><a href="/returns" className="">Returns</a></li>
              <li><a href="/shipping" className="">Shipping Information</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Kular Fashion</h3>
            <ul>
              <li><a href="/faq" className="">About Us</a></li>
              <li><a href="/returns" className="">Contact Us</a></li>
              <li><a href="/shipping" className="">Opening Timings</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="mt-8 border-t border-gray-700 pt-4 text-center text-sm">
          <p>&copy; 2025 Kular Fashion. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
}

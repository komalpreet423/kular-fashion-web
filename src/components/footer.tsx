// components/Footer.tsx

import React from "react";

const Footer = () => {
  return (
    <footer className="shadow-t-lg bg-gray-800 bg-white text-dark py-6">
      <div className="mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-8">
          {/* About Section */}
          <div>
            <h5 className="text-lg font-semibold mb-4">About Us</h5>
            <p className="text-sm">
              We are a leading e-commerce platform providing quality products for all your needs.
            </p>
          </div>

          {/* Customer Service */}
          <div>
            <h5 className="text-lg font-semibold mb-4">Customer Service</h5>
            <ul>
              <li><a href="#" className="text-sm hover:underline">Contact Us</a></li>
              <li><a href="#" className="text-sm hover:underline">Shipping & Returns</a></li>
              <li><a href="#" className="text-sm hover:underline">Privacy Policy</a></li>
              <li><a href="#" className="text-sm hover:underline">Terms & Conditions</a></li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h5 className="text-lg font-semibold mb-4">Quick Links</h5>
            <ul>
              <li><a href="#" className="text-sm hover:underline">Shop</a></li>
              <li><a href="#" className="text-sm hover:underline">Blog</a></li>
              <li><a href="#" className="text-sm hover:underline">Track Order</a></li>
              <li><a href="#" className="text-sm hover:underline">FAQs</a></li>
            </ul>
          </div>

          {/* Social Media */}
          <div>
            <h5 className="text-lg font-semibold mb-4">Follow Us</h5>
            <div className="flex space-x-4">
              <a href="#" className="text-sm hover:text-gray-400">
                <i className="fab fa-facebook"></i> Facebook
              </a>
              <a href="#" className="text-sm hover:text-gray-400">
                <i className="fab fa-twitter"></i> Twitter
              </a>
              <a href="#" className="text-sm hover:text-gray-400">
                <i className="fab fa-instagram"></i> Instagram
              </a>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="mt-6 border-t border-gray-700 pt-4 text-center text-sm">
          <p>&copy; 2025 Kular Fashion Inc. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

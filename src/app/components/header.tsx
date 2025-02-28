"use client"
import { useState, useEffect } from 'react';
import { FiUser, FiMenu } from "react-icons/fi";
import { BsCart } from "react-icons/bs";
import { FaChevronDown } from "react-icons/fa";
import { CiSearch } from "react-icons/ci";
import { CiHeart } from "react-icons/ci";
import { IoCallOutline } from "react-icons/io5";

const Header = () => {
  const [isTopMenuOpen, setIsTopMenuOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSticky, setIsSticky] = useState(false);

  // Handle the sticky header on scroll
  const handleScroll = () => {
    if (window.scrollY > 10) {
      setIsSticky(true);
    } else {
      setIsSticky(false);
    }
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);

    // Clean up the event listener when the component is unmounted
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <>
      {/* Top Header */}
      <div className="header-top text-white py-2 uppercase">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          {/* Currency */}
          <div className="flex items-center">
            <span>USD</span>
            <FaChevronDown className='ml-1 currency-icon' />
          </div>

          {/* Left side: Hamburger Menu (for mobile) */}
          <div className="lg:hidden">
            <button
              onClick={() => setIsTopMenuOpen(!isTopMenuOpen)}
              className="text-white flex gap-2  flex items-center focus:outline-none">
              <FaChevronDown />
              Links
            </button>
          </div>

          {/* Right side links and user info */}
          <div className="lg:flex hidden items-center space-x-6">
            <a href="tel:+123456789" className="flex items-center "><IoCallOutline className='mr-1' />Call: +1 234 567 89</a>
            <a href="/wishlist" className="flex items-center"><CiHeart className='mr-1' /> My Wishlist</a>
            <a href="/about">About Us</a>
            <a href="/contact">Contact Us</a>
            <a href="/login" className="flex items-center space-x-2">
              <FiUser />
              <span>Login</span>
            </a>
          </div>

          {/* Mobile dropdown menu */}
          <div className={`lg:hidden ${isTopMenuOpen ? 'block' : 'hidden'} absolute top-40 right-0 w-full bg-gray-800 text-white py-4 px-6 shadow-lg`}>
            <a href="tel:+123456789" className="block py-2 hover:text-gray-300">Call: +1 234 567 89</a>
            <a href="/wishlist" className="block py-2 hover:text-gray-300">My Wishlist</a>
            <a href="/about" className="block py-2 hover:text-gray-300">About Us</a>
            <a href="/contact" className="block py-2 hover:text-gray-300">Contact Us</a>
            <a href="/login" className="flex items-center space-x-2 py-2 hover:text-gray-300">
              <FiUser />
              <span>Login</span>
            </a>
          </div>
        </div>
      </div>

      <header className={`transition-all duration-300 bg-white ease-in-out ${isSticky ? 'fixed top-0 left-0 w-full bg-white shadow-md z-50' : ''}`}>
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between uppercase">
          {/* Logo and Navigation Links */}
          <div className="flex items-center space-x-6 py-2">
            <div className="text-xl font-bold">
              <a href="">
                <img src="/logo.png" className='header-logo' alt="" />
              </a>
            </div>

            {/* Navigation Links */}
            <nav className="hidden md:flex space-x-6 relative">
              <a href="/" className="hover:text-gray-600">Home</a>

              {/* Men Link with Mega Menu for Fashion Categories */}
              <div className="relative group">
                <a href="#" className="flex items-center hover:text-gray-600">Men <FaChevronDown className='ml-1 text-gray-600 text-xs' /></a>
                {/* Mega Menu Dropdown */}
                <div className="absolute left-0 hidden group-hover:block group-hover:opacity-100 mt-0 w-96 p-4 bg-white shadow-lg opacity-0 transition-opacity duration-300 ease-in-out">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <h3 className="font-semibold">Shirts</h3>
                      <ul>
                        <li><a href="/men/shirts/casual" className="hover:text-gray-600">Casual Shirts</a></li>
                        <li><a href="/men/shirts/formal" className="hover:text-gray-600">Formal Shirts</a></li>
                        <li><a href="/men/shirts/denim" className="hover:text-gray-600">Denim Shirts</a></li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="font-semibold">Pants</h3>
                      <ul>
                        <li><a href="/men/pants/chinos" className="hover:text-gray-600">Chinos</a></li>
                        <li><a href="/men/pants/jeans" className="hover:text-gray-600">Jeans</a></li>
                        <li><a href="/men/pants/shorts" className="hover:text-gray-600">Shorts</a></li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="font-semibold">Jackets</h3>
                      <ul>
                        <li><a href="/men/jackets/leather" className="hover:text-gray-600">Leather Jackets</a></li>
                        <li><a href="/men/jackets/denim" className="hover:text-gray-600">Denim Jackets</a></li>
                        <li><a href="/men/jackets/blazers" className="hover:text-gray-600">Blazers</a></li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
              <div className="relative group">
                <a href="#" className="flex items-center hover:text-gray-600">Women <FaChevronDown className='ml-1 text-gray-600 text-xs' /></a>
                {/* Mega Menu Dropdown */}
                <div className="absolute left-0 hidden group-hover:block group-hover:opacity-100 mt-0 w-96 p-4 bg-white shadow-lg opacity-0 transition-opacity duration-300 ease-in-out">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <h3 className="font-semibold">Shirts</h3>
                      <ul>
                        <li><a href="/men/shirts/casual" className="hover:text-gray-600">Casual Shirts</a></li>
                        <li><a href="/men/shirts/formal" className="hover:text-gray-600">Formal Shirts</a></li>
                        <li><a href="/men/shirts/denim" className="hover:text-gray-600">Denim Shirts</a></li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="font-semibold">Pants</h3>
                      <ul>
                        <li><a href="/men/pants/chinos" className="hover:text-gray-600">Chinos</a></li>
                        <li><a href="/men/pants/jeans" className="hover:text-gray-600">Jeans</a></li>
                        <li><a href="/men/pants/shorts" className="hover:text-gray-600">Shorts</a></li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="font-semibold">Jackets</h3>
                      <ul>
                        <li><a href="/men/jackets/leather" className="hover:text-gray-600">Leather Jackets</a></li>
                        <li><a href="/men/jackets/denim" className="hover:text-gray-600">Denim Jackets</a></li>
                        <li><a href="/men/jackets/blazers" className="hover:text-gray-600">Blazers</a></li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
              <div className="relative group">
                <a href="#" className="flex items-center hover:text-gray-600">Kids <FaChevronDown className='ml-1 text-gray-600 text-xs' /></a>
                {/* Mega Menu Dropdown */}
                <div className="absolute left-0 hidden group-hover:block group-hover:opacity-100 mt-0 w-96 p-4 bg-white shadow-lg opacity-0 transition-opacity duration-300 ease-in-out">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <h3 className="font-semibold">Shirts</h3>
                      <ul>
                        <li><a href="/men/shirts/casual" className="hover:text-gray-600">Casual Shirts</a></li>
                        <li><a href="/men/shirts/formal" className="hover:text-gray-600">Formal Shirts</a></li>
                        <li><a href="/men/shirts/denim" className="hover:text-gray-600">Denim Shirts</a></li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="font-semibold">Pants</h3>
                      <ul>
                        <li><a href="/men/pants/chinos" className="hover:text-gray-600">Chinos</a></li>
                        <li><a href="/men/pants/jeans" className="hover:text-gray-600">Jeans</a></li>
                        <li><a href="/men/pants/shorts" className="hover:text-gray-600">Shorts</a></li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="font-semibold">Jackets</h3>
                      <ul>
                        <li><a href="/men/jackets/leather" className="hover:text-gray-600">Leather Jackets</a></li>
                        <li><a href="/men/jackets/denim" className="hover:text-gray-600">Denim Jackets</a></li>
                        <li><a href="/men/jackets/blazers" className="hover:text-gray-600">Blazers</a></li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </nav>
          </div>

          {/* Header-right with Icons */}
          <div className="flex items-center space-x-6">
            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                className="px-4 py-2 border-b-2 border-gray-300 text-gray-700 focus:outline-none focus:ring-0 focus:border-primary w-full"
              />
              <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-2xl">
                <CiSearch />
              </span>
            </div>


            <a href="/cart" className="relative hover:text-gray-600 cart-icon">
              <BsCart className="text-2xl" />

              {/* Conditionally render cart count if greater than 0 */}
              <span className="absolute top-[-5px] right-[-5px] font-bold text-white bg-primary rounded-full flex items-center justify-center">
                0
              </span>
            </a>
          </div>

          {/* Mobile menu toggle */}
          <div className="md:hidden flex items-center">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-800 focus:outline-none">
              <FiMenu />
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-gray-100 px-4 py-2 space-y-4">
            <a href="/" className="block text-gray-800 hover:text-gray-600">Home</a>
            <a href="/about" className="block text-gray-800 hover:text-gray-600">About</a>
            <a href="/services" className="block text-gray-800 hover:text-gray-600">Services</a>
            <a href="/contact" className="block text-gray-800 hover:text-gray-600">Contact</a>
          </div>
        )}
      </header>
    </>
  );
};

export default Header;

"use client";

import Link from "next/link";
import { CiMenuBurger, CiSearch } from "react-icons/ci";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import MiniCart from "@/components/cart/mini-cart";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { FiUser, FiMenu } from "react-icons/fi";
import { FaChevronDown } from "react-icons/fa";
import { IoCallOutline } from "react-icons/io5";
import { CiHeart } from "react-icons/ci";
import Image from "next/image";

const Header: React.FC = () => {
  const [isTopMenuOpen, setIsTopMenuOpen] = useState(false);
  const [isSticky, setIsSticky] = useState<boolean>(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (<>
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
    <header className={`w-full bg-white shadow-md p-4 ${isSticky ? "fixed top-0 left-0 right-0 z-50" : "relative"}`}>
      <div className="w-full mx-auto flex items-center justify-between">
        {/* Left Side: Mobile Menu Button */}
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <button>
                <CiMenuBurger size={24} />
              </button>
            </SheetTrigger>
            <SheetContent side="left" className="p-4 space-y-4">
              <SheetTitle className="mb-0">
                <Image src={'/images/logo.png'} alt="" width={160} height={20} className="mx-auto" />
              </SheetTitle>

              <nav className="flex flex-col space-y-2">
                <Link href="/" className="text-gray-700 hover:text-primary">Home</Link>
                <Link href="/products" className="text-gray-700 hover:text-primary">Latest</Link>
                <Link href="/products" className="text-gray-700 hover:text-primary">Shop By</Link>
                <Link href="/products" className="text-gray-700 hover:text-primary">Launches</Link>
                <Link href="/products" className="text-gray-700 hover:text-primary">Brands</Link>
                <Link href="/products" className="text-gray-700 hover:text-primary">Clothing</Link>
                <Link href="/products" className="text-gray-700 hover:text-primary">Footwear</Link>
                <Link href="/products" className="text-gray-700 hover:text-primary">Lifestyle</Link>
                <Link href="/products" className="text-gray-700 hover:text-primary">Sale</Link>
              </nav>
            </SheetContent>
          </Sheet>
        </div>

        <Link href="/">
          <Image src={'/images/logo.png'} alt="" width={200} height={20} className="mx-auto" />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex space-x-4 w-full justify-center">
          <Link href="/" className="text-gray-700 hover:text-primary">Home</Link>
          <Link href="/products" className="text-gray-700 hover:text-primary">Latest</Link>
          <Link href="/products" className="text-gray-700 hover:text-primary">Shop By</Link>
          <Link href="/products" className="text-gray-700 hover:text-primary">Launches</Link>
          <Link href="/products" className="text-gray-700 hover:text-primary">Brands</Link>
          <Link href="/products" className="text-gray-700 hover:text-primary">Clothing</Link>
          <Link href="/products" className="text-gray-700 hover:text-primary">Footwear</Link>
          <Link href="/products" className="text-gray-700 hover:text-primary">Lifestyle</Link>
          <Link href="/products" className="text-gray-700 hover:text-primary">Sale</Link>
        </nav>

        {/* Right Side: Search & Cart */}
        <div className="flex items-center space-x-4">
          {/* Hide Searchbox for Tablet, Show Only Icon for Mobile */}
          <div className="hidden lg:block relative">
            <Input type="text" placeholder="Search..." className="w-48" />
            <CiSearch className="absolute right-3 top-2.5 text-gray-500" size={18} />
          </div>
          <div className="md:block lg:hidden">
            <CiSearch size={24} className="text-gray-700 cursor-pointer" />
          </div>
          <MiniCart />
        </div>
      </div>
    </header>
  </>);
};

export default Header;
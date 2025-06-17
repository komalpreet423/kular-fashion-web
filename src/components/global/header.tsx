"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useCurrency } from "@/context/CurrencyContext";
import MiniCart from "@/components/cart/mini-cart";
import SearchModal from "@/components/SearchModal/search";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { apiBaseUrl } from "@/config";
import axios from "axios";

import { CiMenuBurger, CiSearch, CiHeart } from "react-icons/ci";
import { FaChevronDown } from "react-icons/fa";
import { FiUser } from "react-icons/fi";
import { IoCallOutline } from "react-icons/io5";

interface Department {
  id: number;
  slug: string;
  name: string;
  product_types?: {
    id: number;
    slug: string;
    name: string;
    short_name: string;
  }[];
}

interface UserDetails {
  name: string;
  email: string;
}

const CurrencySelector = () => {
  const { currency, setCurrency } = useCurrency();

  return (
    <select
      value={currency}
      onChange={(e) => setCurrency(e.target.value as "USD" | "EUR" | "GBP")}
      className="bg-black text-sm text-white border-none focus:outline-none cursor-pointer"
    >
      <option value="USD">USD</option>
      <option value="EUR">EURO</option>
      <option value="GBP">POUND</option>
    </select>
  );
};

const Header: React.FC = () => {
  const [isTopMenuOpen, setIsTopMenuOpen] = useState(false);
  const [isSticky, setIsSticky] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);

  useEffect(() => {
    const storedUser = localStorage.getItem("userDetails");
    const token = localStorage.getItem("authToken");
    if (storedUser && token) {
      try {
        setUserDetails(JSON.parse(storedUser));
        setIsLoggedIn(true);
      } catch (err) {
        console.error("Failed to parse userDetails:", err);
      }
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => setIsSticky(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest(".user-dropdown")) {
        setShowUserDropdown(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  useEffect(() => {
    axios
      .get(`${apiBaseUrl}menus`)
      .then((res) => {
        if (res.data.success) {
          setDepartments(res.data.departments.data);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch departments:", err);
      });
  }, []);

  return (
    <>
      <ToastContainer position="top-center" />
      <div className="header-top text-white py-2 uppercase bg-black">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          <CurrencySelector />
          <div className="lg:hidden">
            <button
              onClick={() => setIsTopMenuOpen(!isTopMenuOpen)}
              className="text-white flex items-center"
            >
              <FaChevronDown />
              Links
            </button>
          </div>
          <div className="hidden lg:flex items-center space-x-6">
            <a href="tel:+123456789" className="flex items-center">
              <IoCallOutline className="mr-1" /> Call: +1 234 567 89
            </a>
            <Link href="/wishlist" className="flex items-center">
              <CiHeart className="mr-1" /> My Wishlist
            </Link>
            <Link href="/about">About Us</Link>
            <Link href="/contact">Contact Us</Link>
            {isLoggedIn && <Link href="/orders">Orders</Link>}
            <Link href="/gift-voucher">Gift Voucher</Link>

            <div className="relative user-dropdown">
              {isLoggedIn ? (
                <button
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  className="flex items-center"
                >
                  <FiUser size={20} />
                  <span className="ml-1 text-sm">{userDetails?.name ?? "User"}</span>
                </button>
              ) : (
                <Link href="/login" className="flex items-center">
                  <FiUser size={20} />
                  <span className="ml-1">Login</span>
                </Link>
              )}

              {isLoggedIn && showUserDropdown && (
                <div className="absolute right-0 mt-2 w-40 bg-white border rounded shadow-lg z-50">
                  <Link href="/my-account" className="block px-4 py-2 text-sm hover:bg-gray-100">
                    My Account
                  </Link>
                  <button
                    onClick={() => {
                      localStorage.removeItem("authToken");
                      localStorage.removeItem("userDetails");
                      setIsLoggedIn(false);
                      toast.success("Logged out successfully!");
                      setTimeout(() => (window.location.href = "/"), 2000);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <header className={`w-full bg-white shadow-md p-4 ${isSticky ? "fixed top-0 left-0 right-0 z-50" : "relative"}`}>
        <div className="w-full mx-auto flex items-center justify-between">
          {/* Mobile menu */}
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <button><CiMenuBurger size={24} /></button>
              </SheetTrigger>
              <SheetContent side="left" className="p-4 space-y-4">
                <SheetTitle>
                  <Image src="/images/logo.png" alt="Logo" width={160} height={20} />
                </SheetTitle>
                <nav className="flex flex-col space-y-2">
                  <Link href="/">Home</Link>
                  <Link href="/products">Latest</Link>
                  {departments.map((dept) => (
                    <div key={dept.id}>
                      <Link href={`/departments/${dept.slug}`}>{dept.name}</Link>
                      {dept.product_types?.map((type) => (
                        <Link key={type.id} href={`/departments/${dept.slug}/${type.slug}`} className="ml-4 text-sm">
                          {type.name}
                        </Link>
                      ))}
                    </div>
                  ))}
                  <Link href="/brands">Brands</Link>
                  <Link href="/products">Clothing</Link>
                  <Link href="/products">Footwear</Link>
                  <Link href="/products">Lifestyle</Link>
                  <Link href="/products">Sale</Link>
                  {isLoggedIn && <Link href="/orders">Orders</Link>}
                  <Link href="/wishlist">Wishlist</Link>
                </nav>
              </SheetContent>
            </Sheet>
          </div>

          <Link href="/">
            <Image src="/images/logo.png" alt="Logo" width={200} height={20} />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex space-x-4 w-full justify-center items-center relative">
            <Link href="/">Home</Link>
            <Link href="/products">Latest</Link>
            {departments.map((dept) => (
              <div key={dept.id} className="group relative">
                <div>
                  <Link href={`/departments/${dept.slug}`} className="relative px-1 py-1 hover:text-gray-700">
                    {dept.name}
                  </Link>
                  {dept.product_types?.length > 0 && (
                    <div className="absolute left-0 top-full z-50 w-48 bg-white shadow-md rounded-md hidden group-hover:block">
                      {dept.product_types.map((type) => (
                        <Link
                          key={type.id}
                          href={`/departments/${dept.slug}/${type.slug}`}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          {type.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            <Link href="/brands">Brands</Link>
            <Link href="/products">Clothing</Link>
            <Link href="/products">Footwear</Link>
            <Link href="/products">Lifestyle</Link>
            <Link href="/products">Sale</Link>
            {isLoggedIn && <Link href="/orders">Orders</Link>}
            <Link href="/wishlist">Wishlist</Link>
          </nav>

          <div className="flex items-center space-x-4">
            <div className="cursor-pointer" onClick={() => setIsSearchOpen(true)}>
              <CiSearch size={24} />
            </div>
            <MiniCart />
            <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;

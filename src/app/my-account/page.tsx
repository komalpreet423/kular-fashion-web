"use client";

import { useEffect, useState } from "react";
import { FaBox, FaHeart, FaMapMarkerAlt, FaUser } from "react-icons/fa";
import OrdersPage from "./../orders/page";
import AddressesPage from "./../addresses/page";
import MyWishlistPage from "./../wishlist/page";

interface UserDetails {
  name: string;
  email: string;
}

const MyAccountPage = () => {
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [activeLink, setActiveLink] = useState("Orders");

  useEffect(() => {
    const storedUser = localStorage.getItem("userDetails");
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setUserDetails(parsed);
      } catch (err) {
        console.error("Invalid userDetails JSON");
      }
    }

    const storedLink = localStorage.getItem("activeAccountLink");
    if (storedLink) {
      setActiveLink(storedLink);
    }
  }, []);

  const handleLinkClick = (label: string) => {
    setActiveLink(label);
    localStorage.setItem("activeAccountLink", label);
  };

  const getInitial = (name: string) => name?.charAt(0)?.toUpperCase() || "";

  const links = [
    { icon: <FaBox />, label: "Orders", href: "/my-account/orders" },
    { icon: <FaMapMarkerAlt />, label: "Addresses", href: "/my-account/addresses" },
    { icon: <FaHeart />, label: "Your Wishlist", href: "/my-account/wishlist" },
    { icon: <FaUser />, label: "Personal Info", href: "/my-account/info" },
  ];

  return (
    <div className="bg-gray-100 px-2 md:px-4 py-10">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Left - User Info */}
        <div className="w-full md:w-1/3 bg-white rounded-2xl p-6 flex items-center space-x-4 shadow-md">
          <div className="w-16 h-16 rounded-full bg-white text-[var(--primary)] border-2 border-[var(--primary)] flex items-center justify-center text-2xl font-bold">
            {userDetails ? getInitial(userDetails.name) : ""}
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-800">{userDetails?.name}</h2>
            <p className="text-sm text-gray-500">{userDetails?.email}</p>
          </div>
        </div>

        {/* Right - Links Grid */}
        <div className="w-full md:w-2/3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {links.map((link) => (
            <button
              key={link.label}
              onClick={() => handleLinkClick(link.label)}
              className={`flex items-center p-5 rounded-xl transition-all duration-300 group ${
                activeLink === link.label
                  ? "bg-[var(--primary)] text-white"
                  : "bg-gray-200 hover:bg-[var(--primary)]"
              } cursor-pointer`}
            >
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center text-xl transition-all duration-300 ${
                  activeLink === link.label
                    ? "bg-white text-[var(--primary)]"
                    : "bg-white text-gray-500 group-hover:text-[var(--primary)]"
                }`}
              >
                {link.icon}
              </div>
              <span
                className={`ml-4 text-lg font-medium transition-all duration-300 ${
                  activeLink === link.label
                    ? "text-white"
                    : "text-gray-700 group-hover:text-white"
                }`}
              >
                {link.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Conditional Page Component */}
      {activeLink === "Orders" && (
        <div className="mt-6 px-8">
          <OrdersPage />
        </div>
      )}

      {activeLink === "Addresses" && (
        <div className="mt-6 px-8">
          <AddressesPage />
        </div>
      )}

      {activeLink === "Your Wishlist" && (
        <div className="mt-6 px-8">
          <MyWishlistPage />
        </div>
      )}
    </div>
  );
};

export default MyAccountPage;

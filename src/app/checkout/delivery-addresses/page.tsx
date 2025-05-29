"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { toast } from "react-toastify";
import { apiBaseUrl } from '@/config';

interface Address {
  id: number;
  name: string;
  country_code: string;
  phone_no: string;
  address_line_1: string;
  address_line_2: string;
  landmark: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
  is_default: boolean;
  type: string;
}

const DeliveryAddresses = () => {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<number | null>(null);

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const res = await fetch(`${apiBaseUrl}customer-addresses`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      const addressList = data.data;
      setAddresses(addressList);

      const storedId = localStorage.getItem("selectedAddressId");
      const defaultId = addressList.find((a: Address) => a.is_default)?.id;
      
      setSelectedAddress(storedId ? parseInt(storedId) : defaultId || null);
    } catch (err) {
      toast.error("Failed to fetch addresses.");
    }
  };

  const handleSelectAddress = (id: number) => {
    setSelectedAddress(id);
    localStorage.setItem("selectedAddressId", id.toString());
  };

  return (
    <div className="border p-4 rounded-md shadow-sm bg-gray-100">
      <h2 className="text-xl font-semibold border-b pb-2">Delivery Address</h2>
      <div className="mt-3 flex flex-wrap gap-4">
        {addresses.map((address) => (
          <label key={address.id} className="w-full md:w-[48%] cursor-pointer transition-all">
            <Card
              className={`${
                selectedAddress === address.id
                  ? "border-primary bg-white shadow-lg"
                  : "border-gray-300 bg-white"
              } border rounded-md p-0`}
            >
              <div className="flex items-start gap-3 p-4">
                <input
                  type="radio"
                  name="address"
                  checked={selectedAddress === address.id}
                  onChange={() => handleSelectAddress(address.id)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-base"> {address.name} </span>
                    <span className="px-3 py-1 text-white text-xs font-semibold bg-primary rounded-full">
                      {address.type}
                    </span>
                  </div>
                  <div className="mt-1 space-y-0.5">
                    <p className="text-sm text-gray-700">
                      {address.address_line_1}
                      {address.address_line_2 && `, ${address.address_line_2}`},{" "}
                      {address.landmark}, {address.city}, {address.state}{" "}
                      {address.zip_code}, {address.country}
                    </p>
                    <p className="text-sm text-gray-600">
                      <strong>Pin Code:</strong> {address.zip_code}
                    </p>
                    <p className="text-sm text-gray-600">
                      <strong>Phone:</strong> {address.country_code} - {address.phone_no}
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </label>
        ))}
      </div>
    </div>
  );
};

export default DeliveryAddresses;

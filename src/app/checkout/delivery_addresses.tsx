"use client";

import { useState } from "react";

const DeliveryAddresses = () => {
    const [addresses, setAddresses] = useState([
        {
            id: 1,
            name: "Jack Jennas",
            address: "8424 James Lane, South San Francisco, CA 94080",
            pincode: "+380",
            phone: "+380 (0564) 53-29-68",
            type: "Home",
        },
        {
            id: 2,
            name: "Jack Jennas",
            address: "Nakhimovskiy R-N / Lastovaya UL., bld. 5/A, appt. 12",
            pincode: "+380",
            phone: "+380 (0564) 53-29-68",
            type: "Office",
        },
    ]);

    const [selectedAddress, setSelectedAddress] = useState<number | null>(1);

    return (
        <div className="border p-4 rounded-md shadow-sm bg-gray-100">
            <h2 className="text-xl font-semibold border-b pb-2">Delivery Address</h2>
            <div className="mt-3 flex flex-wrap gap-4">
                {addresses.map((address) => (
                    <label key={address.id} className={`w-full md:w-[48%] border p-4 rounded-md shadow-md flex items-start space-x-3 cursor-pointer transition-all 
                        ${selectedAddress === address.id ? "border-primary bg-white shadow-lg" : "border-gray-300 bg-white"}`}
                    >
                        <input
                            type="radio"
                            name="address"
                            className="mt-1"
                            checked={selectedAddress === address.id}
                            onChange={() => setSelectedAddress(address.id)}
                        />
                        <div className="flex-1">
                            <div className="flex justify-between items-center">
                                <h4 className="text-lg font-medium">{address.name}</h4>
                                <span className="px-3 py-1 text-white text-xs font-semibold bg-primary rounded-full">{address.type}</span>
                            </div>
                            <p className="text-sm text-gray-700">{address.address}</p>
                            <p className="text-sm text-gray-600"><strong>Pin Code:</strong> {address.pincode}</p>
                            <p className="text-sm text-gray-600"><strong>Phone:</strong> {address.phone}</p>
                        </div>
                    </label>
                ))}
            </div>
        </div>
    );
};

export default DeliveryAddresses;

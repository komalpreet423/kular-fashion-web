"use client";

import { useState } from "react";
import { toast } from "react-toastify";

interface Address {
    id: string;
    name: string;
    addressLine1: string;
    addressLine2: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    isDefault: boolean;
}

const AddressesPage = () => {
    const [addresses, setAddresses] = useState<Address[]>([
        {
            id: "1",
            name: "John Doe",
            addressLine1: "123 Main St",
            addressLine2: "Apt 4B",
            city: "New York",
            state: "NY",
            zipCode: "10001",
            country: "USA",
            isDefault: true,
        },
        {
            id: "2",
            name: "Jane Smith",
            addressLine1: "456 Elm St",
            addressLine2: "",
            city: "Los Angeles",
            state: "CA",
            zipCode: "90001",
            country: "USA",
            isDefault: false,
        },
        {
            id: "3",
            name: "Jane Smith",
            addressLine1: "456 Elm St",
            addressLine2: "",
            city: "Los Angeles",
            state: "CA",
            zipCode: "90001",
            country: "USA",
            isDefault: false,
        },
        {
            id: "4",
            name: "Jane Smith",
            addressLine1: "456 Elm St",
            addressLine2: "",
            city: "Los Angeles",
            state: "CA",
            zipCode: "90001",
            country: "USA",
            isDefault: false,
        },
        {
            id: "5",
            name: "Jane Smith",
            addressLine1: "456 Elm St",
            addressLine2: "",
            city: "Los Angeles",
            state: "CA",
            zipCode: "90001",
            country: "USA",
            isDefault: false,
        },
    ]);

    const [showForm, setShowForm] = useState<boolean>(false);
    const [editingAddress, setEditingAddress] = useState<Address | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [addressToDelete, setAddressToDelete] = useState<Address | null>(null);

    const handleAddAddress = () => {
        setShowForm(true);
        setEditingAddress(null);
        document.body.style.overflow = "hidden"; // Hide scrollbar
    };

    const handleEditAddress = (address: Address) => {
        setShowForm(true);
        setEditingAddress(address);
        document.body.style.overflow = "hidden"; // Hide scrollbar
    };

    const handleSaveAddress = (address: Address) => {
        if (editingAddress) {
            setAddresses(
                addresses.map((addr) =>
                addr.id === editingAddress.id ? { ...addr, ...address } : addr
                )
            );
            toast.success("Address updated successfully!");
        } else {
            setAddresses([
                ...addresses,
                { ...address, id: (addresses.length + 1).toString() },
            ]);
            toast.success("Address added successfully!");
        }
        setShowForm(false);
        document.body.style.overflow = ""; // Restore scrollbar
    };

    const handleCancel = () => {
        setShowForm(false);
        setEditingAddress(null);
        document.body.style.overflow = ""; // Restore scrollbar
    };

    const handleDeleteAddress = (address: Address) => {
        setShowDeleteModal(true);
        setAddressToDelete(address);
    };

    const handleConfirmDelete = () => {
        if (addressToDelete) {
            setAddresses(addresses.filter((a) => a.id !== addressToDelete.id));
            toast.success("Address deleted successfully!");
            setShowDeleteModal(false);
            setAddressToDelete(null);
        }
    };
  

    return (
        <div className="min-h-[70vh] px-4 py-8">
            <h1 className="text-2xl font-bold mb-6">My Addresses</h1>

            <button
                onClick={handleAddAddress}
                className="px-4 py-2 bg-primary text-white rounded-lg mb-6 transition-all duration-300 hover:bg-white hover:border-primary hover:text-primary hover:cursor-pointer border-2"
            >
                Add New Address
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {addresses.map((address) => (
                    <div key={address.id} className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 flex flex-col justify-between h-full">
                        <div>
                            <h3 className="text-lg font-semibold">{address.name}</h3>
                            <p>
                                {address.addressLine1}
                                {address.addressLine2 && `, ${address.addressLine2}`},{" "}
                                {address.city}, {address.state} {address.zipCode},{" "}
                                {address.country}
                            </p>
                            {address.isDefault && (
                                <span className="text-sm text-green-500">Default Address</span>
                            )}
                        </div>
                        <div className="flex space-x-4 mt-4">
                            <button onClick={() => handleEditAddress(address)} className="text-primary hover:bg-primary hover:text-white px-4 py-2 transition-all duration-300 cursor-pointer border-none rounded-lg">
                                Edit
                            </button>
                            <button onClick={() => handleDeleteAddress(address)} className="text-red-500 hover:bg-white hover:text-red-500 hover:border-red-500 px-4 py-2 transition-all duration-300 cursor-pointer border-2 rounded-lg">
                                Delete
                            </button>
                        </div>
                    </div>
                ))}
            </div>


            {showForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto" style={{ background: "rgb(0 0 0 / 88%)" }}>
                    <div className="relative bg-white p-6 rounded-lg shadow-md w-[80%] max-w-3xl max-h-[90vh] overflow-y-auto">
                        {/* Close Button */}
                        <button onClick={handleCancel} className="absolute top-3 right-3 text-gray-600 hover:text-red-500 text-xl cursor-pointer">
                            &times;
                        </button>

                        <h2 className="text-xl font-semibold mb-4">
                            {editingAddress ? "Edit Address" : "Add New Address"}
                        </h2>

                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                const formData = new FormData(e.target as HTMLFormElement);
                                const newAddress: Address = {
                                id: editingAddress ? editingAddress.id : "",
                                name: formData.get("name") as string,
                                addressLine1: formData.get("addressLine1") as string,
                                addressLine2: formData.get("addressLine2") as string,
                                city: formData.get("city") as string,
                                state: formData.get("state") as string,
                                zipCode: formData.get("zipCode") as string,
                                country: formData.get("country") as string,
                                isDefault: formData.get("isDefault") === "on",
                                };
                                handleSaveAddress(newAddress);
                            }}
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block mb-1">Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        defaultValue={editingAddress?.name || ""}
                                        className="w-full p-3 border border-gray-300 rounded-lg"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block mb-1">Address Line 1</label>
                                    <input
                                        type="text"
                                        name="addressLine1"
                                        defaultValue={editingAddress?.addressLine1 || ""}
                                        className="w-full p-3 border border-gray-300 rounded-lg"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block mb-1">Address Line 2</label>
                                    <input
                                        type="text"
                                        name="addressLine2"
                                        defaultValue={editingAddress?.addressLine2 || ""}
                                        className="w-full p-3 border border-gray-300 rounded-lg"
                                    />
                                </div>
                                <div>
                                    <label className="block mb-1">City</label>
                                    <input
                                        type="text"
                                        name="city"
                                        defaultValue={editingAddress?.city || ""}
                                        className="w-full p-3 border border-gray-300 rounded-lg"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block mb-1">State</label>
                                    <input
                                        type="text"
                                        name="state"
                                        defaultValue={editingAddress?.state || ""}
                                        className="w-full p-3 border border-gray-300 rounded-lg"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block mb-1">Zip Code</label>
                                    <input
                                        type="text"
                                        name="zipCode"
                                        defaultValue={editingAddress?.zipCode || ""}
                                        className="w-full p-3 border border-gray-300 rounded-lg"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block mb-1">Country</label>
                                    <input
                                        type="text"
                                        name="country"
                                        defaultValue={editingAddress?.country || ""}
                                        className="w-full p-3 border border-gray-300 rounded-lg"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="my-4">
                                <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    name="isDefault"
                                    defaultChecked={editingAddress?.isDefault || false}
                                    className="mr-2"
                                />
                                    Set as default address
                                </label>
                            </div>

                            <div className="flex justify-end space-x-4">
                                <button
                                    type="button"
                                    onClick={handleCancel}
                                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-all duration-300 cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-primary text-white rounded-lg border-2 border-primary transition-all duration-300 cursor-pointer hover:bg-white hover:text-primary"
                                >
                                    Save
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showDeleteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgb(0 0 0 / 88%)" }}>
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative text-center">
                    
                        {/* Close Icon - red circle in top-right */}
                        <button
                            onClick={() => {
                                setShowDeleteModal(false);
                                setAddressToDelete(null);
                            }}
                            className="absolute top-4 right-4 bg-red-100 text-red-600 rounded-full p-2 hover:bg-red-200 transition cursor-pointer"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        </button>


                        {/* Title */}
                        <h2 className="text-xl font-semibold mb-2 text-gray-800">
                            Confirm Deletion
                        </h2>

                        {/* Message */}
                        <p className="text-gray-600 mb-6">
                            Are you sure you want to delete this address? This action cannot be undone.
                        </p>

                        {/* Buttons */}
                        <div className="flex justify-center space-x-4">
                            <button
                                onClick={() => {
                                    setShowDeleteModal(false);
                                    setAddressToDelete(null);
                                }}
                                className="px-5 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmDelete}
                                className="px-5 py-2 rounded-lg bg-red-500 text-white border border-red-500 hover:bg-white hover:text-red-500 transition"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default AddressesPage;

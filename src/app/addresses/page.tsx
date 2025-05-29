"use client";

import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { apiBaseUrl } from '@/config';
import NoAddressFound from '@/components/home/addresses-empty';

interface Address {
    id: string;
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

interface AddressResponse {
    id?: string;
    name?: string;
    country_code?: string;
    phone_no?: string;
    address_line_1?: string;
    address_line_2?: string;
    landmark?: string;
    city?: string;
    state?: string;
    zip_code?: string;
    country?: string;
    is_default?: boolean;
    type?: string;
    message?: string;
    errors?: Record<string, string[]>;
}

const AddressesPage = () => {
    const [addresses, setAddresses] = useState<Address[]>([]);

    const [showForm, setShowForm] = useState<boolean>(false);
    const [editingAddress, setEditingAddress] = useState<Address | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [addressToDelete, setAddressToDelete] = useState<Address | null>(null);
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const [formData, setFormData] = useState<Address>({
        id: '',
        name: '',
        country_code: '',
        phone_no: '',
        address_line_1: '',
        address_line_2: '',
        landmark: '',
        city: '',
        state: '',
        zip_code: '',
        country: '',
        is_default: false,
        type: '',
    });

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

            setAddresses(data.data);
        } catch (err) {
            toast.error("Failed to fetch addresses.");
        }
    };

    const handleAddAddress = () => {
        setShowForm(true);
        setEditingAddress(null);
        setFormData({
            id: '',
            name: '',
            country_code: '',
            phone_no: '',
            address_line_1: '',
            address_line_2: '',
            landmark: '',
            city: '',
            state: '',
            zip_code: '',
            country: '',
            is_default: false,
            type: '',
        });
        setFormErrors({});
        document.body.style.overflow = "hidden";
    };

    const handleEditAddress = (address: Address) => {
        setShowForm(true);
        setEditingAddress(address);
        setFormData(address);
        setFormErrors({});
        document.body.style.overflow = "hidden";
    };

    const validateAddress = (address: Address) => {
        const errors: Record<string, string> = {};
        if (!address.name.trim()) errors.name = "Please enter name.";
        if (!address.country_code.trim()) errors.country_code = "Please select a country code.";
        if (!address.phone_no.trim()) errors.phone_no = "Please enter phone no.";
        if (!address.address_line_1.trim()) errors.address_line_1 = "Please enter address line 1.";
        if (!address.address_line_2.trim()) errors.address_line_2 = "Please enter address line 2.";
        if (!address.landmark.trim()) errors.landmark = "Please enter landmark.";
        if (!address.city.trim()) errors.city = "Please enter city name.";
        if (!address.state.trim()) errors.state = "Please enter state name.";
        if (!address.zip_code.trim()) {
            errors.zip_code = "Please enter zip-code.";
        } else if (!/^[0-9]{5,6}$/.test(address.zip_code.trim())) {
            errors.zip_code = "This zip-code is invalid.";
        }
        if (!address.country.trim()) errors.country = "Please enter country name.";
        if (!address.type.trim()) errors.type = "Please enter address type.";
        return errors;
    };

    const handleSaveAddress = async (address: Address) => {
        const errors = validateAddress(address);
        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            toast.error("Please correct the errors in the form.");
            return;
        }

        const token = localStorage.getItem("authToken");
        if (!token) {
            toast.error("You are not logged in.");
            return;
        }

        const payload = {
            name: address.name,
            country_code: address.country_code,
            phone_no: address.phone_no,
            address_line_1: address.address_line_1,
            address_line_2: address.address_line_2,
            landmark: address.landmark,
            city: address.city,
            state: address.state,
            zip_code: address.zip_code,
            country: address.country,
            is_default: address.is_default,
            type: address.type,
        };

        try {
            let response: Response;
            let result: AddressResponse;

            if (editingAddress) {
                response = await fetch(`${apiBaseUrl}customer-addresses/update/${editingAddress.id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                    body: JSON.stringify(payload),
                });
                result = await response.json();

                if (!response.ok) {
                    throw new Error(result.message || "Failed to update address.");
                }

                toast.success("Address updated successfully!");
                fetchAddresses();
            } else {
                response = await fetch(`${apiBaseUrl}customer-addresses/add`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                    body: JSON.stringify(payload),
                });
                result = await response.json();

                if (response.status === 422 && result.errors) {
                    const errorMessages = Object.values(result.errors).flat().join(', ');
                    toast.error(`Validation Error: ${errorMessages}`);
                    return;
                }

                if (!response.ok) {
                    throw new Error(result.message || "Failed to add address.");
                }

                toast.success("Address added successfully!");
                fetchAddresses();
            }

            setShowForm(false);
            document.body.style.overflow = "";
        } catch (error) {
            console.error(error);
            if (error instanceof Error) {
                toast.error(error.message);
            } else {
                toast.error("Something went wrong while saving the address.");
            }
        }
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

    const handleConfirmDelete = async () => {
        if (addressToDelete) {
          try {
            const token = localStorage.getItem("authToken");
            await fetch(`${apiBaseUrl}customer-addresses/delete/${addressToDelete.id}`, {
              method: 'DELETE',
              headers: { Authorization: `Bearer ${token}` },
            });
            toast.success("Address deleted successfully!");
            fetchAddresses();
          } catch (error) {
            toast.error("Failed to delete address.");
          }
          setShowDeleteModal(false);
          setAddressToDelete(null);
        }
    };
  
    useEffect(() => {
        if (editingAddress) {
            setFormData({
                id: editingAddress.id || '',
                name: editingAddress.name || '',
                country_code: editingAddress.country_code || '',
                phone_no: editingAddress.phone_no || '',
                address_line_1: editingAddress.address_line_1 || '',
                address_line_2: editingAddress.address_line_2 || '',
                landmark: editingAddress.landmark || '',
                city: editingAddress.city || '',
                state: editingAddress.state || '',
                zip_code: editingAddress.zip_code || '',
                country: editingAddress.country || '',
                is_default: editingAddress.is_default || false,
                type: editingAddress.type || '',
            });
        }
    }, [editingAddress]);
    
    return (
        <div className="min-h-[70vh] px-4 py-8">
            <h1 className="text-2xl font-bold mb-6">My Addresses</h1>

            <button
                onClick={handleAddAddress}
                className="px-4 py-2 bg-primary text-white rounded-lg mb-6 transition-all duration-300 hover:bg-white hover:border-primary hover:text-primary hover:cursor-pointer border-2"
            >
                Add New Address
            </button>

            {addresses.length > 0 ? (<>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {addresses.map((address) => (
                        <div key={address.id} className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 flex flex-col justify-between h-full">
                            <div>
                                <h3 className="text-lg font-semibold">{address.name} - {address.type}</h3>
                                <p>
                                    {address.country_code} - {address.phone_no},
                                    {address.address_line_1}
                                    {address.address_line_2 && `, ${address.address_line_2}`},{" "}
                                    {address.landmark},
                                    {address.city}, {address.state} {address.zip_code},{" "}
                                    {address.country}
                                </p>
                                {address.is_default && (
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
            </>) : (<NoAddressFound />)}


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
                                    country_code: formData.get("country_code") as string,
                                    phone_no: formData.get("phone_no") as string,
                                    address_line_1: formData.get("address_line_1") as string,
                                    address_line_2: formData.get("address_line_2") as string,
                                    landmark: formData.get("landmark") as string,
                                    city: formData.get("city") as string,
                                    state: formData.get("state") as string,
                                    zip_code: formData.get("zip_code") as string,
                                    country: formData.get("country") as string,
                                    is_default: formData.get("is_default") === "on",
                                    type: formData.get("type") as string,
                                };
                                localStorage.setItem("selectedAddressId", newAddress.id);
                                handleSaveAddress(newAddress);
                            }}
                            >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block mb-1">Name <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        name="name"
                                        defaultValue={editingAddress?.name || ""}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            setFormData(prev => ({ ...prev, name: value }));
                                    
                                            // Clear error on input
                                            if (formErrors.name && value.trim()) {
                                                setFormErrors(prev => {
                                                    const { name, ...rest } = prev;
                                                    return rest;
                                                });
                                            }
                                        }}
                                        className="w-full p-3 border border-gray-300 rounded-lg"
                                    />
                                    {formErrors.name && <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>}
                                </div>
                                <div>
                                    <label className="block mb-1">
                                        Phone Number <span className="text-red-500">*</span>
                                    </label>
                                    <div className="flex gap-2">
                                        <select
                                            name="country_code"
                                            defaultValue={editingAddress?.country_code || "+91"}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                setFormData(prev => ({ ...prev, country_code: value }));

                                                if (formErrors.country_code && value.trim()) {
                                                    setFormErrors(prev => {
                                                        const { country_code, ...rest } = prev;
                                                        return rest;
                                                    });
                                                }
                                            }}
                                            className="w-24 p-2 border border-gray-300 rounded-lg"
                                        >
                                            <option value="+91">+91 (IN)</option>
                                            <option value="+1">+1 (US)</option>
                                            <option value="+44">+44 (UK)</option>
                                            <option value="+61">+61 (AU)</option>
                                            <option value="+971">+971 (UAE)</option>
                                        </select>
                                        <input
                                            type="text"
                                            name="phone_no"
                                            defaultValue={editingAddress?.phone_no || ""}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                setFormData(prev => ({ ...prev, phone_no: value }));

                                                if (formErrors.phone_no && value.trim()) {
                                                    setFormErrors(prev => {
                                                        const { phone_no, ...rest } = prev;
                                                        return rest;
                                                    });
                                                }
                                            }}
                                            className="flex-1 p-3 border border-gray-300 rounded-lg"
                                            placeholder="Enter phone number"
                                        />
                                    </div>
                                    {formErrors.phone_no && <p className="text-red-500 text-sm mt-1">{formErrors.phone_no}</p>}
                                </div>

                                <div>
                                    <label className="block mb-1">Address Line 1 <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        name="address_line_1"
                                        defaultValue={editingAddress?.address_line_1 || ""}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            setFormData(prev => ({ ...prev, address_line_1: value }));
                                    
                                            // Clear error on input
                                            if (formErrors.address_line_1 && value.trim()) {
                                                setFormErrors(prev => {
                                                    const { address_line_1, ...rest } = prev;
                                                    return rest;
                                                });
                                            }
                                        }}
                                        className="w-full p-3 border border-gray-300 rounded-lg"
                                    />
                                    {formErrors.address_line_1 && <p className="text-red-500 text-sm mt-1">{formErrors.address_line_1}</p>}
                                </div>
                                <div>
                                    <label className="block mb-1">Address Line 2 <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        name="address_line_2"
                                        defaultValue={editingAddress?.address_line_2 || ""}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            setFormData(prev => ({ ...prev, address_line_2: value }));
                                    
                                            // Clear error on input
                                            if (formErrors.address_line_2 && value.trim()) {
                                                setFormErrors(prev => {
                                                    const { address_line_2, ...rest } = prev;
                                                    return rest;
                                                });
                                            }
                                        }}
                                        className="w-full p-3 border border-gray-300 rounded-lg"
                                    />
                                    {formErrors.address_line_2 && <p className="text-red-500 text-sm mt-1">{formErrors.address_line_2}</p>}
                                </div>
                                <div>
                                    <label className="block mb-1">Landmark <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        name="landmark"
                                        defaultValue={editingAddress?.landmark || ""}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            setFormData(prev => ({ ...prev, landmark: value }));
                                    
                                            // Clear error on input
                                            if (formErrors.landmark && value.trim()) {
                                                setFormErrors(prev => {
                                                    const { landmark, ...rest } = prev;
                                                    return rest;
                                                });
                                            }
                                        }}
                                        className="w-full p-3 border border-gray-300 rounded-lg"
                                    />
                                    {formErrors.landmark && <p className="text-red-500 text-sm mt-1">{formErrors.landmark}</p>}
                                </div>
                                <div>
                                    <label className="block mb-1">City <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        name="city"
                                        defaultValue={editingAddress?.city || ""}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            setFormData(prev => ({ ...prev, city: value }));
                                    
                                            // Clear error on input
                                            if (formErrors.city && value.trim()) {
                                                setFormErrors(prev => {
                                                    const { city, ...rest } = prev;
                                                    return rest;
                                                });
                                            }
                                        }}
                                        className="w-full p-3 border border-gray-300 rounded-lg"
                                    />
                                    {formErrors.city && <p className="text-red-500 text-sm mt-1">{formErrors.city}</p>}
                                </div>
                                <div>
                                    <label className="block mb-1">State <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        name="state"
                                        defaultValue={editingAddress?.state || ""}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            setFormData(prev => ({ ...prev, state: value }));
                                    
                                            // Clear error on input
                                            if (formErrors.state && value.trim()) {
                                                setFormErrors(prev => {
                                                    const { state, ...rest } = prev;
                                                    return rest;
                                                });
                                            }
                                        }}
                                        className="w-full p-3 border border-gray-300 rounded-lg"
                                    />
                                    {formErrors.state && <p className="text-red-500 text-sm mt-1">{formErrors.state}</p>}
                                </div>
                                <div>
                                    <label className="block mb-1">Zip Code <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        name="zip_code"
                                        defaultValue={editingAddress?.zip_code || ""}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            setFormData(prev => ({ ...prev, zip_code: value }));
                                    
                                            // Clear error on input
                                            if (formErrors.zip_code && value.trim()) {
                                                setFormErrors(prev => {
                                                    const { zip_code, ...rest } = prev;
                                                    return rest;
                                                });
                                            }
                                        }}
                                        className="w-full p-3 border border-gray-300 rounded-lg"
                                    />
                                    {formErrors.zip_code && <p className="text-red-500 text-sm mt-1">{formErrors.zip_code}</p>}
                                </div>
                                <div>
                                    <label className="block mb-1">Country <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        name="country"
                                        defaultValue={editingAddress?.country || ""}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            setFormData(prev => ({ ...prev, country: value }));
                                    
                                            // Clear error on input
                                            if (formErrors.country && value.trim()) {
                                                setFormErrors(prev => {
                                                    const { country, ...rest } = prev;
                                                    return rest;
                                                });
                                            }
                                        }}
                                        className="w-full p-3 border border-gray-300 rounded-lg"
                                    />
                                    {formErrors.country && <p className="text-red-500 text-sm mt-1">{formErrors.country}</p>}
                                </div>
                                <div>
                                    <label className="block mb-1">Address Type <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        name="type"
                                        defaultValue={editingAddress?.type || ""}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            setFormData(prev => ({ ...prev, type: value }));
                                    
                                            // Clear error on input
                                            if (formErrors.type && value.trim()) {
                                                setFormErrors(prev => {
                                                    const { type, ...rest } = prev;
                                                    return rest;
                                                });
                                            }
                                        }}
                                        className="w-full p-3 border border-gray-300 rounded-lg"
                                    />
                                    {formErrors.type && <p className="text-red-500 text-sm mt-1">{formErrors.type}</p>}
                                </div>
                            </div>

                            <div className="my-4">
                                <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    name="is_default"
                                    defaultChecked={editingAddress?.is_default || false}
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

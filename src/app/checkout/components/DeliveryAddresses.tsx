"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { toast } from "react-toastify";
import { apiBaseUrl } from "@/config";
import axios from "axios";

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

interface Country {
  id: number;
  name: string;
}

interface StateData {
  id: number;
  name: string;
}

const DeliveryAddresses = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<number | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [formData, setFormData] = useState<Partial<Address>>({
    country_code: "+1",
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [countries, setCountries] = useState<Country[]>([]);
  const [states, setStates] = useState<StateData[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    setIsLoggedIn(!!token);
    fetchCountries();
    loadAddresses();
  }, []);

  useEffect(() => {
    if (formData.country) {
      const selectedCountry = countries.find(
        (c) => c.name === formData.country
      );
      if (selectedCountry) {
        fetchStates(selectedCountry.id);
      }
    }
  }, [formData.country]);

  const loadAddresses = async () => {
    const token = localStorage.getItem("authToken");
    if (token) {
      await fetchAddresses(token);
    } else {
      // For guest users, try to fetch by phone number if available
      const guestPhone = localStorage.getItem("guestPhone");
      if (guestPhone) {
        await fetchAddressesByPhone(guestPhone);
      } else {
        setShowAddressForm(true);
      }
    }
  };

  const fetchCountries = async () => {
    try {
      const { data } = await axios.get(`${apiBaseUrl}countries`);
      setCountries(data);
    } catch {
      toast.error("Failed to fetch countries.");
    }
  };

  const fetchStates = async (countryId: number) => {
    try {
      const { data } = await axios.get(`${apiBaseUrl}states/${countryId}`);
      setStates(data);
    } catch {
      toast.error("Failed to fetch states.");
    }
  };

  const fetchAddresses = async (token: string) => {
    try {
      var userData = JSON.parse(localStorage.userDetails);
      setIsLoading(true);
      const { data } = await axios.get(`${apiBaseUrl}customer-addresses/`+userData.id, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAddresses(data.data || []);
      updateSelectedAddress(data.data || []);
    } catch {
      toast.error("Failed to fetch addresses.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAddressesByPhone = async (phone: string) => {
    try {
      setIsLoading(true);
      const { data } = await axios.get(`${apiBaseUrl}customer-addresses`, {
        params: { phone_no: phone }
      });

      setAddresses(data.data || []);
      updateSelectedAddress(data.data || []);
      
      if (data.data?.length === 0) {
        setShowAddressForm(true);
      }
    } catch {
      toast.error("Failed to fetch addresses by phone.");
    } finally {
      setIsLoading(false);
    }
  };

  const updateSelectedAddress = (addressList: Address[]) => {
    const storedId = localStorage.getItem("selectedAddressId");
    const defaultAddress = addressList.find((a) => a.is_default);

    setSelectedAddress(
      storedId ? parseInt(storedId) : defaultAddress?.id || null
    );
  };

  const validateAddress = (address: Partial<Address>) => {
    const errors: Record<string, string> = {};
    const getTrimmed = (value?: string | number | null) =>
      typeof value === "string" ? value.trim() : value?.toString().trim() || "";

    if (!getTrimmed(address.name)) errors.name = "Please enter name.";
    if (!getTrimmed(address.country_code))
      errors.country_code = "Please select a country code.";
    if (!getTrimmed(address.phone_no))
      errors.phone_no = "Please enter phone no.";
    if (!getTrimmed(address.address_line_1))
      errors.address_line_1 = "Please enter address line 1.";
    if (!getTrimmed(address.address_line_2))
      errors.address_line_2 = "Please enter address line 2.";
    if (!getTrimmed(address.landmark))
      errors.landmark = "Please enter landmark.";
    if (!getTrimmed(address.city)) errors.city = "Please enter city name.";
    if (!getTrimmed(address.state)) errors.state = "Please enter state name.";

    const zip = getTrimmed(address.zip_code);
    if (!zip) {
      errors.zip_code = "Please enter zip-code.";
    } else if (!/^[0-9]{5,6}$/.test(zip)) {
      errors.zip_code = "This zip-code is invalid.";
    }

    if (!getTrimmed(address.country))
      errors.country = "Please enter country name.";
    if (!getTrimmed(address.type)) errors.type = "Please enter address type.";

    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const errors = validateAddress(formData);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      toast.error("Please correct the errors in the form.");
      return;
    }
    var userData = {};
    try {
      const userDetails = localStorage.getItem("userDetails");
      userData = userDetails ? JSON.parse(userDetails) : {};
    } catch (e) {
      console.error("Invalid JSON in userDetails:", e);
      userData = {};
    }

    var user_id = userData?.id ?? 0;
    const token = localStorage.getItem("authToken");
    const phoneNo = formData.phone_no;
    const payload = {
      name: formData.name,
      country_code: formData.country_code || "+1",
      phone_no: phoneNo,
      address_line_1: formData.address_line_1,
      address_line_2: formData.address_line_2,
      landmark: formData.landmark,
      city: formData.city,
      state: formData.state,
      zip_code: formData.zip_code,
      country: formData.country,
      type: formData.type,
      is_default: false,
      user_id : user_id
    };

    try {
      setIsLoading(true);
      let response;

      if (token) {
        // For logged-in users
        response = await axios.post(
          `${apiBaseUrl}customer-addresses/add`,
          payload,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
      } else {
        // For guest users
        response = await axios.post(
          `${apiBaseUrl}customer-addresses/add`,
          payload,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        
        // Store guest phone for future reference
        if (phoneNo) {
          localStorage.setItem("guestPhone", phoneNo);
        }
      }

      toast.success("Address added successfully.");
      setFormData({});
      setFormErrors({});
      setShowAddressForm(false);
      
      // Reload addresses
      if (token) {
        await fetchAddresses(token);
      } else if (phoneNo) {
        await fetchAddressesByPhone(phoneNo);
      }
    } catch (error: any) {
      const errData = error.response?.data;
      if (errData?.errors) {
        const errorMessages = Object.values(errData.errors).flat().join(", ");
        toast.error(`Validation error: ${errorMessages}`);
      } else {
        toast.error(errData?.message || "Failed to submit address.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectAddress = (id: number) => {
      setSelectedAddress(id);
      localStorage.setItem("selectedAddressId", id.toString());
      // Notify parent component of selection
      if (typeof window !== 'undefined' && window.parent) {
          window.parent.postMessage({
              type: 'addressSelected',
              addressId: id.toString()
          }, '*');
      }
  };

  const updateForm = (field: keyof Address, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      const { [field]: _, ...rest } = formErrors;
      setFormErrors(rest);
    }
  };

  const renderFormFields = () => {
    const fieldsBeforeCountryState = [
      { name: "name", label: "Name", required: true },
      { name: "phone_no", label: "Phone Number", isPhone: true, required: true },
      { name: "address_line_1", label: "Address Line 1", required: true },
      { name: "address_line_2", label: "Address Line 2", required: true },
      { name: "landmark", label: "Landmark", required: true },
      { name: "city", label: "City", required: true },
    ];

    const fieldsAfterCountryState = [
      { name: "zip_code", label: "Zip Code", required: true },
      { name: "type", label: "Address Type", required: true },
    ];

    return (
      <>
        {fieldsBeforeCountryState.map((field) => {
          if (field.isPhone) {
            return (
              <div key="phone_no">
                <label className="block mb-1">
                  {field.label} <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <select
                    name="country_code"
                    value={formData.country_code || "+1"}
                    onChange={(e) => updateForm("country_code", e.target.value)}
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
                    value={formData.phone_no || ""}
                    onChange={(e) => updateForm("phone_no", e.target.value)}
                    className="flex-1 p-3 border border-gray-300 rounded-lg"
                    placeholder="Enter phone number"
                  />
                </div>
                {formErrors.phone_no && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.phone_no}</p>
                )}
                {formErrors.country_code && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.country_code}</p>
                )}
              </div>
            );
          }

          return (
            <div key={field.name}>
              <label className="block mb-1">
                {field.label}{" "}
                {field.required && <span className="text-red-500">*</span>}
              </label>
              <input
                type="text"
                name={field.name}
                value={formData[field.name as keyof Address] || ""}
                onChange={(e) =>
                  updateForm(field.name as keyof Address, e.target.value)
                }
                className="w-full p-3 border border-gray-300 rounded-lg"
              />
              {formErrors[field.name] && (
                <p className="text-red-500 text-sm mt-1">{formErrors[field.name]}</p>
              )}
            </div>
          );
        })}

        <div>
          <label className="block mb-1">
            Country <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.country || ""}
            onChange={(e) => updateForm("country", e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg"
          >
            <option value="">Select Country</option>
            {countries.map((country) => (
              <option key={country.id} value={country.name}>
                {country.name}
              </option>
            ))}
          </select>
          {formErrors.country && (
            <p className="text-red-500 text-sm mt-1">{formErrors.country}</p>
          )}
        </div>

        <div>
          <label className="block mb-1">
            State <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.state || ""}
            onChange={(e) => updateForm("state", e.target.value)}
            disabled={states.length === 0}
            className={`w-full p-3 border rounded-lg ${
              states.length === 0
                ? "bg-gray-100 cursor-not-allowed"
                : "border-gray-300"
            }`}
          >
            <option value="">
              {states.length === 0 ? "Select country first" : "Select State"}
            </option>
            {states.map((state) => (
              <option key={state.id} value={state.name}>
                {state.name}
              </option>
            ))}
          </select>
          {formErrors.state && (
            <p className="text-red-500 text-sm mt-1">{formErrors.state}</p>
          )}
        </div>

        {fieldsAfterCountryState.map((field) => (
          <div key={field.name}>
            <label className="block mb-1">
              {field.label}{" "}
              {field.required && <span className="text-red-500">*</span>}
            </label>
            <input
              type="text"
              name={field.name}
              value={formData[field.name as keyof Address] || ""}
              onChange={(e) =>
                updateForm(field.name as keyof Address, e.target.value)
              }
              className="w-full p-3 border border-gray-300 rounded-lg"
            />
            {formErrors[field.name] && (
              <p className="text-red-500 text-sm mt-1">{formErrors[field.name]}</p>
            )}
          </div>
        ))}
      </>
    );
  };

  if (isLoading) {
    return (
      <div className="border p-4 rounded-md shadow-sm bg-gray-100">
        <h2 className="text-xl font-semibold border-b pb-2">Delivery Address</h2>
        <div className="flex justify-center items-center h-40">
          <p>Loading addresses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="border p-4 rounded-md shadow-sm bg-gray-100">
      <h2 className="text-xl font-semibold border-b pb-2">Delivery Address</h2>

      {addresses.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-4">
          {addresses.map((address) => (
            <label
              key={address.id}
              className="w-full md:w-[48%] cursor-pointer transition-all"
            >
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
                      <span className="font-semibold text-base">
                        {address.name}
                      </span>
                      <span className="px-3 py-1 text-white text-xs font-semibold bg-primary rounded-full">
                        {address.type}
                      </span>
                    </div>
                    <div className="mt-1 space-y-0.5">
                      <p className="text-sm text-gray-700">
                        {address.address_line_1}
                        {address.address_line_2 && `, ${address.address_line_2}`}
                        , {address.landmark}, {address.city}, {address.state}{" "}
                        {address.zip_code}, {address.country}
                      </p>
                      <p className="text-sm text-gray-600">
                        <strong>Pin Code:</strong> {address.zip_code}
                      </p>
                      <p className="text-sm text-gray-600">
                        <strong>Phone:</strong> {address.country_code} -{" "}
                        {address.phone_no}
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            </label>
          ))}
        </div>
      )}

      <div className="mt-6">
        <button
          onClick={() => setShowAddressForm(!showAddressForm)}
          className="text-primary underline hover:text-primary/80 font-medium"
        >
          {showAddressForm ? "Hide Address Form" : "Add New Address"}
        </button>
        {showAddressForm && (
          <form onSubmit={handleSubmit}>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderFormFields()}
            </div>
            <div className="mt-4">
              <button
                type="submit"
                className="bg-primary text-white px-6 py-2 rounded-md hover:bg-primary/90"
                disabled={isLoading}
              >
                {isLoading ? "Saving..." : "Save Address"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default DeliveryAddresses;
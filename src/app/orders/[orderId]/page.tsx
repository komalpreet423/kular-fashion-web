"use client";

import ProductPrice from "@/components/product/ProductPrice";
import { useParams } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { apiBaseUrl, apiBaseRoot } from "@/config";
import axios from "axios";

interface Product {
  productName: string;
  quantity: number;
  price: number;
  imageUrl: string;
}

interface OrderDetails {
  id: string;
  orderDate: string;
  orderStatus:
  | "placed"
  | "packed"
  | "shipped"
  | "out-for-delivery"
  | "delivered"
  | "cancelled";
  deliveredOn?: string;
  expectedDelivery?: string;
  items: Product[];
  billing: {
    subtotal: number;
    tax: number;
    shipping: number;
    discount: number;
    total: number;
  };
  trackingDates: Record<string, string>;
  paymentMode: string;
  paymentDetails: string;
  addresses: {
    packedFrom: string;
    shippedFrom: string;
    deliveryAddress: string;
  };
}

const statusSteps = [
  "placed",
  "packed",
  "shipped",
  "out-for-delivery",
  "delivered",
];

const OrderDetailsPage: React.FC = () => {
  const { orderId } = useParams();
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const router = useRouter();
  const toastShownRef = useRef(false);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      router.replace("/");
    }
  }, []);

  useEffect(() => {
    if (orderId) {
      const fetchOrderDetails = async () => {
        try {
          const token = localStorage.getItem("authToken");
          if (!token) {
            if (!toastShownRef.current) {
              toastShownRef.current = true;
              toast.success("Order placed! Check your email for the details.");
            }
            router.replace("/");
            return;
          }

          const response = await axios.get(
            `${apiBaseUrl}order/show/${orderId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          const result = response.data;
          console.log(result);

          if (!result.success || !result.data || result.data.length === 0) {
            toast.error("Order not found");
            return;
          }

          const order = result.data[0];

          const mappedOrder: OrderDetails = {
            id: order.unique_order_id,
            orderDate: order.placed_at?.split(" ")[0] || "",
            orderStatus: order.status,
            deliveredOn: order.delivered_at?.split(" ")[0] || "",
            expectedDelivery: "",
            items: order.order_items.map((item: any) => ({
              productName: item.product.name,
              quantity: item.quantity,
              price: parseFloat(item.price),
              imageUrl: item.product.web_image?.[0]?.path
                ? `${apiBaseRoot}${item.product.web_image[0].path}`
                : "/images/default-product.png",

            })),
            billing: {
              subtotal: parseFloat(order.subtotal),
              tax: parseFloat(order.tax),
              shipping: parseFloat(order.shipping_charge),
              discount: parseFloat(order.discount),
              total: parseFloat(order.total),
            },
            trackingDates: {
              placed: order.placed_at?.split(" ")[0] || "",
              packed: "",
              shipped: order.shipped_at?.split(" ")[0] || "",
              "out-for-delivery": "",
              delivered: order.delivered_at?.split(" ")[0] || "",
            },
            paymentMode: order.payment_type || "N/A",
            paymentDetails: order.transaction_id
              ? `Transaction ID: ${order.transaction_id}`
              : "No payment details available",
            addresses: {
              packedFrom: "Warehouse Address (static)",
              shippedFrom: "Shipping Hub Address (static)",
              deliveryAddress: order.customer_address_id
                ? `Address ID: ${order.customer_address_id}`
                : "No address available",
            },
          };

          setOrderDetails(mappedOrder);
        } catch (error) {
          toast.error("Error fetching order details.");
        }
      };

      fetchOrderDetails();
    }
  }, [orderId]);

  if (!orderDetails) {
    return <p className="px-4 py-8">No Orders Found </p>;
  }

  const itemCount = orderDetails.items.reduce(
    (count, item) => count + item.quantity,
    0
  );

  const currentStepIndex = statusSteps.indexOf(orderDetails.orderStatus);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Order Details</h1>

      <div className="bg-white shadow-md rounded-xl p-6 mb-6 space-y-6">
        {/* Top Info */}
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div>
            <h2 className="text-lg font-semibold">
              Order ID: {orderDetails.id}
            </h2>
            <p className="text-gray-500">Placed on: {orderDetails.orderDate}</p>
            <p className="text-gray-500">
              {orderDetails.orderStatus === "delivered"
                ? `Delivered on: ${orderDetails.deliveredOn}`
                : `Expected delivery: ${orderDetails.expectedDelivery}`}
            </p>
          </div>
          <div
            className={`px-3 py-1 rounded-full font-semibold text-sm ${orderDetails.orderStatus === "cancelled"
              ? "bg-red-100 text-red-600"
              : "bg-blue-100 text-blue-600"
              }`}
          >



            {orderDetails.orderStatus.replace(/-/g, " ").toUpperCase()}
          </div>
        </div>

        {/* Product List */}
        {/* Product List */}
        <div className="border-t pt-2">
          <h3 className="text-lg font-semibold mb-3">Products ({itemCount})</h3>

          <div
            className={`gap-3 ${orderDetails.items.length <= 2
              ? "flex justify-start"
              : "grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))]"
              }`}
          >
            {orderDetails.items.map((item, idx) => (
              <div
                key={idx}
                className={`border rounded-lg p-2 shadow-sm hover:shadow transition text-center ${orderDetails.items.length <= 2 ? "w-[300px]" : ""
                  }`}
              >
                <img
                  src={item.imageUrl}
                  alt={item.productName}
                  className="w-20 h-20 object-cover rounded mx-auto"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "/images/default-product.png";
                  }}
                />
                <div className="mt-2">
                  <p className="font-medium">{item.productName}</p>
                  <p className="text-sm text-gray-500">
                    Quantity: {item.quantity}
                  </p>
                  <p className="text-sm font-semibold">
                    <ProductPrice basePrice={item.quantity * item.price} />
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Info */}
        <div className="border-t pt-4">
          <h3 className="text-lg font-semibold mb-3">Payment Details</h3>
          <p>
            <strong>Mode:</strong> {orderDetails.paymentMode}
          </p>
          <p className="text-sm text-gray-600">{orderDetails.paymentDetails}</p>
        </div>

        {/* Addresses */}
        <div className="border-t pt-4 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h4 className="font-semibold text-gray-800 mb-1">Packed From</h4>
            <p className="text-sm text-gray-600">
              {orderDetails.addresses.packedFrom}
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-800 mb-1">Shipped From</h4>
            <p className="text-sm text-gray-600">
              {orderDetails.addresses.shippedFrom}
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-800 mb-1">
              Delivery Address
            </h4>
            <p className="text-sm text-gray-600">
              {orderDetails.addresses.deliveryAddress}
            </p>
          </div>
        </div>

        {/* Billing Summary */}
        <div className="border-t pt-4">
          <h3 className="text-lg font-semibold mb-3">Billing Summary</h3>
          <div className="text-gray-700 space-y-1">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <ProductPrice basePrice={orderDetails.billing.subtotal} />
            </div>
            <div className="flex justify-between">
              <span>Tax</span>
              <ProductPrice basePrice={orderDetails.billing.tax} />
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <ProductPrice basePrice={orderDetails.billing.shipping} />
            </div>
            {orderDetails.billing.discount > 0 && (
              <div className="flex justify-between text-green-500">
                <span>Discount</span>
                <ProductPrice basePrice={-orderDetails.billing.discount} />
              </div>
            )}
            <div className="flex justify-between font-semibold border-t pt-2">
              <span>Total</span>
              <ProductPrice basePrice={orderDetails.billing.total} />
            </div>
          </div>
        </div>
        {/* Order Tracking Tree */}
        {/* Order Tracking Tree - Enhanced */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold mb-4">Order Tracking</h3>
          <div className="relative flex justify-between w-full px-4">
            {statusSteps.map((step, idx) => {
              const isCompleted = idx === 0;
              const isLast = idx === statusSteps.length - 1;

              return (
                <div
                  key={step}
                  className="relative flex flex-col items-center flex-1"
                >
                  {/* Connector Line to the next step */}
                  {!isLast && (
                    <div
                      className={`absolute top-2.5 left-1/2 h-0.5 w-full ${idx < currentStepIndex ? "bg-green-500" : "bg-gray-300"
                        }`}
                    />
                  )}

                  {/* Step Dot */}
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center z-10 ${isCompleted
                      ? "bg-green-500 border-green-500 text-white"
                      : "bg-white border-gray-300 text-gray-300"
                      }`}
                  >
                    {isCompleted ? (
                      <svg
                        className="w-3 h-3"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    ) : (
                      <div className="w-2 h-2 bg-gray-300 rounded-full" />
                    )}
                  </div>

                  {/* Text Info */}
                  <div className="mt-2 text-center">
                    <p
                      className={`font-medium ${isCompleted ? "text-green-700" : "text-gray-500"
                        }`}
                    >
                      {step.replace(/-/g, " ").toUpperCase()}
                    </p>
                    <p className="text-sm text-gray-500">
                      {orderDetails.trackingDates[step] || "Pending"}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsPage;

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react"; // Make sure you have lucide-react installed

interface Order {
  id: string;
  orderDate: string;
  totalAmount: number;
  status: "Placed" | "In-Process" | "Cancelled" | "Delivered";
  expectedDeliveryDate?: string;
  deliveredOn?: string;
  itemsCount: number;
}

const OrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      router.replace("/");
    }
  }, []);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const fetchedOrders: Order[] = [
          {
            id: "ORD12345",
            orderDate: "2025-04-01",
            totalAmount: 150.0,
            status: "Delivered",
            deliveredOn: "2025-04-05",
            itemsCount: 3,
          },
          {
            id: "ORD12346",
            orderDate: "2025-04-05",
            totalAmount: 200.0,
            status: "In-Process",
            expectedDeliveryDate: "2025-04-15",
            itemsCount: 2,
          },
          {
            id: "ORD12347",
            orderDate: "2025-04-10",
            totalAmount: 50.0,
            status: "Cancelled",
            itemsCount: 1,
          },
        ];
        setOrders(fetchedOrders);
      } catch (error) {
        toast.error("Failed to fetch orders.");
      }
    };

    fetchOrders();
  }, []);

  const filteredOrders = orders.filter((order) => {
    return (
      (statusFilter === "All" || order.status === statusFilter) &&
      order.id.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Delivered":
        return "bg-green-100 text-green-700";
      case "Cancelled":
        return "bg-red-100 text-red-700";
      case "In-Process":
        return "bg-yellow-100 text-yellow-700";
      case "Placed":
      default:
        return "bg-blue-100 text-blue-700";
    }
  };

  return (
    <div className="min-h-[70vh] px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Orders</h1>

        {/* Search input */}
        <div className="flex items-center">
        <input
          type="text"
          placeholder="Search by Order ID"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary w-64"
        />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="mb-6">
        <div className="flex space-x-6">
          {["All", "Placed", "Delivered", "In-Process", "Cancelled"].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-lg font-medium ${
                statusFilter === status
                  ? "bg-primary text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-primary hover:text-white"
              } cursor-pointer transition-all`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {filteredOrders.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOrders.map((order) => (
            <Link href={`/orders/${order.id}`} key={order.id}>
              <div className="bg-white h-full flex flex-col justify-between border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 p-6 cursor-pointer">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold">Order ID: {order.id}</h2>
                  <span className={`px-2 py-1 text-sm rounded ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </div>

                {/* Details */}
                <div className="text-sm text-gray-700 space-y-1">
                  <p>Placed on: <span className="font-medium">{order.orderDate}</span></p>
                  <p>Items: <span className="font-medium">{order.itemsCount}</span></p>

                  {order.status === "Delivered" && order.deliveredOn && (
                    <p>Delivered on: <span className="font-medium">{order.deliveredOn}</span></p>
                  )}

                  {order.status !== "Delivered" && order.expectedDeliveryDate && (
                    <p>Expected Delivery: <span className="font-medium">{order.expectedDeliveryDate}</span></p>
                  )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between mt-6">
                  <p className="text-primary font-bold text-lg">
                    Total: ${order.totalAmount.toFixed(2)}
                  </p>
                  <ArrowRight className="w-5 h-5 text-gray-500" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-center text-xl font-semibold text-gray-500 mt-6">
          Orders List is empty.
        </p>
      )}
    </div>
  );
};

export default OrdersPage;

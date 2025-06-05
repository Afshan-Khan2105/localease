'use client'

import useBasketStore from "@/store/store";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { formatCurrency } from "@/lib/formatCurrency";

interface OrderDetails {
  orderNumber: string;
  date: string;
  amount: number;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
}

function SuccessPage() {
    const searchParams = useSearchParams();
    const clearBasket = useBasketStore((state) => state.clearBasket);
    const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const sessionId = searchParams?.get("session_id");
    const orderNumber = searchParams?.get("orderNumber");

    useEffect(() => {
        async function fetchOrderDetails() {
            if (!sessionId) {
                setIsLoading(false);
                return;
            }

            try {
                setIsLoading(true);
                setError(null);
                const response = await fetch(`/api/get-order-details?session_id=${sessionId}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch order details');
                }
                const data = await response.json();
                setOrderDetails(data);
                clearBasket();
            } catch (error) {
                console.error("Error fetching order details:", error);
                setError('Unable to load order details. Please try again later.');
            } finally {
                setIsLoading(false);
            }
        }
        fetchOrderDetails();
    }, [sessionId, clearBasket]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center p-4">
                <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full text-center">
                    <div className="text-red-500 mb-4">
                        <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-semibold mb-2">Error Loading Order</h2>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <Link href="/" className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                        Return Home
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-3xl mx-auto"
            >
                <div className="bg-white shadow-xl rounded-lg overflow-hidden">
                    {/* Header Section */}
                    <div className="bg-green-500 px-6 py-8 text-white">
                        <div className="flex items-center justify-center mb-4">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ 
                                    type: "spring",
                                    stiffness: 260,
                                    damping: 20 
                                }}
                            >
                                <svg
                                    className="w-16 h-16"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M5 13l4 4L19 7"
                                    />
                                </svg>
                            </motion.div>
                        </div>
                        <h1 className="text-3xl font-bold text-center">Order Confirmed!</h1>
                    </div>

                    {/* Order Details Section */}
                    <div className="px-6 py-8">
                        <div className="space-y-6">
                            <div className="border-b pb-6">
                                <h2 className="text-gray-600 text-sm font-semibold mb-2">ORDER NUMBER</h2>
                                <p className="text-lg font-mono">{orderNumber}</p>
                            </div>

                            {orderDetails && (
                                <>
                                    <div className="border-b pb-6">
                                        <h2 className="text-gray-600 text-sm font-semibold mb-2">ORDER DATE</h2>
                                        <p className="text-lg">
                                            {new Date(orderDetails.date).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </p>
                                    </div>

                                    <div className="border-b pb-6">
                                        <h2 className="text-gray-600 text-sm font-semibold mb-4">ORDER SUMMARY</h2>
                                        <div className="space-y-4">
                                            {orderDetails.items.map((item, index) => (
                                                <div key={index} className="flex justify-between text-sm">
                                                    <span>{item.name} × {item.quantity}</span>
                                                    <span>{formatCurrency(item.price)}</span>
                                                </div>
                                            ))}
                                            <div className="flex justify-between font-bold pt-4 border-t">
                                                <span>Total</span>
                                                <span>{formatCurrency(orderDetails.amount)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Action Buttons */}
                        <div className="mt-8 space-y-4">
                            <Link href="/orders" className="block">
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                                >
                                    View Order Details
                                </motion.button>
                            </Link>
                            <Link href="/" className="block">
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
                                >
                                    Continue Shopping
                                </motion.button>
                            </Link>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

export default SuccessPage;

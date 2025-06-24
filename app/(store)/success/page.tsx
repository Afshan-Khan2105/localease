'use client'
import useBasketStore from "@/store/store";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import React, { useEffect, useState } from "react";

function SuccessPage() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams?.get("orderNumber");
  const sessionId = searchParams?.get("session_id");
  const clearBasket = useBasketStore((state) => state.clearBasket);

  const [highlight, setHighlight] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setHighlight(true), 500); // 400ms delay
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Clear the basket after successful order
    if (orderNumber) {
      clearBasket();
    }
  }, [orderNumber, clearBasket]);
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
          <div
            className={`px-6 py-8 text-zinc-800 transition-colors duration-1000 ${
              highlight ? "bg-green-400" : ""
            }`}
          >
            <div className="flex items-center justify-center mb-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 260,
                  damping: 20,
                }}
              >
                <svg
                  className="w-16 h-16 p-2 bg-green-200 text-green-500 rounded-full transition-all duration-700"
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
                <h2 className="text-gray-600 text-sm font-semibold mb-2">
                  ORDER NUMBER :{" "}
                  <span className=" text-green-500 sm:text-lg font-mono animate-pulse">
                    {orderNumber}
                  </span>
                </h2>
              </div>
              <div className="border-b pb-6">
                <h2 className="text-gray-600 text-sm font-semibold mb-2">
                  SESSION ID
                </h2>
                <p className="text-xs break-all">{sessionId}</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 space-y-4">
              <Link href="/orders" className="block">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-zinc-800 text-white py-3 px-4 rounded-lg font-semibold hover:bg-zinc-900 transition-colors"
                >
                  View Order Details
                </motion.button>
              </Link>
              <Link href="/" className="block">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-green-300 text-gray-900 py-3 px-4 rounded-lg font-semibold hover:bg-green-400 transition-colors"
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

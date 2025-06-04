"use client";
import { useEffect, useRef, useState } from "react";
import { getAllSalesClient } from "@/sanity/lib/sales/getAllSalesClient";
import Image from "next/image";

type Sale = {
  _id: string;
  title: string;
  description: string;
  discountAmount: number;
  couponCode: string;
  backgroundImage?: { asset?: { url?: string } };
};

export default function SaleBanner() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [current, setCurrent] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    getAllSalesClient().then(setSales);
  }, []);

  // Auto-slide every 5 seconds
  useEffect(() => {
    if (sales.length < 2) return;
    timerRef.current = setInterval(() => {
      setCurrent((prev) => (prev + 1) % sales.length);
    }, 5000);
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [sales]);

  if (!sales.length) return null;

  const sale = sales[current];

  // Touch handlers for swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = e.changedTouches[0].clientX - touchStartX.current;
    if (diff > 50) setCurrent((prev) => (prev - 1 + sales.length) % sales.length);
    if (diff < -50) setCurrent((prev) => (prev + 1) % sales.length);
    touchStartX.current = null;
  };

  return (
    <div
      className="relative"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {sale.backgroundImage?.asset?.url && (
        <Image
          src={sale.backgroundImage.asset.url}
          alt={sale.title}
          fill
          className="absolute inset-0 w-full h-full object-cover rounded-lg z-0"
          style={{ pointerEvents: "none", userSelect: "none" }}
          priority
          sizes="100vw"
        />
      )}
      <div
        className="bg-gradient-to-r from-zinc-600 to-zinc-900 text-white  mx-4 mt-4 rounded-lg shadow-lg flex items-center"
        style={{
          backgroundImage: sale.backgroundImage?.asset?.url
            ? `url(${sale.backgroundImage.asset.url}), linear-gradient(to right, #52525b, #09090b)`
            : undefined,
          backgroundSize: sale.backgroundImage?.asset?.url ? "cover" : undefined,
          backgroundPosition: "center",
        }}
      >
        <div className="relative flex-1 p-5 bg-black/50 rounded-lg z-10">
          <h2 className="text-2xl  w-fit p-2 rounded-xl sm:text-4xl font-extralight text-left mb-4">
            {sale.title}
          </h2>
          <p className="text-left  w-fit p-2 rounded-xl text-xl sm:text-3xl font-semibold mb-6">
            {sale.description}
          </p>
          <div className="flex">
            <div className="bg-white text-black py-4 px-6 rounded-full shadow-md transform hover:scale-105 transition duration-300">
              <span className="font-bold text-base sm:text-xl">
                Use code: <span className="text-red-600">{sale.couponCode}</span>
              </span>
              <span className="ml-2 font-bold text-base sm:text-xl">
                for {sale.discountAmount} % OFF
              </span>
            </div>
          </div>
        </div>
      </div>
      {sales.length > 1 && (
        <>
          {/* <button
            aria-label="Previous sale"
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/20 text-white rounded px-1 py-2 hover:bg-black/50"
            onClick={() => setCurrent((prev) => (prev - 1 + sales.length) % sales.length)}
          >
            &#8592;
          </button>
          <button
            aria-label="Next sale"
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/20 text-white rounded px-1 py-2 hover:bg-black/50"
            onClick={() => setCurrent((prev) => (prev + 1) % sales.length)}
          >
            &#8594;
          </button> */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-2">
            {sales.map((_, idx) => (
              <button
                key={idx}
                className={`w-2 h-2 rounded-full ${idx === current ? "bg-white" : "bg-gray-400"}`}
                onClick={() => setCurrent(idx)}
                aria-label={`Go to sale ${idx + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
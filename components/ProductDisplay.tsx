// components/ProductDisplay.tsx
"use client";

import { useState } from "react";
import AddToBasketButton from "@/components/AddToBasketButton";
import { imageUrl } from "@/lib/imageUrl";
import { PortableText } from "next-sanity";
import Image from "next/image";

export default function ProductDisplay({ product }: { product: any }) {
  const isOutOfStock = product.stock != null && product.stock <= 0;

  // Determine images to use: use product.images if available, otherwise fallback to product.image.
  const sliderImages =
    product.images && product.images.length > 0
      ? product.images
      : product.image
      ? [product.image]
      : [];

  // Local state for slider index.
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % sliderImages.length);
  };

  const prevImage = () => {
    setCurrentIndex((prev) =>
      (prev - 1 + sliderImages.length) % sliderImages.length
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 px-8 py-4">
        <div className="relative">
          {/* Slider container */}
          <div className="relative aspect-square md:aspect-auto overflow-hidden rounded-lg shadow-lg">
            {sliderImages.length > 0 && (
              <Image
                src={imageUrl(sliderImages[currentIndex]).url()}
                alt={product.name ?? "Product image"}
                fill
                className="object-contain transition-transform p-6 duration-300 hover:scale-105"
              />
            )}
            {isOutOfStock && (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                <span className="text-white font-bold text-lg">Out of Stock</span>
              </div>
            )}
          </div>

          {/* Slider navigation (if more than one image exists) */}
          {sliderImages.length > 1 && (
            <div className="flex justify-between items-center mt-4">
              <button
                onClick={prevImage}
                className="bg-gray-200 hover:bg-gray-300 p-2 rounded"
              >
                Prev
              </button>
              <button
                onClick={nextImage}
                className="bg-gray-200 hover:bg-gray-300 p-2 rounded"
              >
                Next
              </button>
            </div>
          )}

          {/* Display location info at the bottom */}
          {product.location && (
            <div className="mt-4 text-center text-sm text-gray-600">
              {product.location.address
                ? product.location.address
                : `Lat: ${product.location.latitude}, Lng: ${product.location.longitude}`}
            </div>
          )}
        </div>

        <div className="flex flex-col justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
            <div className="text-xl font-semibold mb-4">
              Price: &#8377;{product.price?.toFixed(2)}
            </div>
            <div className="prose max-w-none mb-6">
              {Array.isArray(product.description) && (
                <PortableText value={product.description} />
              )}
            </div>
          </div>

          <div className="mt-6">
            <AddToBasketButton product={product} disabled={isOutOfStock} />
          </div>
        </div>
      </div>
    </div>
  );
}

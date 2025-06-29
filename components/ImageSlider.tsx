import { useState } from "react";
import Image from "next/image";
import { imageUrl } from "@/lib/imageUrl";
import { SanityImageSource } from "@sanity/image-url/lib/types/types";

interface ImageSliderProps {
  images: SanityImageSource[];
  alt: string;
  isOutOfStock?: boolean;
}

export default function ImageSlider({ images, alt, isOutOfStock }: ImageSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
  };

  return (
    <div className="relative w-full aspect-square">
      {images.length > 0 ? (
        <>
          <div className="relative w-full h-full">
            <Image
              src={imageUrl(images[currentIndex]).url()}
              alt={`${alt} - Image ${currentIndex + 1}`}
              fill
              className="object-contain"
              priority={currentIndex === 0}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            
            {isOutOfStock && (
              <div className="absolute inset-0 flex items-center justify-center rounded bg-black bg-opacity-50">
                <span className="text-white text-lg">Out of Stock</span>
              </div>
            )}
          </div>

          {images.length > 1 && (
            <>
              <button
                onClick={prevSlide}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full"
              >
                &#8249;
              </button>
              <button
                onClick={nextSlide}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full"
              >
                &#8250;
              </button>
              
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {images.map((_, index) => (
                  <button
                    key={index}
                    className={`w-2 h-2 rounded-full ${
                      index === currentIndex ? "bg-white" : "bg-white/50"
                    }`}
                    onClick={() => setCurrentIndex(index)}
                  />
                ))}
              </div>
            </>
          )}
        </>
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gray-100">
          No image available
        </div>
      )}
    </div>
  );
}
// components/ProductDisplay.tsx
"use client";

import { useEffect, useState } from "react";
import { PortableText } from "next-sanity";
import { useUser } from "@clerk/nextjs";
import StarRatingDisplay from "./StarRatingDisplay";
import ImageSlider from "./ImageSlider";
import CommentSection from "./CommentSection";
import AddToCartSection from "./AddToCartSection";
import type { Product } from "@/sanity.types";
import type { Rating } from "@/sanity/lib/products/gelRating";  // Add this import

export default function ProductDisplay({ product }: { product: Product }) {
  const { user } = useUser();
  const isOutOfStock = product.stock != null && product.stock <= 0;

  // Images for slider
  const sliderImages = product.images?.length
    ? product.images
    : product.image
      ? [product.image]
      : [];

  // Ensure ratings are properly typed when initializing state
  const [ratings, setRatings] = useState<Rating[]>(
    (product.ratings || []).map(rating => ({
      _key: rating._key,
      username: rating.username || "Anonymous",
      score: Number(rating.score) || 0, // Convert to number and provide default
      comment: rating.comment || "",
      createdAt: rating.createdAt || new Date().toISOString()
    }))
  );

  // Calculate average rating
  const ratingCount = ratings.length;
  const avgRating =
    ratingCount > 0
      ? ratings.reduce((sum, r) => sum + (r.score ?? 0), 0) / ratingCount
      : 0;

  // Handle new comment/rating submission
  const handleNewComment = async (score: number, comment: string) => {
    if (!user) return;

    const newRating: Rating = {
      username: user.fullName || user.emailAddresses[0]?.emailAddress || "Anonymous",
      score,
      comment,
      createdAt: new Date().toISOString()
    };

    try {
      const res = await fetch("/api/addRating", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product._id,
          rating: newRating
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to add rating');
      }

      const data = await res.json();
      if (Array.isArray(data.ratings)) {
        setRatings(data.ratings.map((rating: Rating) => ({
          _key: rating._key,
          username: rating.username || "Anonymous",
          score: Number(rating.score) || 0,
          comment: rating.comment || "",
          createdAt: rating.createdAt || new Date().toISOString()
        })));
      }
    } catch (error) {
      console.error('Error adding rating:', error);
      // Optionally add error handling UI here
    }
  };
  
  // Responsive width state
  const [width, setWidth] = useState<number>(0);

  useEffect(() => {
    // Set initial width on client
    setWidth(window.innerWidth);

    // Update width on resize
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="container px-1 py-2">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 px-2">
        <ImageSlider
          images={sliderImages}
          alt={product.name ?? "Product image"}
          isOutOfStock={isOutOfStock}
        />
        <div className="flex flex-col justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">{product.name}</h1>
            <div className={`flex ${width < 580 ? "flex-col items-start" : " flex-row gap-12"} gap-1  mb-4`}>
              <span className="text-xl font-semibold ">
                Price: &#8377;{product.price?.toFixed(2)}
              </span>
              <div className="flex felx-row items-center gap-2">
              <StarRatingDisplay avgRating={avgRating} />
              <span className="text-xs text-gray-500">
                ({ratings.length} ratings)
              </span>
              </div>
            </div>
            <div className="prose text-sm md:text-md max-w-none mb-6">
              {Array.isArray(product.description) && (
                <PortableText value={product.description} />
              )}
            </div>
          </div>
          <AddToCartSection product={product} isOutOfStock={isOutOfStock} />
          <CommentSection
            ratings={ratings}
            user={user}
            onNewComment={handleNewComment}
          />
        </div>
      </div>
    </div>
  );
}

"use client";
import React, { useState, useMemo, useCallback } from "react";
import { Range } from "react-range";
import MapsProduct from "@/components/MapsProduct";
import { Category, Product as SanityProduct } from "@/sanity.types";

// Define a type for the formatted product – note the rename!
interface FormattedProduct {
  id: string;
  name: string;
  price: number;
  rating: number;
  categories?: { title: string }[];
  location: { 
    latitude: number; 
    longitude: number; 
    address?: string; 
    radius?: number; 
  };
  image: string;
}

interface ProductsViewProps {
  products: SanityProduct[];
  categories: Category[];
}

export default function GeopLocationPage({ products, categories }: ProductsViewProps) {
  const [filters, setFilters] = useState({
    categories: [] as string[],
    minPrice: 0,
    maxPrice: 100000,
    minRating: 0,
    radius: 10, // Default radius in kilometers
  });

  // For categories UI: control visible categories count
  const [showAllCategories, setShowAllCategories] = useState(false);

  // Convert Sanity products to the expected format with full location data
  const formattedProducts: FormattedProduct[] = useMemo(() => {
    return products.map((p) => ({
      id: p._id ?? "",
      name: p.name ?? "Unknown",
      price: p.price ?? 0,
      rating: (p as any).rating ?? 0,
      categories: Array.isArray(p.categories)
        ? p.categories.map((cat: any) => ({ title: cat.title || "Unknown" }))
        : [],
      // Cast p as any so that TypeScript doesn’t complain about missing location property.
      location: (p as any).location
        ? {
            latitude: (p as any).location.latitude,
            longitude: (p as any).location.longitude,
            address: (p as any).location.address,
            radius: (p as any).location.radius,
          }
        : { latitude: 0, longitude: 0 },
      // If p.image isn’t a string, cast it so that we can access its asset URL.
      image: typeof p.image === "string"
        ? p.image
        : ((p.image as any)?.asset?.url || ""),
    }));
  }, [products]);

  const [priceRange, setPriceRange] = useState([filters.minPrice, filters.maxPrice]);

  const handleCategoryClick = useCallback((cat: Category) => {
    const title: string = (cat as any).title || "Unknown";
    setFilters((prev) => {
      const exists = prev.categories.includes(title);
      return {
        ...prev,
        categories: exists ? prev.categories.filter((t) => t !== title) : [...prev.categories, title],
      };
    });
  }, []);

  const handleRatingClick = useCallback((rating: number) => {
    setFilters((prev) => ({ ...prev, minRating: rating }));
  }, []);

  const handlePriceRangeChange = useCallback((values: number[]) => {
    setPriceRange(values);
    setFilters((prev) => ({ ...prev, minPrice: values[0], maxPrice: values[1] }));
  }, []);

  const handleRadiusChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters((prev) => ({ ...prev, radius: Number(e.target.value) }));
  }, []);

  const filteredProducts = useMemo(() => {
    return formattedProducts.filter((product) => {
      const inCategory =
        filters.categories.length === 0 ||
        product.categories?.some((cat) => filters.categories.includes(cat.title));
      const inPriceRange = product.price >= filters.minPrice && product.price <= filters.maxPrice;
      const inRatingRange = product.rating >= filters.minRating;
      return inCategory && inPriceRange && inRatingRange;
    });
  }, [formattedProducts, filters]);

  const visibleCategories = showAllCategories ? categories : categories.slice(0, 15);

  return (
    <div className="bg-gray-100 min-h-screen">
      <h4 className="text-center text-xl font-semibold py-2">Find Products Near You</h4>
      <div className="grid grid-cols-2 md:grid-cols-4 h-screen">
        {/* Left Panel – Filters */}
        <div className="bg-white p-4 border-r shadow-md w-screen md:w-auto">
          <h2 className="text-xl font-semibold mb-4">Filters</h2>
          <label className="block text-sm font-medium mb-2">Categories</label>
          <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
            {visibleCategories.map((cat) => {
              const title: string = (cat as any).title || "Unknown";
              const isSelected = filters.categories.includes(title);
              return (
                <button
                  key={cat._id}
                  className={`px-3 py-1 text-sm font-medium border rounded-md ${
                    isSelected ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-800"
                  }`}
                  onClick={() => handleCategoryClick(cat)}
                >
                  {title}
                </button>
              );
            })}
          </div>
          {categories.length > 15 && (
            <button
              onClick={() => setShowAllCategories((prev) => !prev)}
              className="mt-2 text-sm text-blue-500 hover:underline"
            >
              {showAllCategories ? "Show Less" : "Show All Categories"}
            </button>
          )}
          {/* Price Range Filter */}
          <div className="mt-4">
            <label className="block text-sm font-medium">
              Price Range: ₹{filters.minPrice} - ₹{filters.maxPrice}
            </label>
            <Range
              step={1000}
              min={0}
              max={10000000}
              values={priceRange}
              onChange={handlePriceRangeChange}
              renderTrack={({ props, children }) => (
                <div {...props} className="w-full h-2 bg-gray-300 rounded-md mt-2">
                  {children}
                </div>
              )}
              renderThumb={({ props, isDragged }) => (
                <div {...props} className={`w-4 h-4 rounded-full ${isDragged ? "bg-blue-600" : "bg-blue-400"}`} />
              )}
            />
          </div>
          {/* Radius Filter */}
          <div className="mt-4">
            <label className="block text-sm font-medium">
              Search Radius: {filters.radius} km
            </label>
            <input
              type="range"
              min="1"
              max="500"
              step="1"
              value={filters.radius}
              onChange={handleRadiusChange}
              className="w-full"
            />
          </div>
          {/* Rating Filter */}
          <div className="mt-4">
            <label className="block text-sm font-medium mb-2">Minimum Rating</label>
            <div className="flex space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => handleRatingClick(star)}
                  className={`flex items-center justify-center w-6 h-6 ${
                    star <= filters.minRating
                      ? "bg-yellow-400 text-white"
                      : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                  }`}
                  style={{
                    clipPath:
                      "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)",
                  }}
                />
              ))}
            </div>
          </div>
          <p className="mt-4 text-sm text-gray-600">
            Showing {filteredProducts.length} products
          </p>
        </div>

        {/* Right Panel – Map & Product List */}
        <div className="bg-gray-50 col-span-2 md:col-span-3 flex flex-col">
          <MapsProduct filters={filters} products={filteredProducts} />
        </div>
      </div>
    </div>
  );
}
  
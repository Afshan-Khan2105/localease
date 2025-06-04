"use client";

import React, { useState, useMemo, useCallback } from "react";
import { Range } from "react-range";
import MapsProduct from "@/components/MapsProduct";
import { Category } from "@/sanity.types";

interface ProductFromQuery {
  _id: string;
  name: string | null;
  slug?: { current?: string } | null;
  image?: { asset?: { url: string | null } | null } | null;
  images?: { asset?: { url: string | null } | null }[] | null;
  description?: unknown; // was any
  price: number;
  stock?: number;
  categories?: { _id?: string; title: string; slug?: unknown }[]; // was any
  location?: { latitude: number; longitude: number; address?: string; radius?: number };
  ratings?: { username: string; score: number; comment?: string; createdAt: string }[];
}

interface ProductsViewProps {
  products: ProductFromQuery[];
  categories: Category[];
}

export default function GeopLocationPage({ products, categories }: ProductsViewProps) {
  const [filters, setFilters] = useState({
    categories: [] as string[],
    minPrice: 0,
    maxPrice: 100000,
    minRating: 0,
    radius: 10,
  });
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [priceRange, setPriceRange] = useState([filters.minPrice, filters.maxPrice]);

  // Format products and calculate avgRating from ratings array
  const formattedProducts = useMemo(() => {
    return products.map((p) => {
      const ratings = Array.isArray(p.ratings) ? p.ratings : [];
      const avgRating =
        ratings.length > 0
          ? ratings.reduce((sum, r) => sum + (r.score ?? 0), 0) / ratings.length
          : 0;
      return {
        id: p._id || "",
        name: p.name || "Unknown",
        price: p.price || 0,
        avgRating,
        ratings,
        slug: p.slug?.current || "",
        categories: Array.isArray(p.categories)
          ? p.categories.map((cat) => ({ title: cat.title || "Unknown" }))
          : [],
        location: p.location
          ? {
              latitude: p.location.latitude,
              longitude: p.location.longitude,
              address: p.location.address,
              radius: p.location.radius,
            }
          : { latitude: 0, longitude: 0 },
        image:
          typeof p.image === "string"
            ? p.image
            : (p.image?.asset?.url || ""),
      };
    });
  }, [products]);

  const handleCategoryClick = useCallback((cat: Category) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const title = (cat as any).title || "Unknown";
    setFilters((prev) => {
      const exists = prev.categories.includes(title);
      return {
        ...prev,
        categories: exists
          ? prev.categories.filter((t) => t !== title)
          : [...prev.categories, title],
      };
    });
  }, []);

  const handleRatingClick = useCallback((rating: number) => {
    setFilters((prev) => ({ ...prev, minRating: rating }));
  }, []);

  const handlePriceRangeChange = useCallback((values: number[]) => {
    setPriceRange(values);
    setFilters((prev) => ({
      ...prev,
      minPrice: values[0],
      maxPrice: values[1],
    }));
  }, []);

  const handleRadiusChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFilters((prev) => ({ ...prev, radius: +e.target.value }));
    },
    []
  );

  // Filter using avgRating
  const filteredProducts = useMemo(() => {
    return formattedProducts.filter((product) => {
      const inCategory =
        filters.categories.length === 0 ||
        product.categories?.some((cat) => filters.categories.includes(cat.title));
      const inPriceRange =
        product.price >= filters.minPrice && product.price <= filters.maxPrice;
      const inRatingRange = product.avgRating >= filters.minRating;
      return inCategory && inPriceRange && inRatingRange;
    });
  }, [formattedProducts, filters]);

  const visibleCategories = showAllCategories
    ? categories
    : categories.slice(0, 15);

  return (
    <div className="bg-gray-100 min-h-screen ">
      <h4 className="text-center text-xl font-semibold ">
        Find Products Near You
      </h4>
      <div className="grid grid-cols-2 md:grid-cols-4 h-screen ">
        <aside className="bg-white p-4 border-r shadow-md w-[96vw] md:w-auto">
          <h2 className="text-xl font-semibold mb-4">Filters</h2>
          <label className="block text-sm font-medium mb-2">Categories</label>
          <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {visibleCategories.map((cat: any) => {
              const title = cat.title || "Unknown";
              const isSelected = filters.categories.includes(title);
              return (
                <button
                  key={cat._id}
                  className={`px-3 py-1 text-sm font-medium border rounded-md ${
                    isSelected
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 text-gray-800"
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
              onClick={() => setShowAllCategories((p) => !p)}
              className="mt-2 text-sm text-blue-500 hover:underline"
            >
              {showAllCategories ? "Show Less" : "Show All Categories"}
            </button>
          )}
          {filters.categories.length > 0 && (
            <button
              className="mt-2 mb-2 px-3 py-1 text-xs bg-red-100 text-red-600 rounded hover:bg-red-200"
              onClick={() => setFilters((prev) => ({ ...prev, categories: [] }))}
            >
              Remove All Category Filters
            </button>
          )}
          <div className="mt-4">
            <label className="block text-sm font-medium">
              Price: ₹{filters.minPrice} - ₹{filters.maxPrice}
            </label>
            <Range
              step={1000}
              min={0}
              max={10000000}
              values={priceRange}
              onChange={handlePriceRangeChange}
              renderTrack={({ props, children }) => (
                <div
                  {...props}
                  style={{
                    ...props.style,
                    height: '6px',
                    width: '100%',
                    backgroundColor: '#ccc',
                    borderRadius: '4px',
                    marginTop: '8px',
                  }}
                >
                  {children}
                </div>
              )}
              renderThumb={({ props, isDragged }) => (
                <div
                  {...props}
                  style={{
                    ...props.style,
                    height: '16px',
                    width: '16px',
                    borderRadius: '50%',
                    backgroundColor: isDragged ? '#2563eb' : '#60a5fa',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                />
              )}
            />
          </div>
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
          <div className="mt-4">
            <label className="block text-sm font-medium mb-2">
              Minimum Rating
            </label>
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
            {filters.minRating > 0 && (
              <button
                className="mt-2 px-3 py-1 text-xs bg-red-100 text-red-600 rounded hover:bg-red-200"
                onClick={() => setFilters((prev) => ({ ...prev, minRating: 0 }))}
              >
                Remove Rating Filter
              </button>
            )}
          </div>
          <p className="mt-4 text-sm text-gray-600">
            Showing {filteredProducts.length} products
          </p>
        </aside>

        <main className="bg-gray-50 col-span-2 md:col-span-3 flex flex-col">
          <MapsProduct filters={filters} products={filteredProducts} />
        </main>
      </div>
    </div>
  );
}

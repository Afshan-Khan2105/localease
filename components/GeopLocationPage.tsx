"use client";

import React, { useState, useMemo, useCallback, useEffect } from "react";
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

interface Filters {
  categories: string[];
  minPrice: number;
  maxPrice: number;
  minRating: number;
  radius: number;
}

export default function GeopLocationPage({ products, categories }: ProductsViewProps) {
  const [filters, setFilters] = useState<Filters>({
    categories: [],
    minPrice: 0,
    maxPrice: 10000,
    minRating: 0,
    radius: 1,
  });
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [displayedProductCount, setDisplayedProductCount] = useState(0);

  // Hydrate filters from localStorage on mount (client only)
  useEffect(() => {
    const saved = localStorage.getItem("findit-filters");
    if (saved) setFilters(JSON.parse(saved));
    const savedRange = localStorage.getItem("findit-priceRange");
    if (savedRange) setPriceRange(JSON.parse(savedRange));
  }, []);

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
    setFilters((prev: typeof filters) => {
      const exists = prev.categories.includes(title);
      return {
        ...prev,
        categories: exists
          ? prev.categories.filter((t: string) => t !== title)
          : [...prev.categories, title],
      };
    });
  }, []);

  const handleRatingClick = useCallback((rating: number) => {
    setFilters((prev: typeof filters) => ({ ...prev, minRating: rating }));
  }, []);

  const handlePriceRangeChange = useCallback((values: number[]) => {
    setPriceRange(values);
    setFilters((prev: typeof filters) => ({
      ...prev,
      minPrice: values[0],
      maxPrice: values[1],
    }));
  }, []);

  const handleRadiusChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFilters((prev: typeof filters) => ({ ...prev, radius: +e.target.value }));
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
    <div className="bg-gray-100 min-h-screen overflow-x-hidden">
      <h4 className="text-center text-xl font-semibold ">
        Find Products Near You
      </h4>
      <div className="grid grid-cols-2 md:grid-cols-4 h-screen ">
        <aside className="bg-white p-4 md:border-r-2 shadow-md w-[100vw] md:w-auto">
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
              onClick={() => setFilters((prev: typeof filters) => ({ ...prev, categories: [] }))}
            >
              Remove All Category Filters
            </button>
          )}
          <div className="mt-4">
            <label className="block text-sm font-medium">
              Price: ₹{filters.minPrice} - ₹{filters.maxPrice}
            </label>
            <Range
              step={100}
              min={0}
              max={1000000}
              values={priceRange}
              onChange={handlePriceRangeChange}
              renderTrack={({ props, children }) => {
                // Calculate the percentage positions of the thumbs
                const min = 0;
                const max = 1000000;
                const [left, right] = priceRange;
                const leftPercent = ((left - min) / (max - min)) * 100;
                const rightPercent = ((right - min) / (max - min)) * 100;

                return (
                  <div
                    {...props}
                    style={{
                      ...props.style,
                      height: '6px',
                      width: '100%',
                      borderRadius: '4px',
                      marginTop: '8px',
                      background: `linear-gradient(
                        to right,
                        #ccc 0%,
                        #ccc ${leftPercent}%,
                        #2563eb ${leftPercent}%,
                        #2563eb ${rightPercent}%,
                        #ccc ${rightPercent}%,
                        #ccc 100%
                      )`,
                    }}
                  >
                    {children}
                  </div>
                );
              }}
              renderThumb={({ props, isDragged }) => {
                const { key, ...rest } = props;
                return (
                  <div
                    key={key}
                    {...rest}
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
                );
              }}
            />
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium">
              Search Radius: {filters.radius} km
            </label>
            <input
              type="range"
              min="1"
              max="50"
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
                onClick={() => setFilters((prev: typeof filters) => ({ ...prev, minRating: 0 }))}
              >
                Remove Rating Filter
              </button>
            )}
          </div>
          <p className="mt-4 text-sm text-gray-600">
            Showing {displayedProductCount} products
          </p>
        </aside>

        <main className="bg-gray-50 col-span-2 md:col-span-3 flex flex-col">
          <MapsProduct
            filters={filters}
            products={filteredProducts}
            onDisplayCountChange={setDisplayedProductCount}
          />
        </main>
      </div>
    </div>
  );
}

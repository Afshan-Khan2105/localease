"use client";
import React, { useState, useEffect, useMemo } from "react";
import { GoogleMap, Marker, Circle, OverlayView, useLoadScript } from "@react-google-maps/api";
import { imageUrl } from "@/lib/imageUrl";

const mapContainerStyle = { width: "100%", height: "500px" };
const defaultCenter = { lat: 28.6139, lng: 77.209 };
const libraries: ("places")[] = ["places"];

const mapOptions = {
  styles: [
    { featureType: "all", elementType: "geometry.fill", stylers: [{ color: "#eaeaea" }] },
    { featureType: "road", elementType: "geometry", stylers: [{ color: "#ffffff" }] },
  ],
  disableDefaultUI: false,
  zoomControl: true,
};

// Function to calculate distance (in KM)
const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

interface Product {
  id: string;
  name: string;
  price: number;
  rating: number;
  categories?: { title: string }[];
  // Always provided a default location
  location: { 
    latitude: number; 
    longitude: number; 
  };
  image: string;
}

interface Filters {
  categories: string[];
  minPrice: number;
  maxPrice: number;
  minRating: number;
  radius: number; // In KM
}

const MapsProduct = ({ filters, products }: { filters: Filters; products: Product[] }) => {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries,
  });

  const [currentLocation, setCurrentLocation] = useState(defaultCenter);

  // Get user's current location
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCurrentLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
      },
      () => console.warn("Unable to fetch location")
    );
  }, []);

  // Use the passed-in products instead of undefined "formattedProducts"
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const inCategory =
        filters.categories.length === 0 ||
        product.categories?.some((cat) => filters.categories.includes(cat.title));
      const inPriceRange = product.price >= filters.minPrice && product.price <= filters.maxPrice;
      const inRatingRange = product.rating >= filters.minRating;
  
      // Apply distance filter using current location
      const distance = getDistance(
        currentLocation.lat,
        currentLocation.lng,
        product.location.latitude,
        product.location.longitude
      );
      const inRadius = distance <= filters.radius;
  
      return inCategory && inPriceRange && inRatingRange && inRadius;
    });
  }, [products, filters, currentLocation]);

  if (!isLoaded) return <p>Loading Map...</p>;

  const ProductMarker = ({ product }: { product: Product }) => (
    <OverlayView
      position={{ lat: product.location.latitude, lng: product.location.longitude }}
      mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
    >
      <div className="flex flex-col items-center transform -translate-x-1/2 -translate-y-full">
        {product.image ? (
          <img
            src={imageUrl(product.image).url() || product.image}
            alt={product.name}
            className="w-12 h-12 object-cover rounded-full border-2 border-white shadow-md"
          />
        ) : (
          <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
            No Image
          </div>
        )}
        <div className="mt-1 bg-white px-2 py-1 rounded-md shadow-md text-xs font-semibold">
          ₹{product.price}
        </div>
      </div>
    </OverlayView>
  );

  return (
    <div className="p-4">
      <GoogleMap mapContainerStyle={mapContainerStyle} zoom={13} center={currentLocation} options={mapOptions}>
        <Circle
          center={currentLocation}
          radius={filters.radius * 1000}
          options={{ fillColor: "rgba(0, 0, 255, 0.2)", strokeColor: "blue" }}
        />
        {filteredProducts.map((product) => (
          <ProductMarker key={product.id} product={product} />
        ))}
        <Marker position={currentLocation} icon="http://maps.google.com/mapfiles/ms/icons/blue-dot.png" />
      </GoogleMap>
      <div className="mt-4">
        <h3 className="text-lg font-bold">Products Nearby</h3>
        <div className="overflow-x-auto flex gap-4 p-2 bg-white shadow-md">
          {filteredProducts.length ? (
            filteredProducts.map((product) => (
              <div
                key={product.id}
                className="min-w-[200px] p-2 border rounded-lg shadow-sm bg-gray-100 cursor-pointer"
              >
                {product.image && (
                  <img
                    src={imageUrl(product.image).url() || product.image}
                    alt={product.name}
                    className="w-full h-24 object-contain"
                  />
                )}
                <h4 className="text-sm font-semibold">{product.name}</h4>
                <p className="text-xs text-gray-500">₹{product.price} | ⭐ {product.rating}</p>
              </div>
            ))
          ) : (
            <p className="text-gray-500">No products found in this category.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default MapsProduct;

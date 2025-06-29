"use client";
import React, { useState, useEffect, useMemo } from "react";
import { GoogleMap, Marker, Circle, OverlayView, useLoadScript, DirectionsRenderer } from "@react-google-maps/api";
import { imageUrl } from "@/lib/imageUrl";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { TbGpsFilled } from "react-icons/tb";
import { IoIosList } from "react-icons/io";
import { MdInventory } from "react-icons/md";
import { PiShoppingBagOpenFill } from "react-icons/pi";
import Link from "next/link";

const libraries: ("places")[] = ["places"];

const mapContainerStyle = { width: "100%", height: "500px" };

const mapOptions = {
  styles: [
    { featureType: "all", elementType: "geometry.fill", stylers: [{ color: "#eaeaea" }] },
    { featureType: "road", elementType: "geometry", stylers: [{ color: "#ffffff" }] },
  ],
  disableDefaultUI: false,
  zoomControl: true,
};

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
  avgRating: number;
  ratings: { score: number }[];
  slug?: string;
  categories?: { title: string }[];
  location: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  image: string;
}

interface Filters {
  categories: string[];
  minPrice: number;
  maxPrice: number;
  minRating: number;
  radius: number;
}

interface Props {
  filters: Filters;
  products: Product[];
  onDisplayCountChange: (count: number) => void;
}

const MapsProduct = ({ filters, products, onDisplayCountChange }: Props) => {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
      libraries,
  });

  const [pointerLocation, setPointerLocation] = useState({ lat: 28.6139, lng: 77.209 });
const [gpsActive, setGpsActive] = useState(false);
  const [gpsLocation, setGpsLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const router = useRouter();

  // Get device location on mount
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const loc = { lat: position.coords.latitude, lng: position.coords.longitude };
        setPointerLocation(loc);
        setGpsLocation(loc);
        setGpsActive(true);
      },
      () => console.warn("Unable to fetch location")
    );
  }, []);

  // Hydrate from localStorage on mount (client only)
  useEffect(() => {
    const savedPointer = localStorage.getItem("findit-pointerLocation");
    if (savedPointer) setPointerLocation(JSON.parse(savedPointer));
    const savedGps = localStorage.getItem("findit-gpsActive");
    if (savedGps) setGpsActive(JSON.parse(savedGps));
  }, []);

  // Filtering logic
  const centerLocation = gpsActive && gpsLocation ? gpsLocation : pointerLocation;

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const inCategory =
        filters.categories.length === 0 ||
        product.categories?.some((cat) => filters.categories.includes(cat.title));
      const inPriceRange = product.price >= filters.minPrice && product.price <= filters.maxPrice;
      const inRatingRange = product.avgRating >= filters.minRating;
      const distance = getDistance(
        centerLocation.lat,
        centerLocation.lng,
        product.location.latitude,
        product.location.longitude
      );
      const inRadius = distance <= filters.radius;
      return inCategory && inPriceRange && inRatingRange && inRadius;
    });
  }, [products, filters, centerLocation]);

  // Update display count
  useEffect(() => {
    onDisplayCountChange(filteredProducts.length);
  }, [filteredProducts, onDisplayCountChange]);

  // Save pointerLocation and gpsActive to localStorage on change
  useEffect(() => {
    localStorage.setItem("findit-pointerLocation", JSON.stringify(pointerLocation));
  }, [pointerLocation]);
  useEffect(() => {
    localStorage.setItem("findit-gpsActive", JSON.stringify(gpsActive));
  }, [gpsActive]);

  if (!isLoaded) return <p>Loading Map...</p>;

  // Unified handler for setting pointer location and disabling GPS
  const handleSetPointer = (lat: number, lng: number) => {
    setPointerLocation({ lat, lng });
    setGpsActive(false);
    setDirections(null);
    setSelectedProduct(null);
  };

  // Map click: set pointer and disable GPS
  const handleMapClick = (e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      handleSetPointer(e.latLng.lat(), e.latLng.lng());
    }
  };

  // Pointer drag: update pointer and disable GPS
  const handlePointerDragEnd = (e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      handleSetPointer(e.latLng.lat(), e.latLng.lng());
    }
  };

  // Toggle GPS mode and fetch current device location accurately
  const handleCurrentLocationClick = () => {
    if (gpsActive) {
      setGpsActive(false);
      setDirections(null);
      setSelectedProduct(null);
      return;
    }
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }
    setGpsLoading(true); // Start loading
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const loc = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setGpsLocation(loc);
        setPointerLocation(loc);
        setGpsActive(true);
        setDirections(null);
        setSelectedProduct(null);
        setGpsLoading(false); // Stop loading
      },
      (error) => {
        setGpsLoading(false); // Stop loading on error
        if (error.code === error.PERMISSION_DENIED) {
          alert("Location permission denied. Please allow location access.");
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          alert("Location information is unavailable.");
        } else if (error.code === error.TIMEOUT) {
          alert("Location request timed out. Try again.");
        } else {
          alert("Unable to fetch your current location.");
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 50000,
        maximumAge: 0,
      }
    );
  };

  // Show route from selected product to current location (GPS or pointer)
  const handleShowRoute = (product: Product) => {
    const origin = {
      lat: product.location.latitude,
      lng: product.location.longitude,
    };
    const destination = gpsActive && gpsLocation
      ? gpsLocation
      : pointerLocation;

    const directionsService = new window.google.maps.DirectionsService();
    directionsService.route(
      {
        origin,
        destination,
        travelMode: window.google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === "OK" && result) {
          setDirections(result);
        } else {
          alert("Could not find route.");
        }
      }
    );
  };

  // Product marker click: open info card
  const handleProductMarkerClick = (product: Product) => {
    setSelectedProduct(product);
    setDirections(null);
  };

  // Product marker component
  const ProductMarker = ({ product }: { product: Product }) => (
    <OverlayView
      position={{ lat: product.location.latitude, lng: product.location.longitude }}
      mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
    >
      <div
        className="flex flex-col items-center cursor-pointer group"
        style={{ transform: "translate(-50%, -100%)" }}
        onClick={() => handleProductMarkerClick(product)}
        title={product.name}
      >
        <Image
          src={imageUrl(product.image).url() || product.image}
          alt={product.name}
          width={80}
          height={80}
          className="w-12 h-12 object-cover rounded-full border-2 border-white shadow-md group-hover:scale-105 transition"
        />
       
        {/* Optional: pointer triangle below image */}
        <div
          style={{
            width: 0,
            height: 0,
            zIndex: -1,
            borderLeft: "8px solid transparent",
            borderRight: "8px solid transparent",
            borderTop: "12px solid #2563eb",
            marginTop: "-2px",
          }}
        />
         <span className="text-xs text-center  bg-gray-100 rounded-sm px-1 shadow-md">
        &#8377;{product.price}
        </span>
      </div>
    </OverlayView>
  );

  return (
    <div className="p-4">
      <div className="flex  gap-2 mt-2 mb-2">
          {/* GPS Button */}
        <button
          onClick={handleCurrentLocationClick}
          className={`flex items-center gap-2 px-4 py-2 rounded-md shadow ${
            gpsActive ? "bg-zinc-800" : "bg-zinc-800"
          } text-white hover:bg-zinc-900 transition`}
        >
          <TbGpsFilled size={20} />
          <span className="sm:block hidden">{gpsActive ? "Turn Off Navigation" : "Navigate your Location"}</span>
        </button>

        {/* List Your Product */}
        <button
          onClick={() => {
            const coords = gpsActive && gpsLocation
              ? gpsLocation
              : pointerLocation;
            router.push(
              `/productList?lat=${coords.lat}&lng=${coords.lng}`
            );
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-md shadow bg-zinc-800 text-white hover:bg-zinc-900 transition"
        >
          <IoIosList size={15}/>
          <span className="sm:block hidden">List Products</span>
          
          <span className="sm:hidden block text-xs">List</span>
        </button>

        {/* Listed Products */}
        <Link
          href="/Inventory"
          className="flex items-center gap-2 px-4 py-2 rounded-md shadow bg-zinc-800 text-white hover:bg-zinc-900 transition"
        >
          <MdInventory size={15} />
          <span className="sm:block hidden">Inventory</span>
          
          <span className="sm:hidden block text-xs">Inventory</span>
        </Link>

        {/* Order Requests */}
        <Link
          href="/orderReq"
          className="flex items-center gap-2 px-4 py-2 rounded-md shadow bg-zinc-800 text-white hover:bg-zinc-900 transition"
        >
          {/* Inbox icon */}
          <PiShoppingBagOpenFill size={15} />
          <span className="sm:block hidden">Orders Received</span>
          <span className="sm:hidden block text-xs">Req</span>
        </Link>

       {/* ...your buttons... */}
        {gpsLoading &&  (
          <span className="flex items-center ml-2">
            <svg className="animate-spin h-6 w-6 text-blue-500" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              />
            </svg>
            <span className="ml-2 text-blue-400 text-sm">Locating...</span>
          </span>
        )}
      </div>

      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        zoom={15}
        center={centerLocation}
        options={mapOptions}
        onClick={handleMapClick}
      >
        {/* Always show the circle at the current center */}
        {(gpsActive && gpsLocation) || (!gpsActive && pointerLocation) ? (
          <Circle
            center={gpsActive && gpsLocation ? gpsLocation : pointerLocation}
            radius={filters.radius * 1000}
            options={{
              fillColor: "rgba(0, 0, 255, 0.3)",
              strokeColor: "blue",
              strokeOpacity: 0.5,
              strokeWeight: 1,
            }}
          />
        ) : null}
        {/* Show pointer marker if not using GPS */}
        {!gpsActive && (
          <Marker
            position={pointerLocation}
            draggable
            onDragEnd={handlePointerDragEnd}
            icon="http://maps.google.com/mapfiles/ms/icons/red-dot.png"
          />
        )}
        {/* Show blue GPS dot if GPS is active */}
        {gpsActive && gpsLocation && (
          <OverlayView
            position={gpsLocation}
            mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
          >
            <div
            style={{
              position: "relative",
              width: 48,
              height: 48,
              pointerEvents: "none",
              transform: "translate(-50%, -50%)", // Center the overlay at the GPS location
            }}
          >
      {/* Beam (triangle/cone) pointing north */}
         <svg
            width={40}
            height={40}
            style={{
              position: "absolute",
              left: 0,
              top: 10,
            }}
          >
            <defs>
              <linearGradient id="beam-gradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#fff" stopOpacity="0.85" />
                <stop offset="100%" stopColor="#2563eb" stopOpacity="0.25" />
              </linearGradient>
            </defs>
            <polygon
              points="24,6 10,38 38,38"
              fill="url(#beam-gradient)"
            />
          </svg>
          {/* Blue dot */}
          <div
            style={{
              position: "absolute",
              left: 16,
              top: 16,
              width: 16,
              height: 16,
              borderRadius: "50%",
              background: "#2563eb",
              border: "2px solid white",
              boxShadow: "0 0 8px 2px #2563eb88",
            }}
          />
    </div>
          </OverlayView>
        )}
        
        {/* Product markers */}
        {filteredProducts.map((product) => (
          <ProductMarker key={product.id} product={product} />
        ))}

        {/* Show route if available */}
        {directions && <DirectionsRenderer directions={directions} options={{ polylineOptions: { strokeColor: "#2563eb", strokeWeight: 5 } }} />}

        {/* Product Info Card Overlay */}
        {selectedProduct && (
          <OverlayView
            position={{
              lat: selectedProduct.location.latitude - 0.000015, // Slightly offset to avoid overlap with marker
              lng: selectedProduct.location.longitude + 0.00015, // Slightly offset to avoid overlap with marker
            }}
            mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
          >
            <div
              className="bg-white rounded-xl shadow-lg p-4 border border-blue-200 z-50 w-[60vw] max-w-72"
              style={{
                transform: "translate(-10px, -120%)",
                minWidth: 200,
              }}
            >
              <div className="flex items-center gap-6">
                <Image
                  src={imageUrl(selectedProduct.image).url() || selectedProduct.image}
                  alt={selectedProduct.name}
                  width={84}
                  height={84}
                  className="rounded-lg object-cover shadow-md"
                />
                <div>
                  <h4 className="text-lg font-bold">{selectedProduct.name}</h4>
                  <p className="text-sm text-gray-600">
                    {selectedProduct.location.address || "No address available"}
                  </p>
                  <span className="text-gray-600 font-semibold">₹{selectedProduct.price}  |  </span>
                  <span className="text-gray-600">⭐ {selectedProduct.avgRating.toFixed(1)}</span>
                </div>
              </div>
              <div className="flex gap-2 mt-4 ml-4">
                <button
                  className="bg-blue-100 text-blue-700 px-3 py-1 rounded shadow-md hover:bg-blue-200"
                  onClick={() => router.push(`/product/${selectedProduct.slug}`)}
                >
                 View Product
                </button>
                <button
                  className="bg-blue-100 text-blue-700 px-3 py-1 rounded shadow-md hover:bg-blue-200"
                  onClick={() => handleShowRoute(selectedProduct)}
                >
                  Route
                </button>
                <button
                  className="bg-gray-100 text-zinc-700 px-3 py-1 rounded shadow-md hover:bg-gray-200"
                  onClick={() => {
                    setSelectedProduct(null);
                    setDirections(null);
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </OverlayView>
        )}
      </GoogleMap>

      <div className="mt-4">
        <h3 className="text-lg font-bold">Products Nearby</h3>
        <div className="overflow-x-auto flex gap-4 p-2 bg-white shadow-md">
          {filteredProducts.length ? (
            filteredProducts.map((product) => (
              <div
                key={product.id}
                className="min-w-[200px] p-2 border rounded-lg shadow-md cursor-pointer"
                onClick={() => router.push(`/product/${product.slug}`)}
                title={product.name}
              >
                {product.image && (
                  <Image
                    src={imageUrl(product.image).url() || product.image}
                    alt={product.name}
                    width={640}
                    height={640}
                    className="w-full h-28 object-contain"
                  />
                )}

                <h4 className="text-sm font-semibold">{product.name}</h4>
                <p className="text-xs text-gray-500">
                  ₹{product.price} | ⭐ {product.avgRating.toFixed(1)}
                </p>
              </div>
            ))
          ) : (
            <p className="text-gray-500 rounded-sm">No products found in this category.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default MapsProduct;

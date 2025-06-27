"use client";
import ProductListing from "@/components/ProductListing";
import { useSearchParams } from "next/navigation";

export default function Page() {
  const searchParams = useSearchParams();
  // Get lat/lng from URL query params
  const lat = searchParams?.get("lat") || "28.7041"; // Default to Delhi if not provided
  const lng = searchParams?.get("lng") || "77.1025"; // Default to Delhi if not provided

  return (
    <div>
      <ProductListing lat={lat} lng={lng} />
    </div>
  );
}


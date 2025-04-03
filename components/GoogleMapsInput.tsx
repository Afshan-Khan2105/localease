import React, { useState, useEffect } from "react";
import { ObjectInputProps, PatchEvent, set, setIfMissing } from "sanity";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";
import { Button } from "@/components/ui/button";

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string;

interface Location {
  lat: number;
  lng: number;
  address?: string;
  radius?: number;
}

/**
 * Google Maps Custom Input for Sanity
 */
const GoogleMapsInput: React.FC<ObjectInputProps<Record<string, any>>> = ({ value, onChange }) => {
  const defaultCenter: Location = { lat: 28.6139, lng: 77.2090, radius: 5 };

  // Initialize marker state from Sanity value if available
  const [marker, setMarker] = useState<Location>(
    value && value.latitude && value.longitude
      ? {
          lat: value.latitude,
          lng: value.longitude,
          address: value.address,
          radius: value.radius || 5,
        }
      : defaultCenter
  );

  // Track the saved marker so that details remain visible after saving
  const [savedMarker, setSavedMarker] = useState<Location>(marker);
  const [address, setAddress] = useState<string>(value?.address || "");

  // Sync with external value if it changes (for example, on edit)
  useEffect(() => {
    if (value && value.latitude && value.longitude) {
      const newLocation = {
        lat: value.latitude,
        lng: value.longitude,
        address: value.address,
        radius: value.radius || 5,
      };
      setMarker(newLocation);
      setSavedMarker(newLocation);
      setAddress(value.address);
    }
  }, [value]);

  // Fetch address when marker changes
  useEffect(() => {
    if (marker) {
      fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${marker.lat},${marker.lng}&key=${GOOGLE_MAPS_API_KEY}`
      )
        .then((res) => res.json())
        .then((data) => {
          if (data.results?.length > 0) {
            setAddress(data.results[0].formatted_address);
          }
        })
        .catch((error) => console.error("Error fetching address:", error));
    }
  }, [marker]);

  // Handler for saving the location. Saved details now remain visible.
  const handleSaveLocation = () => {
    if (onChange) {
      onChange(
        PatchEvent.from([
          setIfMissing({
            latitude: marker.lat,
            longitude: marker.lng,
            address: address,
            radius: marker.radius || 5,
          }),
          set(marker.lat, ["latitude"]),
          set(marker.lng, ["longitude"]),
          set(address, ["address"]),
          set(marker.radius || 5, ["radius"]),
        ])
      );
      setSavedMarker({ ...marker, address, radius: marker.radius || 5 });
    }
  };

  // Helper function to fetch address from coordinates
const fetchAddress = (lat: number, lng: number) => {
  fetch(
    `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_MAPS_API_KEY}`
  )
    .then((res) => res.json())
    .then((data) => {
      if (data.results?.length > 0) {
        setAddress(data.results[0].formatted_address);
      }
    })
    .catch((error) => console.error("Error fetching address:", error));
};

// Handler to set marker to the device's current location
const handleUseCurrentLocation = () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const currentLocation: Location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          radius: marker.radius || 5,
        };
        setMarker(currentLocation);
        // Immediately fetch and set the address for the current location
        fetchAddress(currentLocation.lat, currentLocation.lng);
      },
      (error) => {
        console.error("Error getting current location:", error);
        alert("Unable to retrieve your location. Please check your browser settings.");
      }
    );
  } else {
    alert("Geolocation is not supported by your browser.");
  }
};


  return (
    <div>
      <Button onClick={handleUseCurrentLocation} className="mb-2">
        Use Current Location
      </Button>

      <LoadScript
        googleMapsApiKey={GOOGLE_MAPS_API_KEY}
        onError={(e) => console.error("Error loading Google Maps script:", e)}
      >
        <GoogleMap
          mapContainerStyle={{ width: "100%", height: "300px" }}
          center={marker}
          zoom={14}
          onClick={(e) =>
            setMarker({
              lat: e.latLng?.lat() || marker.lat,
              lng: e.latLng?.lng() || marker.lng,
              address,
              radius: marker.radius,
            })
          }
        >
          <Marker
            position={marker}
            draggable={true}
            onDragEnd={(e) =>
              setMarker({
                lat: e.latLng?.lat() || marker.lat,
                lng: e.latLng?.lng() || marker.lng,
                address,
                radius: marker.radius,
              })
            }
          />
        </GoogleMap>
      </LoadScript>

      {/* Display current selected location details */}
      <div style={{ marginTop: "1rem" }}>
        <p>
          <strong>Current Address:</strong>{" "}
          {address || "Click on the map to choose a location"}
        </p>
        {address && (
          <p>
            <strong>Coordinates:</strong> Latitude: {marker.lat.toFixed(6)}, Longitude:{" "}
            {marker.lng.toFixed(6)}
          </p>
        )}
      </div>

      <Button onClick={handleSaveLocation} className="mt-2">
        Save Location
      </Button>

      {/* Permanently display saved location details */}
      <div style={{ marginTop: "1rem" }}>
        <p className="text-green-600">📍 Saved Location Details:</p>
        <p>
          <strong>Coordinates:</strong> Latitude: {savedMarker.lat.toFixed(6)}, Longitude:{" "}
          {savedMarker.lng.toFixed(6)}
        </p>
        {savedMarker.address && (
          <p>
            <strong>Address:</strong> {savedMarker.address}
          </p>
        )}
      </div>
    </div>
  );
};

export default GoogleMapsInput;

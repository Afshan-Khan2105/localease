import React, { useState, useEffect, useCallback } from "react";
import { ObjectInputProps, PatchEvent, set, setIfMissing } from "sanity";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";
import { Button } from "@/components/ui/button";

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string;
const containerStyle = { width: "100%", height: "300px" };

interface MarkerState {
  lat: number;
  lng: number;
  radius: number;
}

interface LocationValue {
  latitude?: number;
  longitude?: number;
  radius?: number;
}

export const GoogleMapsInput: React.FC<ObjectInputProps<LocationValue>> = ({ 
  value, 
  onChange 
}) => {
  const defaultCenter = { lat: 28.6139, lng: 77.2090 };

  const [marker, setMarker] = useState<MarkerState>({
    lat: Number(value?.latitude) || defaultCenter.lat,
    lng: Number(value?.longitude) || defaultCenter.lng,
    radius: Number(value?.radius) || 5,
  });

  const { isLoaded, loadError } = useJsApiLoader({ 
    googleMapsApiKey: GOOGLE_MAPS_API_KEY 
  });

  const saveToSanity = useCallback(() => {
    onChange(
      PatchEvent.from([
        setIfMissing({}),
        set(Number(marker.lat), ["latitude"]),
        set(Number(marker.lng), ["longitude"]),
        set(Number(marker.radius), ["radius"]),
      ])
    );
  }, [marker, onChange]);

  const updateMarker = (e: google.maps.MapMouseEvent) => {
    if (!e.latLng) return;
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();
    setMarker(curr => ({ ...curr, lat, lng }));
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) return alert("Geolocation not supported");
    navigator.geolocation.getCurrentPosition(
      pos => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setMarker(curr => ({ ...curr, lat, lng }));
      },
      () => alert("Unable to retrieve your location")
    );
  };

  useEffect(() => {
    if (value?.latitude && value?.longitude) {
      const init: MarkerState = {
        lat: Number(value.latitude),
        lng: Number(value.longitude),
        radius: Number(value.radius) || 5,
      };
      setMarker(init);
    }
  }, [value]);

  if (loadError) return <div>Error loading maps</div>;
  if (!isLoaded) return <div>Loading map...</div>;

  return (
    <div className="space-y-4">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={marker}
        zoom={14}
        onClick={updateMarker}
      >
        <Marker 
          position={{ lat: marker.lat, lng: marker.lng }} 
          draggable 
          onDragEnd={updateMarker} 
        />
      </GoogleMap>

      <div>
        <p className="font-medium">
          Coordinates: {marker.lat.toFixed(6)}, {marker.lng.toFixed(6)}
        </p>
      </div>
      
      <div className="space-x-2">
        <Button onClick={saveToSanity}>
          Save Location
        </Button>

        <Button 
          onClick={handleUseCurrentLocation} 
          variant="outline"
        >
          Use Current Location
        </Button>
      </div>
    </div>
  );
};

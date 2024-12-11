import { Geolocation } from "@capacitor/geolocation";
import { useState, useRef, useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "./Map.css";

export default function Map({ currentCoords, setCurrentCoords }) {
  const mapRef = useRef(null);

  // Update map view to center location when location changes (only when focus is true)
  useEffect(() => {
    if (currentCoords.focus && mapRef.current) {
      mapRef.current.setView(
        [currentCoords.lat, currentCoords.lon],
        mapRef.current.getZoom()
      );
    }
  }, [currentCoords]);

  // fix leaflet map invalid size
  useEffect(() => {
    const resizeInterval = setInterval(() => {
      if (mapRef.current) {
        mapRef.current.invalidateSize();
        clearInterval(resizeInterval);
      }
    }, 100);
  }, []);

  function MapEvents() {
    const map = useMapEvents({
      movestart: () => {
        console.log("Map moving");
        setCurrentCoords((prevState) => ({ ...prevState, focus: false }));
      },
    });

    return null;
  }

  return (
    <MapContainer
      center={[currentCoords.lat, currentCoords.lon]}
      zoom={16}
      zoomControl={false}
      trackResize={true}
      bounceAtZoomLimits={false}
      ref={mapRef}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapEvents />
      <Marker position={[currentCoords.lat, currentCoords.lon]}>
        <Popup>
          A pretty CSS3 popup. <br /> Easily customizable.
        </Popup>
      </Marker>
    </MapContainer>
  );
}

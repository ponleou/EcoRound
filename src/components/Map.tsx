import { Geolocation } from "@capacitor/geolocation";
import { useState, useRef, useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
  CircleMarker,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "./Map.css";
import { locate } from "ionicons/icons";
import L from "leaflet";

export default function Map({
  currentCoords,
  setCurrentCoords,
  setCenterCoords,
  startCoords,
  destinationCoords,
}) {
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
      dragstart: () => {
        setCurrentCoords((prevState) => ({ ...prevState, focus: false }));
      },
    });

    useEffect(() => {
      const getCenterInterval = setInterval(() => {
        setCenterCoords((prevState) => ({
          ...prevState,
          lat: mapRef.current.getCenter().lat,
          lon: mapRef.current.getCenter().lng,
        }));
      }, 100);
      return () => clearInterval(getCenterInterval);
    }, []);

    return null;
  }

  function getCssVariableValue(variableName) {
    return getComputedStyle(document.documentElement).getPropertyValue(
      variableName
    );
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
      <CircleMarker
        radius={10}
        center={[currentCoords.lat, currentCoords.lon]}
        fillColor={getCssVariableValue("--ion-color-secondary").trim()}
        color="white"
        fillOpacity={0.7}
      ></CircleMarker>
      {startCoords.lat && startCoords.lon && (
        <CircleMarker
          radius={7}
          center={[startCoords.lat, startCoords.lon]}
          color={getCssVariableValue("--ion-color-primary").trim()}
          fillColor="white"
          fillOpacity={1}
        >
          {/* <Popup>Start</Popup> */}
        </CircleMarker>
      )}
      {destinationCoords.lat && destinationCoords.lon && (
        <Marker position={[destinationCoords.lat, destinationCoords.lon]}>
          {/* <Popup>Destination</Popup> */}
        </Marker>
      )}
    </MapContainer>
  );
}

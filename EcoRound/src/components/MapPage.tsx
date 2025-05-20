import { useContext, useEffect, useRef, useState } from "react";
import {
  CircleMarker,
  MapContainer,
  Marker,
  Polyline,
  TileLayer,
  useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "./MapPage.css";
import L, { map } from "leaflet";
import { CoordinateContext } from "../context/CoordinateContext";

export default function MapPage({
  topContent,
  bottomContent,
  setMapEvents = null,
  mapPaths = [],
  focusCurrentCoords = false,
}) {
  const {
    currentCoords,
    center,
    startCoords,
    destinationCoords,
    setCenterCoords,
  } = useContext(CoordinateContext) as any;

  const mapRef = useRef(null);

  // map events
  function MapEvents() {
    useMapEvents({
      movestart: () => {
        if (setMapEvents)
          setMapEvents((prevState) => ({ ...prevState, moving: true }));
      },
      moveend: () => {
        if (setMapEvents)
          setMapEvents((prevState) => ({ ...prevState, moving: false }));
      },
      dragstart: () => {
        if (setMapEvents)
          setMapEvents((prevState) => ({ ...prevState, dragging: true }));
      },
      dragend: () => {
        if (setMapEvents)
          setMapEvents((prevState) => ({ ...prevState, dragging: false }));
      },
    });

    return null;
  }

  // Update map view to center location when location changes (only when focus is true)
  useEffect(() => {
    if (focusCurrentCoords && mapRef.current) {
      mapRef.current.setView(
        [currentCoords.lat, currentCoords.lon],
        mapRef.current.getZoom()
      );
    }
  }, [currentCoords, focusCurrentCoords]);

  // fix leaflet map invalid size
  useEffect(() => {
    const resizeInterval = setInterval(() => {
      if (mapRef.current) {
        mapRef.current.invalidateSize();
        clearInterval(resizeInterval);
      }
    }, 100);
  }, [location.pathname]);

  // Get center coordinates of map
  useEffect(() => {
    const getCenterInterval = setInterval(() => {
      if (mapRef.current) {
        setCenterCoords((prevState) => ({
          ...prevState,
          lat: mapRef.current.getCenter().lat,
          lon: mapRef.current.getCenter().lng,
        }));
      }
    }, 100);
    return () => clearInterval(getCenterInterval);
  }, []);

  function getCssVariableValue(variableName) {
    return getComputedStyle(document.documentElement).getPropertyValue(
      variableName
    );
  }

  useEffect(() => {
    if (center.lat !== undefined && center.lon !== undefined) {
      mapRef.current.setView([center.lat, center.lon], 20);
    }
  }, [center]);

  return (
    <div>
      {topContent}
      <div className="fixed h-screen top-0 w-screen -z-30">
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

          {currentCoords.valid && (
            <CircleMarker
              radius={10}
              center={[currentCoords.lat, currentCoords.lon]}
              fillColor={getCssVariableValue("--ion-color-secondary").trim()}
              color="white"
              fillOpacity={0.7}
            ></CircleMarker>
          )}
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
            <CircleMarker
              radius={7}
              center={[destinationCoords.lat, destinationCoords.lon]}
              color="white"
              fillColor={getCssVariableValue("--ion-color-tertiary").trim()}
              fillOpacity={1}
            ></CircleMarker>
          )}
          {mapPaths.map((mapPath) => (
            <span key={mapPath.key}>
              <Polyline
                positions={mapPath.path}
                color={
                  mapPath.type === "primary"
                    ? getCssVariableValue("--ion-color-secondary").trim()
                    : mapPath.type === "secondary"
                    ? getCssVariableValue("--ion-color-primary").trim()
                    : getCssVariableValue("--ion-color-secondary").trim()
                }
                weight={4}
                opacity={1}
                dashArray={mapPath.type === "secondary" ? "2, 12" : ""}
              />
            </span>
          ))}
        </MapContainer>
      </div>
      {bottomContent}
    </div>
  );
}

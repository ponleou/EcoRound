import { useEffect, useRef, useState } from "react";
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

export default function Travel({
  topContent,
  bottomContent,
  currentCoords,
  setCenterCoords,
  startCoords,
  destinationCoords,
  setMapEvents,
  mapPath,
  setCenter = { lat: undefined, lon: undefined },
}) {
  const mapRef = useRef(null);

  // map events
  function MapEvents() {
    useMapEvents({
      movestart: () => {
        setMapEvents((prevState) => ({ ...prevState, moving: true }));
      },
      moveend: () => {
        setMapEvents((prevState) => ({ ...prevState, moving: false }));
      },
      dragstart: () => {
        setMapEvents((prevState) => ({ ...prevState, dragging: true }));
      },
      dragend: () => {
        setMapEvents((prevState) => ({ ...prevState, dragging: false }));
      },
    });

    return null;
  }

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
  }, [location.pathname]);

  // Get center coordinates of map
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

  function getCssVariableValue(variableName) {
    return getComputedStyle(document.documentElement).getPropertyValue(
      variableName
    );
  }

  useEffect(() => {
    if (setCenter.lat !== undefined && setCenter.lon !== undefined) {
      mapRef.current.setView([setCenter.lat, setCenter.lon], 20);
    }
  }, [setCenter]);

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
          {mapPath.length > 0 ? (
            <Polyline
              positions={mapPath}
              color={getCssVariableValue("--ion-color-secondary").trim()}
              weight={4}
              opacity={1}
            />
          ) : null}
        </MapContainer>
      </div>
      {bottomContent}
    </div>
  );
}

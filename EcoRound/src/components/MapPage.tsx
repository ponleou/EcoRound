import { IonPage, IonContent, IonHeader } from "@ionic/react";
import { useEffect, useRef, useState } from "react";
import {
  CircleMarker,
  MapContainer,
  Marker,
  TileLayer,
  useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "./MapPage.css";

export default function Travel({
  header,
  topContent,
  bottomContent,
  currentCoords,
  setCenterCoords,
  startCoords,
  destinationCoords,
  setMapEvents,
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
  }, []);

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

  return (
    <IonPage>
      <IonHeader className="shadow-none border-0 outline-0">{header}</IonHeader>
      <IonContent>
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
          </MapContainer>
        </div>
        {bottomContent}
      </IonContent>
    </IonPage>
  );
}

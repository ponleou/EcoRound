import { StatusBar, Style } from "@capacitor/status-bar";
import {
  IonPage,
  IonContent,
  IonButton,
  useIonRouter,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonIcon,
  IonModal,
} from "@ionic/react";
import { useEffect, useRef, useState } from "react";
import HeaderBar from "../components/HeaderBar";
import { print, searchSharp } from "ionicons/icons";
import "./Travel.css";
import { MapContainer, Marker, Popup } from "react-leaflet";
import { TileLayer, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Geolocation } from "@capacitor/geolocation";

// Custom component to update the map view
function MapUpdater({ lat, lon }) {
  const map = useMap(); // Get access to the Leaflet map instance

  useEffect(() => {
    if (lat && lon) {
      map.setView([lat, lon], map.getZoom()); // Change center of the map
    }
  }, [lat, lon, map]); // Run effect when lat or lon changes

  return null; // This component does not render anything visible
}

export default function Travel() {
  // essential for modal
  const modal = useRef<HTMLIonModalElement>(null);

  const [searchInput, setSearchInput] = useState("");
  // status determines if location is available (false when permission is denied)
  const [currentCoords, setCurrentCoords] = useState({
    lat: 0,
    lon: 0,
    status: false,
  });

  // fix leaflet map incorrect size rendering
  setTimeout(function () {
    window.dispatchEvent(new Event("resize"));
  }, 1000);

  // Get current location
  const getCurrentCoords = async () => {
    const location = await Geolocation.getCurrentPosition();
    setCurrentCoords({
      lat: location.coords.latitude,
      lon: location.coords.longitude,
      status: true,
    });
  };

  const checkLocationPermission = async () => {
    let permission = await Geolocation.checkPermissions();
    if (permission.location === "prompt") {
      permission = await Geolocation.requestPermissions();
    }
    return permission.location;
  };

  useEffect(() => {
    checkLocationPermission().then((permission) => {
      if (permission === "granted") {
        getCurrentCoords();
      }
      if (permission === "denied") {
        console.log("Location permission denied");
        setCurrentCoords({ ...currentCoords, status: false });
      }
    });
  }, []);

  return (
    <IonPage>
      <IonHeader className="shadow-none border-0 outline-0">
        <HeaderBar title="Travel" color="primary" isStatusDark={true} />
      </IonHeader>
      <IonContent>
        {/* Search header */}
        <div className="bg-primary flex justify-center p-4 rounded-b-3xl shadow-lg">
          {/* Search bar */}
          <div className="flex-grow flex rounded-full bg-white items-center justify-between pl-4">
            <IonIcon icon={searchSharp}></IonIcon>
            <input
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Find a location"
              className="border-0 outline-none bg-white rounded-r-full flex-grow pl-3 pr-4 py-2"
              type="text"
              name=""
              id=""
            />
          </div>
        </div>

        <div className="fixed h-screen top-0 w-screen -z-30">
          <MapContainer
            center={[currentCoords.lat, currentCoords.lon]}
            zoom={13}
            zoomControl={false}
            trackResize={true}
            bounceAtZoomLimits={false}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapUpdater lat={currentCoords.lat} lon={currentCoords.lon} />
            <Marker position={[currentCoords.lat, currentCoords.lon]}>
              <Popup>
                A pretty CSS3 popup. <br /> Easily customizable.
              </Popup>
            </Marker>
          </MapContainer>
        </div>

        {/* Modal */}
        <IonModal
          className="rounded-t-3l"
          ref={modal}
          trigger="open-modal"
          isOpen={true}
          initialBreakpoint={0.5}
          breakpoints={[0.05, 0.25, 0.5, 0.75]}
          backdropDismiss={false}
          backdropBreakpoint={0.5}
        >
          <div className="bg-primary h-full px-4 pb-4 pt-6 flex flex-col gap-4">
            {/* Cards inside modal */}
            <div className="bg-white rounded-lg">
              test
              <p>test</p>
            </div>
            <div className="bg-white">
              {currentCoords.status
                ? "lat:" + currentCoords.lat + ", " + "lon:" + currentCoords.lon
                : "Location not available"}
            </div>
            <div className="bg-white">tes2</div>
            <div className="bg-white">test3</div>
          </div>
        </IonModal>
      </IonContent>
    </IonPage>
  );
}

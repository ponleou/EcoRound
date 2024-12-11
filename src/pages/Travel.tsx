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
  IonText,
  IonRouterOutlet,
} from "@ionic/react";
import { useEffect, useRef, useState } from "react";
import HeaderBar from "../components/HeaderBar";
import {
  ellipsisVertical,
  locate,
  locationSharp,
  print,
  searchSharp,
  swapVertical,
} from "ionicons/icons";
import "./Travel.css";
import { Geolocation } from "@capacitor/geolocation";
import Map from "../components/Map";
import { Route } from "react-router-dom";
import MapPage from "../components/MapPage";

export default function Travel() {
  // essential for modal
  const modal = useRef<HTMLIonModalElement>(null);
  const [openModal, setOpenModal] = useState(true);

  const [searchInput, setSearchInput] = useState("");

  // status determines if location is available (false when permission is denied)
  const [currentCoords, setCurrentCoords] = useState({
    lat: 0,
    lon: 0,
    status: true,
    focus: true,
  });

  // reference to interval for updating location
  const interval = useRef(null);

  // Get current location
  const getCurrentCoords = async () => {
    const location = await Geolocation.getCurrentPosition();
    setCurrentCoords((prevState) => ({
      ...prevState,
      lat: location.coords.latitude,
      lon: location.coords.longitude,
      status: true,
    }));
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

        interval.current = setInterval(() => {
          getCurrentCoords();
        }, 3000);
      } else if (permission === "denied") {
        console.log("Location permission denied"); //FIXME: remove this line
        setCurrentCoords((prevState) => ({ ...prevState, status: false }));
      }
    });

    return () => {
      if (interval.current) {
        clearInterval(interval.current);
      }
    };
  }, []);

  return (
    <MapPage
      header={<HeaderBar title="Travel" color="primary" />}
      topContent={
        <span>
          <div className="bg-primary flex justify-center p-4 rounded-b-3xl shadow-lg">
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
          <div className="flex flex-col items-end gap-4 m-4">
            <IonButton
              shape="round"
              color={currentCoords.focus ? "primary" : "light"}
              onClick={() => {
                setCurrentCoords((prevState) => ({
                  ...prevState,
                  focus: true,
                }));
              }}
            >
              <IonIcon slot="icon-only" icon={locate}></IonIcon>
            </IonButton>
          </div>
        </span>
      }
      bottomContent={
        <IonModal
          className="rounded-t-3l"
          ref={modal}
          trigger="open-modal"
          isOpen={openModal}
          initialBreakpoint={0.5}
          breakpoints={[0.05, 0.25, 0.5, 0.75]}
          backdropDismiss={false}
          backdropBreakpoint={0.5}
        >
          <div className="bg-primary h-full px-4 pb-4 pt-6 flex flex-col gap-4">
            {/* Cards inside modal */}
            <div className="bg-white rounded-lg grid grid-cols-[auto_1fr_auto] grid-rows-3 p-4 gap-x-4 items-center">
              <IonIcon color="secondary" icon={locate}></IonIcon>
              <IonText class="ion-padding-horizontal">
                {currentCoords.lat + ", " + currentCoords.lon}
              </IonText>
              <IonButton
                size="small"
                color="light"
                className="row-span-3"
                shape="round"
              >
                <IonIcon slot="icon-only" icon={swapVertical}></IonIcon>
              </IonButton>
              <IonIcon icon={ellipsisVertical}></IonIcon>
              <hr />
              <IonIcon color="tertiary" icon={locationSharp}></IonIcon>
              <IonText class="ion-padding-horizontal">Destination</IonText>
            </div>
            <div className="bg-white">
              {"lat:" + currentCoords.lat + ", " + "lon:" + currentCoords.lon}
              <br />
              {currentCoords.status ? "" : "Location not available"}
            </div>
            <div className="bg-white">tes2</div>
            <div className="bg-white">test3</div>
          </div>
        </IonModal>
      }
      currentCoords={currentCoords}
      setCurrentCoords={setCurrentCoords}
    ></MapPage>
  );
}

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
  pin,
  print,
  searchSharp,
  swapVertical,
} from "ionicons/icons";
import "./Travel.css";
import { Geolocation } from "@capacitor/geolocation";
import Map from "../components/Map";
import { Route } from "react-router-dom";
import MapPage from "../components/MapPage";
import { map } from "leaflet";
import { getPlaceName } from "../function/api.js";

export default function Travel({ match }) {
  const navigation = useIonRouter();

  const chooseLocationPath = useRef(`${match.url}/choose-location`);
  const [choosingLocation, setChoosingLocation] = useState(false);
  const [openModal, setOpenModal] = useState(true);

  const [searchInput, setSearchInput] = useState("");

  const [mapEvents, setMapEvents] = useState({
    moving: false,
    dragging: false,
  });

  // status determines if location is available (false when permission is denied)
  const [currentCoords, setCurrentCoords] = useState({
    lat: 0,
    lon: 0,
    status: false,
    focus: true,
  });

  const [startCoords, setStartCoords] = useState({
    lat: undefined,
    lon: undefined,
    label: "",
  });
  const [destinationCoords, setDestinationCoords] = useState({
    lat: undefined,
    lon: undefined,
    label: "",
  });
  const [centerCoords, setCenterCoords] = useState({
    lat: undefined,
    lon: undefined,
    label: "",
  });

  // handles focusing on current location
  const handleCurrentFocus = () => {
    setCurrentCoords((prevState) => ({ ...prevState, focus: true }));
  };

  useEffect(() => {
    if (mapEvents.dragging) {
      setCurrentCoords((prevState) => ({ ...prevState, focus: false }));
    }
  }, [mapEvents]);

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

  // location permissions
  const checkLocationPermission = async () => {
    let permission = await Geolocation.checkPermissions();
    if (permission.location === "prompt") {
      permission = await Geolocation.requestPermissions();
    }
    return permission.location;
  };

  // reference to interval for updating location
  const currentCoordsInterval = useRef(null);

  useEffect(() => {
    checkLocationPermission().then((permission) => {
      if (permission === "granted") {
        getCurrentCoords();

        currentCoordsInterval.current = setInterval(() => {
          getCurrentCoords();
        }, 3000);
      } else if (permission === "denied") {
        console.log("Location permission denied"); //FIXME: remove this line
        setCurrentCoords((prevState) => ({ ...prevState, status: false }));
      }
    });

    return () => {
      if (currentCoordsInterval.current) {
        clearInterval(currentCoordsInterval.current);
      }
    };
  }, []);

  // set start coords to current location for the first time when startcoord is undefined
  useEffect(() => {
    if (
      (startCoords.lat === undefined || startCoords.lon === undefined) &&
      currentCoords.status
    ) {
      setStartCoords((prevState) => ({
        ...prevState,
        lat: currentCoords.lat,
        lon: currentCoords.lon,
      }));
      try {
        getPlaceName(currentCoords.lat, currentCoords.lon).then((response) => {
          setStartCoords((prevState) => ({
            ...prevState,
            label: response.name,
          }));
        });
      } catch (error) {
        console.error(error); //FIXME: remove this line
        setStartCoords((prevState) => ({
          ...prevState,
          label: error.message,
        }));
      }
    }
  }, [currentCoords, startCoords]);

  // set destination or start coords to center coords with handling choosing state and selected location
  const functionSetter = useRef(null);

  const handleChooseLocation = (setFunction) => {
    navigation.push(chooseLocationPath.current);
    functionSetter.current = setFunction;
  };

  const handleSelectLocation = () => {
    navigation.goBack();
    functionSetter.current((prevState) => ({
      ...prevState,
      lat: centerCoords.lat,
      lon: centerCoords.lon,
      label: centerCoords.label,
    }));

    functionSetter.current = null;
  };

  // modify pages based on route
  useEffect(() => {
    if (location.pathname === chooseLocationPath.current) {
      setOpenModal(false);
      setChoosingLocation(true);
    }

    if (location.pathname === match.url) {
      setOpenModal(true);
      setChoosingLocation(false);
    }
  }, [location.pathname]);

  // fetching coordinate names
  const fetchPlaceName = async () => {
    try {
      const response = await getPlaceName(centerCoords.lat, centerCoords.lon);
      setCenterCoords((prevState) => ({
        ...prevState,
        label: response.name,
      }));
    } catch (error) {
      console.error(error); //FIXME: remove this line
      setCenterCoords((prevState) => ({
        ...prevState,
        label: error.message,
      }));
    }
  };

  useEffect(() => {
    if (choosingLocation) {
      if (!mapEvents.moving && centerCoords.lat && centerCoords.lon) {
        fetchPlaceName();
      } else {
        setCenterCoords((prevState) => ({
          ...prevState,
          label: "",
        }));
      }
    }
  }, [mapEvents]);

  return (
    <MapPage
      header={
        <HeaderBar
          title={!choosingLocation ? "Travel" : "Choose location"}
          color="primary"
        />
      }
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
              onClick={() => handleCurrentFocus()}
            >
              <IonIcon slot="icon-only" icon={locate}></IonIcon>
            </IonButton>
          </div>
        </span>
      }
      bottomContent={
        <span>
          <IonModal
            className="rounded-t-3l"
            trigger="open-modal"
            isOpen={openModal}
            initialBreakpoint={0.5}
            breakpoints={[0.05, 0.25, 0.5, 0.75]}
            backdropDismiss={false}
            backdropBreakpoint={0.5}
          >
            <div className="bg-primary h-full px-4 pb-4 pt-6 flex flex-col gap-4">
              {/* Cards inside modal */}
              {/* Card 1 */}
              <div className="bg-white rounded-lg grid grid-cols-[auto_1fr_auto] grid-rows-3 p-4 gap-x-4 items-center">
                <IonIcon color="secondary" icon={locate}></IonIcon>
                <IonText
                  className="truncate"
                  class="ion-padding-horizontal"
                  onClick={() => handleChooseLocation(setStartCoords)}
                >
                  {startCoords.lat === undefined ||
                  startCoords.lon === undefined
                    ? "Starting location"
                    : startCoords.label !== ""
                    ? startCoords.label
                    : startCoords.lat + ", " + startCoords.lon}
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
                <IonText
                  className="truncate"
                  class="ion-padding-horizontal"
                  onClick={() => handleChooseLocation(setDestinationCoords)}
                >
                  {destinationCoords.lat === undefined ||
                  destinationCoords.lon === undefined
                    ? "Set destination"
                    : destinationCoords.label !== ""
                    ? destinationCoords.label
                    : destinationCoords.lat + ", " + destinationCoords.lon}
                </IonText>
              </div>
              {/* Card 2 */}
              <div className="bg-white">
                {"lat:" + currentCoords.lat + ", " + "lon:" + currentCoords.lon}
                <br />
                {currentCoords.status ? "" : "Location not available"}
              </div>
              {/* Card 3 */}
              <div className="bg-white">tes2</div>
              {/* Card 4 */}
              <div className="bg-white">test3</div>
            </div>
          </IonModal>
          {choosingLocation ? (
            <div className="fixed bottom-0 left-0 right-0 bg-primary rounded-t-3xl p-4">
              <div className="bg-white rounded-lg p-4 flex flex-col gap-4">
                <div className="flex gap-4 items-center">
                  <IonIcon icon={locationSharp} color="tertiary"></IonIcon>
                  {centerCoords.label
                    ? centerCoords.label
                    : centerCoords.lat + ", " + centerCoords.lon}
                </div>
                <IonButton
                  shape="round"
                  expand="block"
                  color="secondary"
                  onClick={() => handleSelectLocation()}
                >
                  Select location
                </IonButton>
              </div>
            </div>
          ) : (
            ""
          )}
          {choosingLocation ? (
            <IonIcon
              color="tertiary"
              size="large"
              className="fixed bottom-1/2 right-1/2 transform translate-x-1/2"
              icon={pin}
            />
          ) : (
            ""
          )}
        </span>
      }
      currentCoords={currentCoords}
      setCenterCoords={setCenterCoords}
      startCoords={startCoords}
      destinationCoords={destinationCoords}
      setMapEvents={setMapEvents}
    ></MapPage>
  );
}

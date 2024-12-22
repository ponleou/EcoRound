import { StatusBar, Style } from "@capacitor/status-bar";
import {
  IonButton,
  useIonRouter,
  IonIcon,
  IonModal,
  IonText,
  IonPage,
  IonHeader,
  IonContent,
} from "@ionic/react";
import { useEffect, useRef, useState } from "react";
import HeaderBar from "../components/HeaderBar";
import {
  bicycle,
  car,
  chevronForward,
  compass,
  ellipsisVertical,
  locate,
  locationSharp,
  pin,
  searchSharp,
  swapVertical,
  walk,
} from "ionicons/icons";
import "./Travel.css";
import { Geolocation } from "@capacitor/geolocation";
import MapPage from "../components/MapPage";
import {
  getPlaceName,
  getBikeRoute,
  getCarRoute,
  getWalkRoute,
  getPlaceList,
} from "../function/api.js";
import RouteCardItem from "../components/RouteCardItem";
import SearchBar from "../components/SearchBar";
import TravelCard from "../components/TravelCard";
import TravelItem from "../components/TravelItem";
import { render } from "@testing-library/react";
import { i } from "vite/dist/node/types.d-aGj9QkWt";
import { Keyboard } from "@capacitor/keyboard";
import CardList from "../components/CardList";
import distance from "../function/calculateDistance";
import { icon } from "leaflet";

export default function Travel({ match }) {
  /*
  ========== GLOBAL FUNCTIONS ==========
  */
  // fetching place names for center coords
  const fetchPlaceName = async (coords, setCoords) => {
    try {
      const response = await getPlaceName(coords.lat, coords.lon);
      setCoords((prevState) => ({
        ...prevState,
        label: response.name,
      }));
    } catch (error) {
      setCoords((prevState) => ({
        ...prevState,
        label: error.message,
      }));
    }
  };

  const navigation = useIonRouter();

  /*
  ========== TRAVEL PAGE NAVIGATIONS ==========
  */
  // true if modal is rendered, false if not
  const renderModal = useRef(true);

  // reload modal by changing renderModal value to false and then back to true
  const reloadModal = () => {
    renderModal.current = false;

    setTimeout(() => {
      renderModal.current = true;
    }, 10);
  };

  // saving default modal settings
  const defaultModalSetting = useRef({
    isOpen: true,
    initialBreakpoint: 0.25,
    breakpoints: [0.05, 0.25, 0.5, 0.75],
    backdropDismiss: false,
    backdropBreakpoint: 0.5,
    showBackdrop: true,
  });
  // changing modal settings
  const [modalSettings, setModalSettings] = useState({
    ...defaultModalSetting.current,
  });

  const chooseLocationPath = useRef(`${match.url}/choose-location`);
  const searchLocationPath = useRef(`${match.url}/search-location`);
  const routePath = useRef(`${match.url}/route`);

  const [choosingLocation, setChoosingLocation] = useState(false);
  const [searchingLocation, setSearchingLocation] = useState(false);
  const [showingRoute, setShowingRoute] = useState(false);

  const activateSubpage = ({
    chooseLocation = false,
    searchLocation = false,
    showRoute = false,
  } = {}) => {
    setShowingRoute(showRoute);
    setSearchingLocation(searchLocation);
    setChoosingLocation(chooseLocation);
  };

  // modify pages based on route
  useEffect(() => {
    if (location.pathname === chooseLocationPath.current) {
      setModalSettings({ ...defaultModalSetting.current, isOpen: false });

      activateSubpage({ chooseLocation: true });
    }

    if (location.pathname === searchLocationPath.current) {
      setModalSettings({
        ...defaultModalSetting.current,
        showBackdrop: false,
        initialBreakpoint: 0.75,
        breakpoints: [0.75],
        backdropBreakpoint: 0.75,
      });

      reloadModal();

      activateSubpage({ searchLocation: true });

      if (inputRef.current) {
        const focusInterval = setInterval(() => {
          if (!inputIsFocused.current) {
            inputRef.current.focus();
            clearInterval(focusInterval);
            Keyboard.show();
          }
        }, 100);
      }
    }

    if (location.pathname === routePath.current) {
      setModalSettings({ ...defaultModalSetting.current });
      reloadModal();

      activateSubpage({ showRoute: true });
    }

    if (location.pathname === match.url) {
      setModalSettings({ ...defaultModalSetting.current });

      if (searchingLocation || choosingLocation) {
        reloadModal();
      }

      activateSubpage();
    }
  }, [location.pathname]);

  /*
  ========== CURRENT LOCATION ==========
  */
  // user's current location
  const [currentCoords, setCurrentCoords] = useState({
    lat: 0,
    lon: 0,
    status: false, // status determines if location is available (false when permission is denied)
    focus: true,
  });

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

  // update current location every interval (3 seconds)
  useEffect(() => {
    checkLocationPermission().then((permission) => {
      if (permission === "granted") {
        getCurrentCoords();

        currentCoordsInterval.current = setInterval(() => {
          getCurrentCoords();
        }, 3000);
      } else if (permission === "denied") {
        setCurrentCoords((prevState) => ({ ...prevState, status: false }));
      }
    });

    return () => {
      if (currentCoordsInterval.current) {
        clearInterval(currentCoordsInterval.current);
      }
    };
  }, []);

  /*
  ========== CENTERING MAP ==========
  */
  // center coords of map
  const [centerCoords, setCenterCoords] = useState({
    lat: undefined,
    lon: undefined,
    label: "",
  });

  // keep track of map events
  const [mapEvents, setMapEvents] = useState({
    moving: false,
    dragging: false,
  });

  // passed to set the ceenter of the map
  const [center, setCenter] = useState({ lat: undefined, lon: undefined });

  // handles focusing on current location
  const handleCurrentFocus = () => {
    setCurrentCoords((prevState) => ({ ...prevState, focus: true }));
  };

  useEffect(() => {
    if (mapEvents.dragging) {
      setCurrentCoords((prevState) => ({ ...prevState, focus: false }));
    }
  }, [mapEvents]);

  useEffect(() => {
    if (choosingLocation) {
      if (!mapEvents.moving && centerCoords.lat && centerCoords.lon) {
        fetchPlaceName(centerCoords, setCenterCoords);
      } else {
        setCenterCoords((prevState) => ({
          ...prevState,
          label: "",
        }));
      }
    }
  }, [mapEvents]);

  /*
  ========== START AND DESTINATION COORDS ==========
  */
  // start and destination coords
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
        label: "",
      }));
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

  // swap start and destination coords
  const handleCoordSwap = () => {
    const temp = destinationCoords;

    setDestinationCoords((prevState) => ({
      ...prevState,
      lat: startCoords.lat,
      lon: startCoords.lon,
      label: startCoords.label,
    }));

    setStartCoords((prevState) => ({
      ...prevState,
      lat: temp.lat,
      lon: temp.lon,
      label: temp.label,
    }));
  };

  // fetching place names for start and destination coords is label is not set
  useEffect(() => {
    if (
      startCoords.label === "" &&
      startCoords.lat !== undefined &&
      startCoords.lon !== undefined
    ) {
      fetchPlaceName(startCoords, setStartCoords);
    }
  }, [startCoords]);

  useEffect(() => {
    if (
      destinationCoords.label === "" &&
      destinationCoords.lat !== undefined &&
      destinationCoords.lon !== undefined
    ) {
      fetchPlaceName(destinationCoords, setDestinationCoords);
    }
  }, [destinationCoords]);

  /*
  ========== ROUTES ==========
  */
  const defaultRoute = useRef({
    coordinates: [],
    distance: "",
    duration: "",
    steps: [],
  });
  // fetched routes
  const [carRoute, setCarRoute] = useState({
    ...defaultRoute.current,
    loaded: false,
  });

  const [bikeRoute, setBikeRoute] = useState({
    ...defaultRoute.current,
    loaded: false,
  });

  const [walkRoute, setWalkRoute] = useState({
    ...defaultRoute.current,
    loaded: false,
  });

  const fetchRoutes = async (
    startCoords,
    destinationCoords,
    fetchRouteFunction,
    setRouteFunction
  ) => {
    try {
      // get route
      const response = await fetchRouteFunction(
        startCoords.lat,
        startCoords.lon,
        destinationCoords.lat,
        destinationCoords.lon
      );

      // caculate values for distance and duration
      let distance = Math.round(response.properties.segments[0].distance);
      let distanceKm =
        distance > 999 ? response.properties.segments[0].distance / 1000 : 0;

      let durationHr = Math.trunc(
        response.properties.segments[0].duration / 3600
      );
      let durationMin =
        response.properties.segments[0].duration / 60 - durationHr * 60;

      // set route information
      setRouteFunction((prevState) => ({
        ...prevState,
        coordinates: response.geometry.coordinates.map((coord) => [
          coord[1],
          coord[0],
        ]),
        distance: distanceKm
          ? `${distanceKm.toFixed(1)} km`
          : distance
          ? `${distance.toFixed(0)} m`
          : "",
        duration:
          (durationHr > 0 ? `${durationHr.toFixed(0)} hr ` : "") +
          (durationMin ? `${durationMin.toFixed(0)} min` : ""),
        steps: response.properties.segments[0].steps,
        loaded: true,
      }));
    } catch (error) {
      // set error if route is not found
      setRouteFunction((prevState) => ({
        ...prevState,
        loaded: false,
      }));
    }
  };

  useEffect(() => {
    if (
      startCoords.lat !== undefined &&
      startCoords.lon !== undefined &&
      destinationCoords.lat !== undefined &&
      destinationCoords.lon !== undefined
    ) {
      fetchRoutes(startCoords, destinationCoords, getWalkRoute, setWalkRoute);
      fetchRoutes(startCoords, destinationCoords, getBikeRoute, setBikeRoute);
      fetchRoutes(startCoords, destinationCoords, getCarRoute, setCarRoute);
    }
  }, [startCoords, destinationCoords]);

  const [displayRoute, setDisplayRoute] = useState({
    icon: locationSharp,
    destinationLabel: "",
    route: {
      ...defaultRoute.current,
    },
  });

  // polyline path for map to draw
  const [mapPath, setMapPath] = useState([]);

  // set route to display on page
  const handleRouteItem = (route, icon = null) => {
    if (!route.loaded) return;

    setDisplayRoute((prevState) => ({
      ...prevState,
      icon: icon ? icon : prevState.icon,
      destinationLabel: destinationCoords.label,
      route: {
        ...prevState.route,
        coordinates: route.coordinates,
        distance: route.distance,
        duration: route.duration,
        steps: route.steps,
      },
    }));

    navigation.push(routePath.current);
  };

  useEffect(() => {
    if (showingRoute) {
      setMapPath(displayRoute.route.coordinates);
    } else {
      setMapPath([]);
    }
  }, [showingRoute]);

  /*
  ========== SEARCH ==========
  */
  // for search bar
  const [searchInput, setSearchInput] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  const inputRef = useRef(null);
  const inputIsFocused = useRef(false);

  const handleSearch = () => {
    if (!searchingLocation) {
      navigation.push(searchLocationPath.current, "forward");
    }
  };

  const [debounceSearchInput, setDebounceSearchInput] = useState("");

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebounceSearchInput(searchInput);
    }, 500);

    return () => {
      clearTimeout(timeout);
    };
  }, [searchInput]);

  const searchPlace = async (text, saveResult) => {
    try {
      const response = await getPlaceList(
        text,
        centerCoords.lat,
        centerCoords.lon
      );
      saveResult(
        response.features
          .map((place) => ({
            name: place.properties.name,
            subLocation: place.properties.label,
            lat: place.geometry.coordinates[1],
            lon: place.geometry.coordinates[0],
            distance: currentCoords.status
              ? distance(
                  currentCoords.lat,
                  currentCoords.lon,
                  place.geometry.coordinates[1],
                  place.geometry.coordinates[0]
                ).toFixed(1) + " km"
              : "",
          }))
          .sort((a, b) => {
            const distanceA = parseFloat(a.distance);
            const distanceB = parseFloat(b.distance);
            return distanceA - distanceB;
          })
      );
    } catch (error) {
      return [];
    }
  };

  useEffect(() => {
    if (debounceSearchInput !== "") {
      searchPlace(debounceSearchInput, setSearchResults);
    }
  }, [debounceSearchInput]);

  const handleSelectResult = (lat, lon) => {
    setCenter((prevState) => ({
      ...prevState,
      lat: lat,
      lon: lon,
    }));

    setCurrentCoords((prevState) => ({
      ...prevState,
      focus: false,
    }));
    setSearchInput("");
    setSearchResults([]);
    navigation.goBack();
  };

  return (
    <IonPage>
      <IonHeader className="shadow-none border-0 outline-0">
        <HeaderBar
          title={
            choosingLocation
              ? "Choose location"
              : searchingLocation
              ? "Search location"
              : "Travel"
          }
          color="primary"
        />
      </IonHeader>
      <IonContent>
        <MapPage
          topContent={
            <span>
              <div className="bg-primary p-4 rounded-b-3xl shadow-lg">
                <span onClick={() => handleSearch()}>
                  <SearchBar
                    inputRef={inputRef}
                    setSearchInput={setSearchInput}
                    disabled={!searchingLocation}
                    isFocused={inputIsFocused.current}
                    searchInput={searchInput}
                  />
                </span>
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
              {renderModal.current && (
                <IonModal
                  className="rounded-t-3l"
                  trigger="open-modal"
                  isOpen={modalSettings.isOpen}
                  initialBreakpoint={modalSettings.initialBreakpoint}
                  breakpoints={modalSettings.breakpoints}
                  backdropDismiss={modalSettings.backdropDismiss}
                  backdropBreakpoint={modalSettings.backdropBreakpoint}
                  showBackdrop={modalSettings.showBackdrop}
                  keyboardClose={false}
                >
                  {/* Cards inside modal */}
                  <div className="bg-primary h-full px-4 pb-4 pt-6">
                    {searchingLocation ? (
                      // Cards for search location route
                      <div className="h-3/4 overflow-scroll rounded-lg">
                        <TravelCard>
                          <CardList>
                            {/* TODO: add current location */}
                            <span
                              onClick={() =>
                                handleSelectResult(
                                  currentCoords.lat,
                                  currentCoords.lon
                                )
                              }
                            >
                              <TravelItem
                                text={"Current location"}
                                subTexts={["Your current location"]}
                                iconText={"0 km"}
                                icon={locate}
                                iconColor="secondary"
                              ></TravelItem>
                            </span>
                            <hr />
                            {searchResults.map((result, index) => (
                              <span
                                key={index}
                                onClick={() =>
                                  handleSelectResult(result.lat, result.lon)
                                }
                              >
                                <TravelItem
                                  text={result.name}
                                  subTexts={[result.subLocation]}
                                  iconText={result.distance}
                                  iconColor="tertiary"
                                  icon={locationSharp}
                                ></TravelItem>
                              </span>
                            ))}
                          </CardList>
                        </TravelCard>
                      </div>
                    ) : showingRoute ? (
                      // Cards for showing a chosen route
                      <div className="h-3/4 overflow-scroll rounded-lg">
                        <TravelCard>
                          <CardList>
                            <TravelItem
                              iconText={""}
                              icon={displayRoute.icon}
                              text={displayRoute.destinationLabel}
                              subTexts={[
                                displayRoute.route.distance,
                                displayRoute.route.duration,
                                <span className="font-bold">
                                  {"200 Points"}
                                </span>,
                              ]}
                              iconSize="large"
                              ripple={false}
                            />
                          </CardList>
                        </TravelCard>
                      </div>
                    ) : (
                      // Cards for default travel route
                      <CardList>
                        {/* Card 1 */}
                        <TravelCard>
                          <div className="grid grid-cols-[auto_1fr_auto] grid-rows-3 gap-x-4 items-center">
                            {" "}
                            {/* TODO: create a card component */}
                            <IonIcon color="secondary" icon={locate}></IonIcon>
                            <p
                              className="truncate w-full"
                              onClick={() =>
                                handleChooseLocation(setStartCoords)
                              }
                            >
                              <IonText class="ion-padding-horizontal">
                                {startCoords.lat === undefined ||
                                startCoords.lon === undefined
                                  ? "Starting location"
                                  : startCoords.label !== ""
                                  ? startCoords.label
                                  : startCoords.lat + ", " + startCoords.lon}
                              </IonText>
                            </p>
                            <IonButton
                              size="small"
                              fill="clear"
                              color="dark"
                              className="row-span-3"
                              shape="round"
                              onClick={() => handleCoordSwap()}
                            >
                              <IonIcon
                                slot="icon-only"
                                icon={swapVertical}
                              ></IonIcon>
                            </IonButton>
                            <IonIcon icon={ellipsisVertical}></IonIcon>
                            <hr />
                            <IonIcon
                              color="tertiary"
                              icon={locationSharp}
                            ></IonIcon>
                            <p
                              className="truncate w-full"
                              onClick={() =>
                                handleChooseLocation(setDestinationCoords)
                              }
                            >
                              <IonText class="ion-padding-horizontal">
                                {destinationCoords.lat === undefined ||
                                destinationCoords.lon === undefined
                                  ? "Set destination"
                                  : destinationCoords.label !== ""
                                  ? destinationCoords.label
                                  : destinationCoords.lat +
                                    ", " +
                                    destinationCoords.lon}
                              </IonText>
                            </p>
                          </div>
                        </TravelCard>
                        {/* Card 2 */}
                        <TravelCard>
                          <CardList>
                            <span
                              onClick={() => handleRouteItem(walkRoute, walk)}
                            >
                              <RouteCardItem
                                text="Walk"
                                icon={walk}
                                route={walkRoute}
                              />
                            </span>
                            <hr />
                            <span
                              onClick={() =>
                                handleRouteItem(bikeRoute, bicycle)
                              }
                            >
                              <RouteCardItem
                                text="Bike"
                                icon={bicycle}
                                route={bikeRoute}
                              />
                            </span>
                            <hr />
                            <span
                              onClick={() => handleRouteItem(carRoute, car)}
                            >
                              <RouteCardItem
                                text="Car"
                                icon={car}
                                route={carRoute}
                              />
                            </span>
                          </CardList>
                        </TravelCard>
                      </CardList>
                    )}
                  </div>
                </IonModal>
              )}
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
          mapPath={mapPath}
          setCenter={center}
        ></MapPage>
      </IonContent>
    </IonPage>
  );
}

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
import { useContext, useEffect, useRef, useState } from "react";
import HeaderBar from "../components/HeaderBar";
import {
  arrowBack,
  arrowForward,
  arrowUp,
  bicycle,
  car,
  ellipsisVertical,
  locate,
  locationSharp,
  pin,
  swapVertical,
  train,
  walk,
} from "ionicons/icons";
import "./Travel.css";
import MapPage from "../components/MapPage";
import { getPlaceList } from "../function/api.js";
import RouteCardItem from "../components/RouteCardItem";
import SearchBar from "../components/SearchBar";
import TravelCard from "../components/TravelCard";
import TravelItem from "../components/TravelItem";
import { Keyboard } from "@capacitor/keyboard";
import CardList from "../components/CardList";
import distance from "../function/calculateDistance";
import { CoordinateContext } from "../context/CoordinateContext";
import MapCenterButton from "../components/MapCenterButton";
import { RouteContext } from "../context/RouteContext";

export default function Travel({ match }) {
  const {
    currentCoords,
    centerCoords,
    setCenter,
    startCoords,
    setStartCoords,
    destinationCoords,
    setDestinationCoords,
  } = useContext(CoordinateContext) as any;

  const { carRoute, bikeRoute, walkRoute, transitRoutes, defaultRoute } =
    useContext(RouteContext) as any;

  const [focusCurrentCoords, setFocusCurrentCoords] = useState(true);

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
      setModalSettings({
        ...defaultModalSetting.current,
        initialBreakpoint: 0.5,
        breakpoints: [0.5, 0.75],
      });
      reloadModal();

      activateSubpage({ showRoute: true });
    }

    if (location.pathname === match.url) {
      setModalSettings({ ...defaultModalSetting.current });

      if (searchingLocation || choosingLocation || showingRoute) {
        reloadModal();
      }

      activateSubpage();
    }
  }, [location.pathname]);

  // keep track of map events
  const [mapEvents, setMapEvents] = useState({
    moving: false,
    dragging: false,
  });

  useEffect(() => {
    if (mapEvents.dragging) {
      setFocusCurrentCoords(false);
    }
  }, [mapEvents]);

  /*
  ========== SETTING START AND DESTINATION COORDS ==========
  */

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

  /*
  ========== DISPLAYING ROUTES ==========
  */

  const [displayRoute, setDisplayRoute] = useState({
    icon: locationSharp,
    destinationLabel: "",
    route: {
      ...defaultRoute.current,
    },
  });

  // polyline path for map to draw
  const [mapPaths, setMapPaths] = useState([]);

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

    navigation.push(routePath.current, "forward");
  };

  useEffect(() => {
    if (showingRoute) {
      setMapPaths((prevState) => [
        ...prevState,
        ...displayRoute.route.coordinates,
      ]);
    } else {
      setMapPaths([]);
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
        response.places.map((place) => ({
          name: place.name,
          subLocation: place.label,
          lat: place.lat,
          lon: place.lon,
          distance: currentCoords.status
            ? distance(
                currentCoords.lat,
                currentCoords.lon,
                place.lat,
                place.lon
              ).toFixed(1) + " km"
            : "",
        }))
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

    setFocusCurrentCoords(false);
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
              : showingRoute
              ? "Route"
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
              <MapCenterButton
                setFocusCurrentCoords={setFocusCurrentCoords}
                focusCurrentCoords={focusCurrentCoords}
              ></MapCenterButton>
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
                            <hr />
                            <CardList>
                              {displayRoute.route.steps.map((step, index) => (
                                <TravelItem
                                  key={index}
                                  text={step.instruction}
                                  icon={
                                    step.instruction
                                      .toLowerCase()
                                      .includes("turn")
                                      ? step.instruction
                                          .toLowerCase()
                                          .includes("right")
                                        ? arrowForward
                                        : arrowBack
                                      : arrowUp
                                  }
                                  iconText={step.distance}
                                  subTexts={[step.duration]}
                                  ripple={false}
                                  iconColor={"secondary"}
                                />
                              ))}
                              <TravelItem
                                text={
                                  "Arrive at " + displayRoute.destinationLabel
                                }
                                icon={locationSharp}
                                iconText={""}
                                subTexts={[""]}
                                ripple={false}
                                iconColor={"tertiary"}
                              />
                            </CardList>
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
                                text="Transit"
                                icon={train}
                                isAvailable={transitRoutes.loaded}
                                routeStepsNames={
                                  transitRoutes.loaded
                                    ? transitRoutes.routes[0].segments.map(
                                        (segment) =>
                                          segment.transitSegment
                                            ? segment.transitNames.code
                                            : "-"
                                      )
                                    : []
                                }
                                routeDistance={
                                  transitRoutes.loaded
                                    ? transitRoutes.routes[0].distance
                                    : ""
                                }
                                routeDuration={
                                  transitRoutes.loaded
                                    ? transitRoutes.routes[0].duration
                                    : ""
                                }
                              />
                            </span>
                            <span
                              onClick={() => handleRouteItem(walkRoute, walk)}
                            >
                              <RouteCardItem
                                text="Walk"
                                icon={walk}
                                isAvailable={walkRoute.loaded}
                                routeStepsNames={
                                  walkRoute.loaded
                                    ? walkRoute.steps.map((step) => step.name)
                                    : []
                                }
                                routeDistance={
                                  walkRoute.loaded ? walkRoute.distance : ""
                                }
                                routeDuration={
                                  walkRoute.loaded ? walkRoute.duration : ""
                                }
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
                                isAvailable={bikeRoute.loaded}
                                routeStepsNames={
                                  bikeRoute.loaded
                                    ? bikeRoute.steps.map((step) => step.name)
                                    : []
                                }
                                routeDistance={
                                  bikeRoute.loaded ? bikeRoute.distance : ""
                                }
                                routeDuration={
                                  bikeRoute.loaded ? bikeRoute.duration : ""
                                }
                              />
                            </span>
                            <hr />
                            <span
                              onClick={() => handleRouteItem(carRoute, car)}
                            >
                              <RouteCardItem
                                text="Car"
                                icon={car}
                                isAvailable={carRoute.loaded}
                                routeStepsNames={
                                  carRoute.loaded
                                    ? carRoute.steps.map((step) => step.name)
                                    : []
                                }
                                routeDistance={
                                  carRoute.loaded ? carRoute.distance : ""
                                }
                                routeDuration={
                                  carRoute.loaded ? carRoute.duration : ""
                                }
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
          setMapEvents={setMapEvents}
          mapPaths={mapPaths}
          focusCurrentCoords={focusCurrentCoords}
        ></MapPage>
      </IonContent>
    </IonPage>
  );
}

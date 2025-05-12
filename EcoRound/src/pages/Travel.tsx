import {
  IonButton,
  useIonRouter,
  IonIcon,
  IonModal,
  IonText,
  IonPage,
  IonHeader,
  IonContent,
  IonToast,
} from "@ionic/react";
import { useContext, useEffect, useRef, useState } from "react";
import HeaderBar from "../components/HeaderBar";
import {
  arrowBack,
  arrowDownCircle,
  arrowForward,
  arrowUp,
  bicycle,
  bus,
  car,
  chevronDown,
  chevronForward,
  chevronUp,
  ellipsisVertical,
  locate,
  locationSharp,
  pin,
  removeCircle,
  stopCircle,
  swapVertical,
  trailSign,
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
import PermissionToast from "../components/PermissionToast";
import TransitRouteItem from "../components/TransitRouteItem";
import { DateContext } from "../context/DateContext";
import IconText from "../components/IconText";

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

  const { toCurrentTimezone, to12HourFormat } = useContext(DateContext) as any;

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
  const showRoutePath = useRef(`${match.url}/show-route`);
  const chooseTransitRoutePath = useRef(`${match.url}/transit-route`);
  const showTransitRoutePath = useRef(`${match.url}/transit-route/show-route`);

  const [choosingLocation, setChoosingLocation] = useState(false);
  const [searchingLocation, setSearchingLocation] = useState(false);
  const [showingRoute, setShowingRoute] = useState(false);
  const [choosingTransitRoutes, setChoosingTransitRoutes] = useState(false);
  const [showingTransitRoute, setShowingTransitRoute] = useState(false);

  const activateSubpage = ({
    chooseLocation = false,
    searchLocation = false,
    showRoute = false,
    chooseTransitRoute = false,
    showTransitRoute = false,
  } = {}) => {
    setShowingRoute(showRoute);
    setSearchingLocation(searchLocation);
    setChoosingLocation(chooseLocation);
    setChoosingTransitRoutes(chooseTransitRoute);
    setShowingTransitRoute(showTransitRoute);
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

    if (location.pathname === showRoutePath.current) {
      setModalSettings({
        ...defaultModalSetting.current,
        initialBreakpoint: 0.5,
        breakpoints: [0.5, 0.75],
      });
      reloadModal();

      activateSubpage({ showRoute: true });
    }

    if (location.pathname === showTransitRoutePath.current) {
      setModalSettings({
        ...defaultModalSetting.current,
        initialBreakpoint: 0.5,
        breakpoints: [0.5, 0.75],
      });
      reloadModal();

      activateSubpage({ showTransitRoute: true });
    }

    if (location.pathname === chooseTransitRoutePath.current) {
      setModalSettings({
        ...defaultModalSetting.current,
      });
      reloadModal();

      activateSubpage({ chooseTransitRoute: true });
    }

    if (location.pathname === match.url) {
      setModalSettings({ ...defaultModalSetting.current });

      if (
        searchingLocation ||
        choosingLocation ||
        showingRoute ||
        choosingTransitRoutes
      ) {
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
        emission: route.emission,
        points: route.points,
      },
    }));

    navigation.push(showRoutePath.current, "forward");
  };

  // set transit route to display on page
  const handleTransitRoute = () => {
    navigation.push(chooseTransitRoutePath.current, "forward");
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
  ========== DISPLAYING TRANSIT ROUTES ==========
  */

  const [selectedTransitRoute, setSelectedTransitRoute] = useState({
    icon: locationSharp,
    destinationLabel: "",
    route: {
      coordinates: [],
      distance: "",
      duration: "",
      emission: "",
      segments: [],
      points: "",
    },
  });

  const handleSelectTransitRoute = (route) => {
    setSelectedTransitRoute((prevState) => ({
      ...prevState,
      icon: train,
      destinationLabel: destinationCoords.label,
      route: {
        ...prevState.route,
        coordinates: route.coordinates,
        distance: route.distance,
        duration: route.duration,
        emission: route.emission,
        segments: route.segments,
        points: route.points,
      },
    }));

    navigation.push(showTransitRoutePath.current, "forward");
  };

  useEffect(() => {
    if (showingTransitRoute) {
      setMapPaths((prevState) => [
        ...prevState,
        ...selectedTransitRoute.route.coordinates,
      ]);
    } else {
      setMapPaths([]);
    }
  }, [showingTransitRoute]);

  const toggleMiddleStopArray = useRef([]);

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
          distance:
            currentCoords.status && currentCoords.valid
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
              : showingRoute || showingTransitRoute
              ? "Route"
              : choosingTransitRoutes
              ? "Transit routes"
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
              {/* <PermissionToast /> */}
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
                                iconText={""}
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
                                displayRoute.route.emission,
                                <span className="font-bold">
                                  {displayRoute.route.points}
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
                    ) : showingTransitRoute ? (
                      <div className="h-3/4 overflow-scroll rounded-lg">
                        <TravelCard>
                          <CardList>
                            <TravelItem
                              iconText={""}
                              icon={selectedTransitRoute.icon}
                              text={selectedTransitRoute.destinationLabel}
                              subTexts={[
                                selectedTransitRoute.route.distance,
                                selectedTransitRoute.route.duration,
                                selectedTransitRoute.route.emission,
                                <span className="font-bold">
                                  {selectedTransitRoute.route.points}
                                </span>,
                              ]}
                              iconSize="large"
                              ripple={false}
                            />
                            <hr />
                            <CardList>
                              {selectedTransitRoute.route.segments.map(
                                (segment, index) => {
                                  toggleMiddleStopArray.current.push(false);
                                  return segment.transitSegment ? (
                                    <div
                                      onClick={() => {
                                        toggleMiddleStopArray.current[index] =
                                          !toggleMiddleStopArray.current[index];
                                        console.log("clicked");
                                      }}
                                      key={index}
                                      className="grid grid-cols-[auto,1fr] gap-x-4 items-center px-2"
                                    >
                                      <p className="self-center w-fit text-xs">
                                        <IonText>
                                          {
                                            to12HourFormat(
                                              toCurrentTimezone(
                                                segment.start.date +
                                                  "T" +
                                                  segment.start.time
                                              ).split("T")[1]
                                            ).split("+")[0]
                                          }
                                        </IonText>
                                      </p>
                                      <TravelItem
                                        ripple={false}
                                        iconText={
                                          segment.mode[0].toUpperCase() +
                                          segment.mode.substr(1).toLowerCase()
                                        }
                                        icon={
                                          segment.mode.toLowerCase() === "bus"
                                            ? bus
                                            : null
                                        }
                                        subTexts={[
                                          segment.stops.middleStops.length +
                                            (segment.stops.startStop ? 1 : 0) +
                                            (segment.stops.endStop ? 1 : 0) +
                                            " stops",
                                          segment.duration,
                                        ]}
                                        text={
                                          segment.transitNames.code +
                                          " - " +
                                          segment.mode[0].toUpperCase() +
                                          segment.mode.substr(1).toLowerCase() +
                                          " to " +
                                          segment.transitNames.headsign
                                        }
                                      ></TravelItem>
                                      <div></div>
                                      <div>
                                        <CardList>
                                          <div className="flex gap-4">
                                            <div className="text-sm flex flex-col gap-4 grow px-2 pb-4">
                                              {segment.stops.startStop ? (
                                                <IconText
                                                  icon={arrowDownCircle}
                                                  col={false}
                                                  text={segment.stops.startStop}
                                                  iconColor="secondary"
                                                  iconSize="small"
                                                ></IconText>
                                              ) : null}
                                              {toggleMiddleStopArray.current[
                                                index
                                              ]
                                                ? segment.stops.middleStops.map(
                                                    (stop, index) => (
                                                      <IconText
                                                        icon={arrowDownCircle}
                                                        col={false}
                                                        text={stop}
                                                        iconColor="secondary"
                                                        key={index}
                                                        iconSize="small"
                                                      ></IconText>
                                                    )
                                                  )
                                                : null}
                                              {segment.stops.endStop ? (
                                                <IconText
                                                  icon={stopCircle}
                                                  col={false}
                                                  text={segment.stops.endStop}
                                                  iconColor="tertiary"
                                                  iconSize="small"
                                                ></IconText>
                                              ) : null}
                                            </div>
                                            <IonIcon
                                              className={
                                                (toggleMiddleStopArray.current[
                                                  index
                                                ]
                                                  ? " rotate-180 "
                                                  : "") +
                                                "transform transition-all"
                                              }
                                              icon={chevronUp}
                                              size="small"
                                            ></IonIcon>
                                          </div>
                                        </CardList>
                                      </div>
                                    </div>
                                  ) : (
                                    <div
                                      key={index}
                                      className="flex gap-4 items-center px-2"
                                    >
                                      <p className="self-center w-fit text-xs">
                                        <IonText>
                                          {
                                            to12HourFormat(
                                              toCurrentTimezone(
                                                segment.start.date +
                                                  "T" +
                                                  segment.start.time
                                              ).split("T")[1]
                                            ).split("+")[0]
                                          }
                                        </IonText>
                                      </p>
                                      <TravelItem
                                        ripple={false}
                                        iconText={
                                          segment.mode[0].toUpperCase() +
                                          segment.mode.substr(1).toLowerCase()
                                        }
                                        icon={
                                          segment.mode.toLowerCase() === "walk"
                                            ? walk
                                            : null
                                        }
                                        subTexts={[
                                          segment.distance,
                                          segment.duration,
                                        ]}
                                        text={
                                          "To " +
                                          (segment.stops.endStop !== ""
                                            ? segment.stops.endStop
                                            : "Destination")
                                        }
                                      ></TravelItem>
                                    </div>
                                  );
                                }
                              )}
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
                          {choosingTransitRoutes ? (
                            <CardList>
                              {transitRoutes.loaded ? (
                                transitRoutes.routes.map((route, index) => (
                                  <span
                                    key={index}
                                    onClick={() => {
                                      handleSelectTransitRoute(route);
                                    }}
                                  >
                                    <TransitRouteItem
                                      startTime={`${route.start.date}T${route.start.time}`}
                                      endTime={`${route.end.date}T${route.end.time}`}
                                      points={route.points}
                                      subTexts={[
                                        route.distance,
                                        route.duration,
                                        route.emission,
                                      ]}
                                      paths={route.segments.map((segment) =>
                                        segment.transitSegment
                                          ? {
                                              isTransit: true,
                                              mode: segment.mode,
                                              code: segment.transitNames.code,
                                            }
                                          : {
                                              isTransit: false,
                                              mode: segment.mode,
                                              duration: segment.duration,
                                            }
                                      )}
                                    ></TransitRouteItem>
                                    {index <
                                      transitRoutes.routes.length - 1 && <hr />}
                                  </span>
                                ))
                              ) : (
                                <IonText>No routes found</IonText>
                              )}
                            </CardList>
                          ) : (
                            <CardList>
                              <span onClick={() => handleTransitRoute()}>
                                <RouteCardItem
                                  iconText="Transit"
                                  points={
                                    transitRoutes.loaded
                                      ? transitRoutes.routes[0].points
                                      : ""
                                  }
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
                                  routeDescriptions={
                                    transitRoutes.loaded
                                      ? [
                                          transitRoutes.routes[0].distance,
                                          transitRoutes.routes[0].duration,
                                          transitRoutes.routes[0].emission,
                                        ]
                                      : []
                                  }
                                />
                              </span>
                              <hr />

                              <span
                                onClick={() =>
                                  walkRoute.loaded &&
                                  handleRouteItem(walkRoute, walk)
                                }
                              >
                                <RouteCardItem
                                  iconText="Walk"
                                  points={
                                    walkRoute.loaded ? walkRoute.points : ""
                                  }
                                  icon={walk}
                                  isAvailable={walkRoute.loaded}
                                  routeStepsNames={
                                    walkRoute.loaded
                                      ? walkRoute.steps.map((step) => step.name)
                                      : []
                                  }
                                  routeDescriptions={
                                    walkRoute.loaded
                                      ? [
                                          walkRoute.distance,
                                          walkRoute.duration,
                                          walkRoute.emission,
                                        ]
                                      : []
                                  }
                                />
                              </span>
                              <hr />
                              <span
                                onClick={() =>
                                  bikeRoute.loaded &&
                                  handleRouteItem(bikeRoute, bicycle)
                                }
                              >
                                <RouteCardItem
                                  iconText="Bike"
                                  points={
                                    bikeRoute.loaded ? bikeRoute.points : ""
                                  }
                                  icon={bicycle}
                                  isAvailable={bikeRoute.loaded}
                                  routeStepsNames={
                                    bikeRoute.loaded
                                      ? bikeRoute.steps.map((step) => step.name)
                                      : []
                                  }
                                  routeDescriptions={
                                    bikeRoute.loaded
                                      ? [
                                          bikeRoute.distance,
                                          bikeRoute.duration,
                                          bikeRoute.emission,
                                        ]
                                      : []
                                  }
                                />
                              </span>
                              <hr />
                              <span
                                onClick={() =>
                                  carRoute.loaded &&
                                  handleRouteItem(carRoute, car)
                                }
                              >
                                <RouteCardItem
                                  iconText="Car"
                                  points={
                                    carRoute.loaded ? carRoute.points : ""
                                  }
                                  icon={car}
                                  isAvailable={carRoute.loaded}
                                  routeStepsNames={
                                    carRoute.loaded
                                      ? carRoute.steps.map((step) => step.name)
                                      : []
                                  }
                                  routeDescriptions={
                                    carRoute.loaded
                                      ? [
                                          carRoute.distance,
                                          carRoute.duration,
                                          carRoute.emission,
                                        ]
                                      : []
                                  }
                                />
                              </span>
                            </CardList>
                          )}
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

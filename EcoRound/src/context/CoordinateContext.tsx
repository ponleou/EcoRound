import { createContext, useEffect, useRef, useState } from "react";
import { getPlaceName } from "../function/api";
import { Geolocation } from "@capacitor/geolocation";

const CoordinateContext = createContext({});

function CoordinateProvider({ children }) {
  // TODO: Global function
  const setPlaceName = async (coords, setCoords) => {
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

  // ==============================

  // user's current location
  const [currentCoords, setCurrentCoords] = useState({
    lat: 0,
    lon: 0,
    status: false, // status determines if location is available (false when permission is denied)
  });

  const focusCurrentCoords = useRef(true);

  // Get current location
  const updateCurrentCoords = async () => {
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
        updateCurrentCoords();

        currentCoordsInterval.current = setInterval(() => {
          updateCurrentCoords();
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

  // ==============================

  // center coords of map
  const [centerCoords, setCenterCoords] = useState({
    lat: undefined,
    lon: undefined,
    label: "",
  });

  const [roundedCenterCoords, setRoundedCenterCoords] = useState({
    lat: undefined,
    lon: undefined,
  });

  const [debounceCenterCoords, setDebounceCenterCoords] = useState({
    lat: undefined,
    lon: undefined,
  });

  useEffect(() => {
    if (
      Math.round(centerCoords.lat * 10000) / 10000 !==
        roundedCenterCoords.lat ||
      Math.round(centerCoords.lon * 10000) / 10000 !== roundedCenterCoords.lon
    ) {
      setRoundedCenterCoords((prevState) => ({
        ...prevState,
        lat: Math.round(centerCoords.lat * 10000) / 10000,
        lon: Math.round(centerCoords.lon * 10000) / 10000,
      }));
    }
  }, [centerCoords]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebounceCenterCoords((prevState) => ({
        ...prevState,
        lat: centerCoords.lat,
        lon: centerCoords.lon,
      }));
    }, 500);

    return () => {
      clearTimeout(timeout);
    };
  }, [roundedCenterCoords]);

  useEffect(() => {
    if (
      debounceCenterCoords.lat !== undefined &&
      debounceCenterCoords.lon !== undefined
    ) {
      setPlaceName(debounceCenterCoords, setCenterCoords);
    }
  }, [debounceCenterCoords]);

  // passed to set the ceenter of the map
  const [center, setCenter] = useState({ lat: undefined, lon: undefined });

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

  // fetching place names for start and destination coords is label is not set
  useEffect(() => {
    if (
      startCoords.label === "" &&
      startCoords.lat !== undefined &&
      startCoords.lon !== undefined
    ) {
      setPlaceName(startCoords, setStartCoords);
    }
  }, [startCoords]);

  useEffect(() => {
    if (
      destinationCoords.label === "" &&
      destinationCoords.lat !== undefined &&
      destinationCoords.lon !== undefined
    ) {
      setPlaceName(destinationCoords, setDestinationCoords);
    }
  }, [destinationCoords]);

  return (
    <CoordinateContext.Provider
      value={{
        currentCoords,
        focusCurrentCoords,
        centerCoords,
        setCenterCoords,
        center,
        setCenter,
        startCoords,
        setStartCoords,
        destinationCoords,
        setDestinationCoords,
      }}
    >
      {children}
    </CoordinateContext.Provider>
  );
}

export { CoordinateProvider, CoordinateContext };

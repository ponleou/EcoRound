import { createContext, useEffect, useRef, useState } from "react";
import { getPlaceName } from "../function/api";
import { Geolocation } from "@capacitor/geolocation";
import { checkValidCoords } from "../function/api";

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
        label: "Error fetching name",
      }));
    }
  };

  // ==============================

  // user's current location
  const [currentCoords, setCurrentCoords] = useState({
    lat: 0,
    lon: 0,
    status: true, // status determines if location is available (false when permission is denied)
    valid: true, // valid determines if location is supported (false when location is not supported)
    enabled: true, // enabled determines if location is enabled (false when location is disabled), only used for toast, treated as permission denied
  });

  // Get current location
  const updateCurrentCoords = async () => {
    const location = await Geolocation.getCurrentPosition();
    setCurrentCoords((prevState) => ({
      ...prevState,
      lat: location.coords.latitude,
      lon: location.coords.longitude,
      status: true,
      valid: true,
    }));
  };

  // location permissions
  const checkLocationPermission = async () => {
    try {
      let permission = await Geolocation.checkPermissions();
      if (
        permission.location === "prompt" ||
        permission.location === "prompt-with-rationale"
      ) {
        permission = await Geolocation.requestPermissions();
      }

      if (permission.location === "granted") {
        const location = await Geolocation.getCurrentPosition();
        try {
          await checkValidCoords(
            location.coords.latitude,
            location.coords.longitude
          );
        } catch (error) {
          return "invalid";
        }
      }

      return permission.location;
    } catch (error) {
      return "disabled";
    }
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
        setCurrentCoords((prevState) => ({
          ...prevState,
          status: false,
          lat: -6.1944,
          lon: 106.8229,
          valid: false,
        }));
      } else if (permission === "invalid") {
        setCurrentCoords((prevState) => ({
          ...prevState,
          status: true,
          lat: -6.1944,
          lon: 106.8229,
          valid: false,
        }));
      } else if (permission === "disabled") {
        setCurrentCoords((prevState) => ({
          ...prevState,
          status: false,
          lat: -6.1944,
          lon: 106.8229,
          valid: false,
          enabled: false,
        }));
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

  const [debounceStartCoords, setDebounceStartCoords] = useState({
    lat: undefined,
    lon: undefined,
  });

  const [debounceDestinationCoords, setDebounceDestinationCoords] = useState({
    lat: undefined,
    lon: undefined,
  });

  // set start coords to current location for the first time when startcoord is undefined
  useEffect(() => {
    if (
      (startCoords.lat === undefined || startCoords.lon === undefined) &&
      currentCoords.status &&
      currentCoords.valid &&
      (currentCoords.lat || startCoords.lat)
    ) {
      setStartCoords((prevState) => ({
        ...prevState,
        lat: currentCoords.lat,
        lon: currentCoords.lon,
        label: "",
      }));
    }
  }, [currentCoords, startCoords]);

  useEffect(() => {
    if (
      (startCoords.lat !== undefined || startCoords.lon !== undefined) &&
      (Math.round(startCoords.lat * 10000) / 10000 !==
        debounceStartCoords.lat ||
        Math.round(startCoords.lon * 10000) / 10000 !== debounceStartCoords.lon)
    ) {
      setDebounceStartCoords((prevState) => ({
        ...prevState,
        lat: Math.round(startCoords.lat * 10000) / 10000,
        lon: Math.round(startCoords.lon * 10000) / 10000,
      }));
    }
  }, [startCoords]);

  // fetching place names for start and destination coords is label is not set
  useEffect(() => {
    if (
      debounceStartCoords.lat !== undefined &&
      debounceStartCoords.lon !== undefined
    ) {
      setPlaceName(debounceStartCoords, setStartCoords);
    }
  }, [debounceStartCoords]);

  useEffect(() => {
    if (
      (destinationCoords.lat !== undefined ||
        destinationCoords.lon !== undefined) &&
      (Math.round(destinationCoords.lat * 10000) / 10000 !==
        debounceDestinationCoords.lat ||
        Math.round(destinationCoords.lon * 10000) / 10000 !==
          debounceDestinationCoords.lon)
    ) {
      setDebounceDestinationCoords((prevState) => ({
        ...prevState,
        lat: Math.round(destinationCoords.lat * 10000) / 10000,
        lon: Math.round(destinationCoords.lon * 10000) / 10000,
      }));
    }
  }, [destinationCoords]);

  useEffect(() => {
    if (
      debounceDestinationCoords.lat !== undefined &&
      debounceDestinationCoords.lon !== undefined
    ) {
      setPlaceName(debounceDestinationCoords, setDestinationCoords);
    }
  }, [debounceDestinationCoords]);

  return (
    <CoordinateContext.Provider
      value={{
        currentCoords,
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

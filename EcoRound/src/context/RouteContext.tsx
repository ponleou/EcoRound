import { createContext, useContext, useEffect, useRef, useState } from "react";
import { CoordinateContext } from "./CoordinateContext";
import {
  getBikeRoute,
  getCarRoute,
  getWalkRoute,
  getTransitRoute,
} from "../function/api.js";

const RouteContext = createContext({});

function RouteProvider({ children }) {
  const { startCoords, destinationCoords } = useContext(
    CoordinateContext
  ) as any;

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

  const formatDistanceString = (distance) => {
    let distanceM = Math.round(distance);
    let distanceKm = distance > 999 ? distance / 1000 : 0;

    return distanceKm
      ? `${distanceKm.toFixed(1)} km`
      : distanceM
      ? `${distance.toFixed(0)} m`
      : "";
  };

  const formatDurationString = (duration) => {
    let durationHr = Math.trunc(duration / 3600);
    let durationMin = duration / 60 - durationHr * 60;

    return (
      (durationHr > 0 ? `${durationHr.toFixed(0)} hr ` : "") +
      (durationMin ? `${durationMin.toFixed(0)} min` : "")
    );
  };

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

      // set route information
      setRouteFunction((prevState) => ({
        ...prevState,
        coordinates: [{ path: response.path, type: "primary" }],
        distance: formatDistanceString(response.distance),
        duration: formatDurationString(response.duration),
        steps: response.steps.map((step) => ({
          ...step,
          distance: formatDistanceString(step.distance),
          duration: formatDurationString(step.duration),
        })),
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

  /*
      ---------- TRANSIT ROUTES ----------
      */

  const [transitRoutes, setTransitRoutes] = useState({
    routes: [],
    loaded: false,
  });

  const fetchTransitRoutes = async (
    startCoords,
    destinationCoords,
    getTransitRoutes,
    setTransitRoutes
  ) => {
    try {
      const response = await getTransitRoutes(
        startCoords.lat,
        startCoords.lon,
        destinationCoords.lat,
        destinationCoords.lon
      );

      setTransitRoutes({
        routes: response.routes.map((route) => ({
          distance: formatDistanceString(route.distance),
          duration: formatDurationString(route.duration),
          segments: route.segments.map((segment) =>
            segment.transitSegment
              ? {
                  distance: formatDistanceString(segment.distance),
                  duration: formatDurationString(segment.duration),
                  transitSegment: segment.transitSegment,
                  mode: segment.mode,
                  stops: segment.stops,
                  transitNames: segment.transitNames,
                }
              : {
                  distance: formatDistanceString(segment.distance),
                  duration: formatDurationString(segment.duration),
                  transitSegment: segment.transitSegment,
                  mode: segment.mode,
                  steps: segment.steps.map((step) => ({
                    distance: formatDistanceString(step.distance),
                    duration: formatDurationString(step.duration),
                    instruction: step.instruction,
                    name: step.name,
                  })),
                  stops: segment.stops,
                }
          ),
          paths: route.segments.map((segment) => ({
            type: segment.transitSegment ? "primary" : "secondary",
            path: segment.path,
          })),
        })),
        loaded: true,
      });
    } catch (error) {
      setTransitRoutes({ routes: [], loaded: false });
      console.log(error);
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
      fetchTransitRoutes(
        startCoords,
        destinationCoords,
        getTransitRoute,
        setTransitRoutes
      );
    }
  }, [startCoords, destinationCoords]);

  return (
    <RouteContext.Provider
      value={{ carRoute, bikeRoute, walkRoute, transitRoutes, defaultRoute }}
    >
      {children}
    </RouteContext.Provider>
  );
}

export { RouteContext, RouteProvider };

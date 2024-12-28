import { createContext, useContext, useEffect, useRef, useState } from "react";
import { CoordinateContext } from "./CoordinateContext";
import {
  getBikeRoute,
  getCarRoute,
  getWalkRoute,
  getTransitRoute,
  pointsCalculation,
} from "../function/api.js";
import { car } from "ionicons/icons";

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
    emission: "",
    points: "",
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
        emission: response.emission.toFixed(3) + " CO₂",
        loaded: true,
      }));

      return response;
    } catch (error) {
      // set error if route is not found
      setRouteFunction((prevState) => ({
        ...prevState,
        loaded: false,
      }));
      return error;
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
          emission: route.emission.toFixed(3) + " CO₂",
        })),
        loaded: true,
      });

      return response;
    } catch (error) {
      setTransitRoutes({ routes: [], loaded: false });
    }
  };

  const fetchRoutePoints = async (base, value, setRoute) => {
    try {
      let response = await pointsCalculation(base, value);
      setRoute((prevState) => ({
        ...prevState,
        points: Math.round(response.points) + " Points",
      }));
    } catch (error) {}
  };

  const fetchTransitRoutePoints = async (base, value, setRoute, index) => {
    try {
      let response = await pointsCalculation(base, value);
      setRoute((prevState) => ({
        ...prevState,
        routes: prevState.routes.map((route, i) => {
          if (i === index) {
            return {
              ...route,
              points: Math.round(response.points) + " Points",
            };
          }
          return route;
        }),
      }));
    } catch (error) {}
  };

  useEffect(() => {
    if (
      startCoords.lat !== undefined &&
      startCoords.lon !== undefined &&
      destinationCoords.lat !== undefined &&
      destinationCoords.lon !== undefined
    ) {
      fetchRoutes(
        startCoords,
        destinationCoords,
        getCarRoute,
        setCarRoute
      ).then((carResponse) => {
        fetchRoutePoints(
          carResponse.emission,
          carResponse.emission,
          setCarRoute
        );

        fetchRoutes(
          startCoords,
          destinationCoords,
          getWalkRoute,
          setWalkRoute
        ).then((response) => {
          fetchRoutePoints(
            carResponse.emission,
            response.emission,
            setWalkRoute
          );
        });
        fetchRoutes(
          startCoords,
          destinationCoords,
          getBikeRoute,
          setBikeRoute
        ).then((response) => {
          fetchRoutePoints(
            carResponse.emission,
            response.emission,
            setBikeRoute
          );
        });

        fetchTransitRoutes(
          startCoords,
          destinationCoords,
          getTransitRoute,
          setTransitRoutes
        ).then((responses) => {
          responses.routes.forEach((response, index) => {
            fetchTransitRoutePoints(
              carResponse.emission,
              response.emission,
              setTransitRoutes,
              index
            );
          });
        });
      });
    }
  }, [startCoords, destinationCoords]);

  useEffect(() => {
    console.log("carRoute", carRoute);
  }, [carRoute, bikeRoute, walkRoute, transitRoutes]);

  return (
    <RouteContext.Provider
      value={{ carRoute, bikeRoute, walkRoute, transitRoutes, defaultRoute }}
    >
      {children}
    </RouteContext.Provider>
  );
}

export { RouteContext, RouteProvider };

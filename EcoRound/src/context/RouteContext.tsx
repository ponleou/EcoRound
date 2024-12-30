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
import { DateContext } from "./DateContext";

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
        emission: Math.round(response.emission * 1000) + " gCO₂e",
      }));

      return response;
    } catch (error) {
      // set error if route is not found
      setRouteFunction((prevState) => ({
        ...prevState,
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

  const { getCurrentTime } = useContext(DateContext) as any;

  const fetchTransitRoutes = async (
    startCoords,
    destinationCoords,
    getTransitRoutes,
    setTransitRoutes,
    datetime = getCurrentTime()
  ) => {
    try {
      const response = await getTransitRoutes(
        startCoords.lat,
        startCoords.lon,
        destinationCoords.lat,
        destinationCoords.lon,
        datetime
      );

      setTransitRoutes((prevState) => ({
        ...prevState,
        routes: response.routes.map((route) => ({
          distance: formatDistanceString(route.distance),
          duration: formatDurationString(route.duration),
          start: { time: route.start.time, date: route.start.date },
          end: { time: route.end.time, date: route.end.date },
          segments: route.segments.map((segment) =>
            segment.transitSegment
              ? {
                  distance: formatDistanceString(segment.distance),
                  duration: formatDurationString(segment.duration),
                  transitSegment: segment.transitSegment,
                  mode: segment.mode,
                  stops: segment.stops,
                  transitNames: {
                    code: segment.transitNames.code,
                    headsign: segment.transitNames.headsign,
                  },
                  end: { time: segment.end.time, date: segment.end.date },
                  start: { time: segment.start.time, date: segment.start.date },
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
                  end: { time: segment.end.time, date: segment.end.date },
                  start: { time: segment.start.time, date: segment.start.date },
                }
          ),
          coorindates: route.segments.map((segment) => ({
            type: segment.transitSegment ? "primary" : "secondary",
            path: segment.path,
          })),
          emission: Math.round(route.emission * 1000) + " gCO₂e",
        })),
      }));

      return response;
    } catch (error) {
      setTransitRoutes((prevState) => ({
        ...prevState,
        routes: [],
        loaded: false,
      }));
    }
  };

  const fetchRoutePoints = async (base, value, setRoute) => {
    try {
      let response = await pointsCalculation(base, value);
      setRoute((prevState) => ({
        ...prevState,
        points: Math.round(response.points) + " Points",
        loaded: true,
      }));
    } catch (error) {
      setRoute((prevState) => ({
        ...prevState,
        points: "",
        loaded: false,
      }));
    }
  };

  const fetchTransitRoutePoints = async (base, response, setRoute) => {
    const pointsArray = [];
    try {
      // Wait for all points calculations to finish
      await Promise.all(
        response.routes.map(async (route, index) => {
          try {
            let response = await pointsCalculation(base, route.emission);
            pointsArray.push(Math.round(response.points));
          } catch (error) {
            pointsArray[index] = 0; // Default to 0 if error occurs
            setRoute((prevState) => ({
              ...prevState,
              loaded: false,
            }));
          }
        })
      );

      setRoute((prevState) => ({
        ...prevState,
        routes: prevState.routes.map((route, index) => ({
          ...route,
          points: pointsArray[index] + " Points", // Use pointsArray[index] instead of pointsArray[0]
        })),
        loaded: true,
      }));
    } catch (error) {
      setRoute((prevState) => ({
        ...prevState,
        loaded: false,
      }));
      return;
    }
  };

  const setLoaded = (loaded, setRoute) => {
    setRoute((prevState) => ({
      ...prevState,
      loaded: loaded,
    }));
  };

  useEffect(() => {
    if (
      startCoords.lat !== undefined &&
      startCoords.lon !== undefined &&
      destinationCoords.lat !== undefined &&
      destinationCoords.lon !== undefined
    ) {
      setLoaded(false, setCarRoute);
      setLoaded(false, setBikeRoute);
      setLoaded(false, setWalkRoute);
      setLoaded(false, setTransitRoutes);
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
          fetchTransitRoutePoints(
            carResponse.emission,
            responses,
            setTransitRoutes
          );
        });
      });
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

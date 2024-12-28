import { CapacitorHttp } from "@capacitor/core";

const baseUrl = "http://10.141.55.82:5000/api";

function handleResponse(response) {
  if (response.status >= 300) {
    throw response.data;
  }
  return response.data;
}

export const getPlaceName = async (lat, lon) => {
  const reponse = await CapacitorHttp.request({
    url: `${baseUrl}/place_name?lat=${lat}&lon=${lon}`,
    headers: { "Content-Type": "application/json" },
    method: "GET",
  });

  return handleResponse(reponse);
};

export const getCarRoute = async (slat, slon, dlat, dlon) => {
  const reponse = await CapacitorHttp.request({
    url: `${baseUrl}/car-route?slat=${slat}&slon=${slon}&dlat=${dlat}&dlon=${dlon}`,
    headers: { "Content-Type": "application/json" },
    method: "GET",
  });

  return handleResponse(reponse);
};

export const getWalkRoute = async (slat, slon, dlat, dlon) => {
  const reponse = await CapacitorHttp.request({
    url: `${baseUrl}/walk-route?slat=${slat}&slon=${slon}&dlat=${dlat}&dlon=${dlon}`,
    headers: { "Content-Type": "application/json" },
    method: "GET",
  });

  return handleResponse(reponse);
};

export const getBikeRoute = async (slat, slon, dlat, dlon) => {
  const reponse = await CapacitorHttp.request({
    url: `${baseUrl}/bike-route?slat=${slat}&slon=${slon}&dlat=${dlat}&dlon=${dlon}`,
    headers: { "Content-Type": "application/json" },
    method: "GET",
  });

  return handleResponse(reponse);
};

export const getTransitRoute = async (
  slat,
  slon,
  dlat,
  dlon,
  datetime,
  isArrival = 0
) => {
  const reponse = await CapacitorHttp.request({
    url: `${baseUrl}/transit-route?slat=${slat}&slon=${slon}&dlat=${dlat}&dlon=${dlon}&datetime=${datetime.replace(
      "+",
      "%2B"
    )}&isarrival=${isArrival}`,
    headers: { "Content-Type": "application/json" },
    method: "GET",
  });

  return handleResponse(reponse);
};

export const getPlaceList = async (search, lat, lon) => {
  const reponse = await CapacitorHttp.request({
    url: `${baseUrl}/find_place?search=${search}&lat=${lat}&lon=${lon}`,
    headers: { "Content-Type": "application/json" },
    method: "GET",
  });

  return handleResponse(reponse);
};

export const checkValidCoords = async (lat, lon) => {
  const reponse = await CapacitorHttp.request({
    url: `${baseUrl}/check_valid_coords?lat=${lat}&lon=${lon}`,
    headers: { "Content-Type": "application/json" },
    method: "GET",
  });

  return handleResponse(reponse);
};

export const pointsCalculation = async (base, value) => {
  const reponse = await CapacitorHttp.request({
    url: `${baseUrl}/points_calculation?base=${base}&value=${value}`,
    headers: { "Content-Type": "application/json" },
    method: "GET",
  });

  return handleResponse(reponse);
};

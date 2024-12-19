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
    url: `${baseUrl}/route?slat=${slat}&slon=${slon}&dlat=${dlat}&dlon=${dlon}&profile=driving-car`,
    headers: { "Content-Type": "application/json" },
    method: "GET",
  });

  return handleResponse(reponse);
};

export const getWalkRoute = async (slat, slon, dlat, dlon) => {
  const reponse = await CapacitorHttp.request({
    url: `${baseUrl}/route?slat=${slat}&slon=${slon}&dlat=${dlat}&dlon=${dlon}&profile=foot-walking`,
    headers: { "Content-Type": "application/json" },
    method: "GET",
  });

  return handleResponse(reponse);
};

export const getBikeRoute = async (slat, slon, dlat, dlon) => {
  const reponse = await CapacitorHttp.request({
    url: `${baseUrl}/route?slat=${slat}&slon=${slon}&dlat=${dlat}&dlon=${dlon}&profile=cycling-regular`,
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

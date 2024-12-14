import { CapacitorHttp } from "@capacitor/core";

const baseUrl = "http://10.0.2.2:5000/api";

export const getPlaceName = async (lat, lon) => {
  const response = await CapacitorHttp.request({
    url: `${baseUrl}/place_name?lat=${lat}&lon=${lon}`,
    headers: { "Content-Type": "application/json" },
    method: "GET",
  });

  return response.data;
};

export const getCarRoute = async (slat, slon, dlat, dlon) => {
  const response = await CapacitorHttp.request({
    url: `${baseUrl}/route?slat=${slat}&slon=${slon}&dlat=${dlat}&dlon=${dlon}&profile=driving-car`,
    headers: { "Content-Type": "application/json" },
    method: "GET",
  });

  return response.data;
};

export const getWalkRoute = async (slat, slon, dlat, dlon) => {
  const response = await CapacitorHttp.request({
    url: `${baseUrl}/route?slat=${slat}&slon=${slon}&dlat=${dlat}&dlon=${dlon}&profile=foot-walking`,
    headers: { "Content-Type": "application/json" },
    method: "GET",
  });

  return response.data;
};

export const getBikeRoute = async (slat, slon, dlat, dlon) => {
  const response = await CapacitorHttp.request({
    url: `${baseUrl}/route?slat=${slat}&slon=${slon}&dlat=${dlat}&dlon=${dlon}&profile=cycling-regular`,
    headers: { "Content-Type": "application/json" },
    method: "GET",
  });
  5;
  return response.data;
};

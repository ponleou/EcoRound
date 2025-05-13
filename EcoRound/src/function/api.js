import { CapacitorHttp } from "@capacitor/core";

// const baseUrl = "http://10.141.55.82:5000/api";
let baseUrl = process.env.APP_BACKEND_URL;

const header = {
  "Content-Type": "application/json",
  skip_zrok_interstitial: "true", // for using zrok to host backend
};

function handleResponse(response) {
  if (response.status >= 300) {
    console.log(response);
    throw response.data;
  }
  return response.data;
}

export const verifyUrl = async (url) => {
  baseUrl = url + "/api";
  const response = await CapacitorHttp.request({
    url: `${baseUrl}/verify`,
    headers: header,
    method: "GET",
  });

  return handleResponse(response);
};

export const getPlaceName = async (lat, lon) => {
  const response = await CapacitorHttp.request({
    url: `${baseUrl}/place_name?lat=${lat}&lon=${lon}`,
    headers: header,
    method: "GET",
  });

  return handleResponse(response);
};

export const getCarRoute = async (slat, slon, dlat, dlon) => {
  const response = await CapacitorHttp.request({
    url: `${baseUrl}/car-route?slat=${slat}&slon=${slon}&dlat=${dlat}&dlon=${dlon}`,
    headers: header,
    method: "GET",
  });

  return handleResponse(response);
};

export const getWalkRoute = async (slat, slon, dlat, dlon) => {
  const response = await CapacitorHttp.request({
    url: `${baseUrl}/walk-route?slat=${slat}&slon=${slon}&dlat=${dlat}&dlon=${dlon}`,
    headers: header,
    method: "GET",
  });

  return handleResponse(response);
};

export const getBikeRoute = async (slat, slon, dlat, dlon) => {
  const response = await CapacitorHttp.request({
    url: `${baseUrl}/bike-route?slat=${slat}&slon=${slon}&dlat=${dlat}&dlon=${dlon}`,
    headers: header,
    method: "GET",
  });

  return handleResponse(response);
};

export const getTransitRoute = async (
  slat,
  slon,
  dlat,
  dlon,
  datetime,
  isArrival = 0
) => {
  datetime = adjustTimeOutOfRange(datetime);
  const response = await CapacitorHttp.request({
    url: `${baseUrl}/transit-route?slat=${slat}&slon=${slon}&dlat=${dlat}&dlon=${dlon}&datetime=${datetime.replace(
      "+",
      "%2B"
    )}&isarrival=${isArrival}`,
    headers: header,
    method: "GET",
  });

  return handleResponse(response);
};

// FIXME: temp function, remove later
function adjustTimeOutOfRange(inputTime) {
  // Parse the input time
  const [datePart, timezonePart] = inputTime.split("+");
  const inputDate = new Date(datePart + "Z"); // Treat the input time as UTC
  const inputTimezone = timezonePart ? parseInt(timezonePart.split(":")[0]) : 0;

  // Convert to UTC+7
  const utc7Date = new Date(
    inputDate.getTime() + (7 - inputTimezone) * 60 * 60 * 1000
  );

  // Check if it's within the specified range
  const day = utc7Date.getUTCDay();
  const hours = utc7Date.getUTCHours();
  const minutes = utc7Date.getUTCMinutes();
  const seconds = utc7Date.getUTCSeconds();

  const isInRange =
    (day === 6 && hours >= 21) ||
    (day === 0 &&
      (hours < 21 || (hours === 21 && minutes === 0 && seconds === 0)));

  if (isInRange) {
    // Move the date outside the range by adding a day
    utc7Date.setUTCDate(utc7Date.getUTCDate() + 1);
  }

  // Convert back to the original timezone
  const adjustedDate = new Date(
    utc7Date.getTime() - (7 - inputTimezone) * 60 * 60 * 1000
  );

  // Format the result
  const pad = (num) => num.toString().padStart(2, "0");
  const formattedDate = `${adjustedDate.getUTCFullYear()}-${pad(
    adjustedDate.getUTCMonth() + 1
  )}-${pad(adjustedDate.getUTCDate())}T${pad(adjustedDate.getUTCHours())}:${pad(
    adjustedDate.getUTCMinutes()
  )}:${pad(adjustedDate.getUTCSeconds())}+${timezonePart || "00:00"}`;

  return formattedDate;
}

export const getPlaceList = async (search, lat, lon) => {
  const response = await CapacitorHttp.request({
    url: `${baseUrl}/find_place?search=${search}&lat=${lat}&lon=${lon}`,
    headers: header,
    method: "GET",
  });

  return handleResponse(response);
};

export const checkValidCoords = async (lat, lon) => {
  const response = await CapacitorHttp.request({
    url: `${baseUrl}/check_valid_coords?lat=${lat}&lon=${lon}`,
    headers: header,
    method: "GET",
  });

  return handleResponse(response);
};

export const pointsCalculation = async (base, value) => {
  const response = await CapacitorHttp.request({
    url: `${baseUrl}/points_calculation?base=${base}&value=${value}`,
    headers: header,
    method: "GET",
  });

  return handleResponse(response);
};

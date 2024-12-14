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

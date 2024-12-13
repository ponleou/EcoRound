import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

export default {
  getPlaceName(lat, lon) {
    return api.get(`/place_name?lat=${lat}&lon=${lon}`);
  },
};

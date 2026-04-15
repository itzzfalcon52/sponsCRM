
import axios from "axios";

export const api = axios.create({
  baseURL: "http://localhost:3000/api/v1", // change in prod
  withCredentials: true, //  REQUIRED for cookies
});
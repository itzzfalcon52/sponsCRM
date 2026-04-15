
import axios from "axios";

export const api = axios.create({
  baseURL: "https://spons-crm-api.sponscrm.tech/api/v1", // change in prod
  withCredentials: true, //  REQUIRED for cookies
});
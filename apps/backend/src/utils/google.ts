// utils/google.js
import { google } from "googleapis";
import dotenv from "dotenv";

export const getOAuthClient = () => {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    "http://localhost:3000/api/v1/google/callback" 
  );
};
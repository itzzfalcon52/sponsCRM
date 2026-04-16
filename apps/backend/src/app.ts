import express from "express";
import { Express,Request,Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoute from "./routes/authRoute.js";
import dotenv from "dotenv";
import orgRoute from "./routes/orgRoute.js";
import companyRoutes from "./routes/companyRoutes.js"
import activityRoute from "./routes/activityRoute.js"
import exportRoute from "./routes/exportRoute.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import hpp from "hpp";







const app=express();


const allowedOrigins = [
  "http://localhost:5173",
  "https://www.sponscrm.tech",        // Removed slash
  "https://sponscrm.tech",            // Added apex domain just in case
  "https://spons-crm-frontend.vercel.app", // Removed slash
];


app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));

// 1. Set security HTTP headers
app.use(helmet());

app.set("trust proxy", 1); //we add this as this will set the ip as fixed and not change on reload.This is important for rate limiting on cloud hosting platforms

// 2. Limit requests from the same IP (Rate Limiting)
const limiter = rateLimit({
  max: 100, // Limit each IP to 100 requests per `windowMs`
  windowMs: 15 * 60 * 1000, // 15 minutes
  message: "Too many requests from this IP, please try again in 15 minutes!",
});
// Apply the rate limiting middleware to all /api routes
app.use("/api", limiter);

// Strict limiter for Auth routes
const authLimiter = rateLimit({
  max: 50, // Limit to 10 requests per window
  windowMs: 10 * 60 * 1000, // 10 minutes
  message: "Too many login attempts, please try again after 10 minutes",
});
app.use("/api/v1/auth", authLimiter); 

// 3. Body parser, reading data from body into req.body, with strict payload size limit
app.use(express.json({ limit: "10kb" }));
app.use(cookieParser());


// 4. Prevent HTTP Parameter Pollution
app.use(hpp());





app.get("/", (_req: Request, res: Response) => {
    res.send("Express + TypeScript Server");
})


// Routes
app.use("/api/v1/auth", authRoute);
app.use("/api/v1/org", orgRoute);
app.use("/api/v1/companies",companyRoutes)
app.use("/api/v1/activities",activityRoute)
app.use("/api/v1/google", exportRoute);
app.use("/api/v1/notifications", notificationRoutes);



  



export default app;

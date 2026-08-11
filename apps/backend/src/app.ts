import express from "express";
import { Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoute from "./routes/authRoute.js";
import orgRoute from "./routes/orgRoute.js";
import companyRoutes from "./routes/companyRoutes.js";
import activityRoute from "./routes/activityRoute.js";
import exportRoute from "./routes/exportRoute.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import helmet from "helmet";
import hpp from "hpp";

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "https://www.sponscrm.tech",
  "https://sponscrm.tech",
  "https://spons-crm-frontend.vercel.app",
];

app.use((req, res, next) => {
  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;

    console.log(
      `${req.method} ${req.originalUrl} → ${res.statusCode} (${duration}ms)`
    );
  });

  next();
});

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use(helmet());

app.set("trust proxy", 1);

app.use(express.json({ limit: "10kb" }));
app.use(cookieParser());

app.use(hpp());

app.get("/", (_req: Request, res: Response) => {
  res.send("Express + TypeScript Server");
});

// Routes
app.use("/api/v1/auth", authRoute);
app.use("/api/v1/org", orgRoute);
app.use("/api/v1/companies", companyRoutes);
app.use("/api/v1/activities", activityRoute);
app.use("/api/v1/google", exportRoute);
app.use("/api/v1/notifications", notificationRoutes);

export default app;
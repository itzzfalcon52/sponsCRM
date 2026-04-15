import dotenv from "dotenv";
import app from "./app.js";

dotenv.config();

const port = process.env.PORT || 3000;

const server = app.listen(port, () => {
  console.log(`🚀 App running on port ${port}...`);
});

process.on("unhandledRejection", (err: unknown) => {
  console.log("UNHANDLED REJECTION! 💥 Shutting down...");

  if (err instanceof Error) {
    console.log(err.name, err.message);
  } else {
    console.log("Unknown rejection:", err);
  }

  server.close(() => process.exit(1));
});
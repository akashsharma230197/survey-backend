import cors from "cors";
import "dotenv/config";
import express from "express";
import { initSchema } from "./db.js";
import { attributesRouter } from "./routes/attributes.js";
import { sitesRouter } from "./routes/sites.js";
import { assessmentsRouter } from "./routes/assessments.js";

const app = express();
const port = Number(process.env.PORT ?? 4000);
const allowedOrigins = (process.env.FRONTEND_ORIGIN ?? "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
const renderFrontendPattern = /^https:\/\/survey-frontend[-\w]*\.onrender\.com$/;

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin) || renderFrontendPattern.test(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error("Not allowed by CORS"));
    }
  })
);
app.use(express.json());

app.get("/", (_request, response) => {
  response.json({
    message: "UXF-IUPS survey backend is running",
    health: "/api/health",
    attributes: "/api/attributes",
    sites: "/api/sites"
  });
});

app.get("/api/health", (_request, response) => {
  response.json({
    status: "online",
    service: "survey-backend",
    timestamp: new Date().toISOString()
  });
});

app.use("/api/attributes", attributesRouter);
app.use("/api/sites", sitesRouter);
app.use("/api/sites/:siteId/assessments", assessmentsRouter);

app.use((error, _request, response, _next) => {
  console.error(error);
  response.status(500).json({ message: "Internal server error" });
});

initSchema()
  .then(() => {
    app.listen(port, () => {
      console.log(`Survey backend listening on http://localhost:${port}`);
    });
  })
  .catch((error) => {
    console.error("Failed to initialise database schema", error);
    process.exit(1);
  });

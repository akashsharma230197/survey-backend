import cors from "cors";
import { randomUUID } from "node:crypto";
import "dotenv/config";
import express from "express";

const app = express();
const port = Number(process.env.PORT ?? 4000);
const frontendOrigin = process.env.FRONTEND_ORIGIN ?? "http://localhost:5173";

let surveys = [
  {
    id: randomUUID(),
    title: "Product onboarding",
    description: "Learn where new users get stuck during setup."
  },
  {
    id: randomUUID(),
    title: "Quarterly employee pulse",
    description: "Collect lightweight sentiment across teams."
  }
];

app.use(cors({ origin: frontendOrigin }));
app.use(express.json());

app.get("/api/health", (_request, response) => {
  response.json({
    status: "online",
    service: "survey-backend",
    timestamp: new Date().toISOString()
  });
});

app.get("/api/surveys", (_request, response) => {
  response.json(surveys);
});

app.post("/api/surveys", (request, response) => {
  const title = String(request.body?.title ?? "").trim();
  const description = String(request.body?.description ?? "").trim();

  if (!title) {
    response.status(400).json({ message: "Survey title is required" });
    return;
  }

  const survey = {
    id: randomUUID(),
    title,
    description
  };

  surveys = [survey, ...surveys];
  response.status(201).json(survey);
});

app.listen(port, () => {
  console.log(`Survey backend listening on http://localhost:${port}`);
});

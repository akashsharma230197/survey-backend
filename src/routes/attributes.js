import { Router } from "express";
import { ATTRIBUTES, DIMENSIONS } from "../data/attributes.js";

export const attributesRouter = Router();

attributesRouter.get("/", (_request, response) => {
  response.json({ dimensions: DIMENSIONS, attributes: ATTRIBUTES });
});

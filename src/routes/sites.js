import { Router } from "express";
import { pool } from "../db.js";
import { asyncHandler } from "../asyncHandler.js";

export const sitesRouter = Router();

const TYPOLOGIES = ["Commercial", "Transit", "Heritage", "Green", "Civic", "Mixed"];
const OWNERSHIPS = ["NDMC", "DDA", "ASI", "MCD", "Private"];

function toRow(body) {
  return {
    name: String(body?.name ?? "").trim(),
    location: body?.location ? String(body.location).trim() : null,
    lat: body?.lat !== undefined && body.lat !== "" ? Number(body.lat) : null,
    lng: body?.lng !== undefined && body.lng !== "" ? Number(body.lng) : null,
    typology: body?.typology || null,
    area_hectares: body?.areaHectares !== undefined && body.areaHectares !== "" ? Number(body.areaHectares) : null,
    ownership: body?.ownership || null,
    year_established: body?.yearEstablished !== undefined && body.yearEstablished !== "" ? Number(body.yearEstablished) : null,
    accessibility_modes: Array.isArray(body?.accessibilityModes) ? body.accessibilityModes : [],
    peak_visitors: body?.peakVisitors !== undefined && body.peakVisitors !== "" ? Number(body.peakVisitors) : null,
    surrounding_land_use: Array.isArray(body?.surroundingLandUse) ? body.surroundingLandUse : []
  };
}

function validate(row) {
  if (!row.name) return "Site name is required";
  if (row.typology && !TYPOLOGIES.includes(row.typology)) return `Typology must be one of: ${TYPOLOGIES.join(", ")}`;
  if (row.ownership && !OWNERSHIPS.includes(row.ownership)) return `Ownership must be one of: ${OWNERSHIPS.join(", ")}`;
  if (row.lat !== null && Number.isNaN(row.lat)) return "Latitude must be a number";
  if (row.lng !== null && Number.isNaN(row.lng)) return "Longitude must be a number";
  if (row.area_hectares !== null && Number.isNaN(row.area_hectares)) return "Area must be a number";
  if (row.year_established !== null && Number.isNaN(row.year_established)) return "Year established must be a number";
  if (row.peak_visitors !== null && Number.isNaN(row.peak_visitors)) return "Peak visitors must be a number";
  return null;
}

function toApi(row) {
  return {
    id: row.id,
    name: row.name,
    location: row.location,
    lat: row.lat,
    lng: row.lng,
    typology: row.typology,
    areaHectares: row.area_hectares,
    ownership: row.ownership,
    yearEstablished: row.year_established,
    accessibilityModes: row.accessibility_modes,
    peakVisitors: row.peak_visitors,
    surroundingLandUse: row.surrounding_land_use,
    createdAt: row.created_at
  };
}

sitesRouter.get("/", asyncHandler(async (_request, response) => {
  const result = await pool.query("SELECT * FROM survey.sites ORDER BY created_at DESC");
  response.json(result.rows.map(toApi));
}));

sitesRouter.post("/", asyncHandler(async (request, response) => {
  const row = toRow(request.body);
  const validationError = validate(row);
  if (validationError) {
    response.status(400).json({ message: validationError });
    return;
  }

  const result = await pool.query(
    `INSERT INTO survey.sites
      (name, location, lat, lng, typology, area_hectares, ownership, year_established, accessibility_modes, peak_visitors, surrounding_land_use)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
     RETURNING *`,
    [
      row.name,
      row.location,
      row.lat,
      row.lng,
      row.typology,
      row.area_hectares,
      row.ownership,
      row.year_established,
      row.accessibility_modes,
      row.peak_visitors,
      row.surrounding_land_use
    ]
  );
  response.status(201).json(toApi(result.rows[0]));
}));

sitesRouter.get("/:id", asyncHandler(async (request, response) => {
  const result = await pool.query("SELECT * FROM survey.sites WHERE id = $1", [request.params.id]);
  if (result.rows.length === 0) {
    response.status(404).json({ message: "Site not found" });
    return;
  }
  response.json(toApi(result.rows[0]));
}));

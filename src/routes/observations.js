import { Router } from "express";
import { pool } from "../db.js";
import { asyncHandler } from "../asyncHandler.js";

export const observationsRouter = Router({ mergeParams: true });

export const ACTIVITY_CODES = [
  { code: "W", label: "Walking / transit" },
  { code: "S", label: "Sitting / resting" },
  { code: "SO", label: "Socialising" },
  { code: "GP", label: "Gender use patterns" },
  { code: "EA", label: "Elderly activity" },
  { code: "CA", label: "Children's activity" }
];
const ACTIVITY_CODE_SET = new Set(ACTIVITY_CODES.map((activity) => activity.code));

async function siteExists(siteId) {
  const result = await pool.query("SELECT 1 FROM survey.sites WHERE id = $1", [siteId]);
  return result.rows.length > 0;
}

function toApi(row) {
  return {
    id: row.id,
    activityCode: row.activity_code,
    demographicTag: row.demographic_tag,
    groupSize: row.group_size,
    lat: row.lat,
    lng: row.lng,
    notes: row.notes,
    observedAt: row.observed_at
  };
}

observationsRouter.get("/", asyncHandler(async (request, response) => {
  const { siteId } = request.params;
  if (!(await siteExists(siteId))) {
    response.status(404).json({ message: "Site not found" });
    return;
  }
  const result = await pool.query("SELECT * FROM survey.observations WHERE site_id = $1 ORDER BY observed_at DESC", [siteId]);
  response.json({ activityCodes: ACTIVITY_CODES, observations: result.rows.map(toApi) });
}));

observationsRouter.post("/", asyncHandler(async (request, response) => {
  const { siteId } = request.params;
  if (!(await siteExists(siteId))) {
    response.status(404).json({ message: "Site not found" });
    return;
  }

  const body = request.body ?? {};
  if (!ACTIVITY_CODE_SET.has(body.activityCode)) {
    response.status(400).json({ message: `activityCode must be one of: ${[...ACTIVITY_CODE_SET].join(", ")}` });
    return;
  }

  const result = await pool.query(
    `INSERT INTO survey.observations (site_id, activity_code, demographic_tag, group_size, lat, lng, notes)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [
      siteId,
      body.activityCode,
      body.demographicTag ? String(body.demographicTag).trim() : null,
      body.groupSize !== undefined && body.groupSize !== "" ? Number(body.groupSize) : null,
      body.lat !== undefined && body.lat !== "" ? Number(body.lat) : null,
      body.lng !== undefined && body.lng !== "" ? Number(body.lng) : null,
      body.notes ? String(body.notes).trim() : null
    ]
  );
  response.status(201).json(toApi(result.rows[0]));
}));

observationsRouter.delete("/:observationId", asyncHandler(async (request, response) => {
  const { siteId, observationId } = request.params;
  const result = await pool.query("DELETE FROM survey.observations WHERE id = $1 AND site_id = $2", [observationId, siteId]);
  if (result.rowCount === 0) {
    response.status(404).json({ message: "Observation not found" });
    return;
  }
  response.status(204).end();
}));

import { Router } from "express";
import { pool } from "../db.js";
import { asyncHandler } from "../asyncHandler.js";

export const personasRouter = Router({ mergeParams: true });

async function siteExists(siteId) {
  const result = await pool.query("SELECT 1 FROM survey.sites WHERE id = $1", [siteId]);
  return result.rows.length > 0;
}

function toApi(row) {
  return {
    id: row.id,
    name: row.name,
    needs: row.needs,
    painPoints: row.pain_points,
    journey: row.journey,
    dataLink: row.data_link,
    createdAt: row.created_at
  };
}

personasRouter.get("/", asyncHandler(async (request, response) => {
  const { siteId } = request.params;
  if (!(await siteExists(siteId))) {
    response.status(404).json({ message: "Site not found" });
    return;
  }
  const result = await pool.query("SELECT * FROM survey.personas WHERE site_id = $1 ORDER BY created_at ASC", [siteId]);
  response.json(result.rows.map(toApi));
}));

personasRouter.post("/", asyncHandler(async (request, response) => {
  const { siteId } = request.params;
  if (!(await siteExists(siteId))) {
    response.status(404).json({ message: "Site not found" });
    return;
  }

  const body = request.body ?? {};
  const name = String(body.name ?? "").trim();
  if (!name) {
    response.status(400).json({ message: "Persona name is required" });
    return;
  }

  const journey = Array.isArray(body.journey)
    ? body.journey.filter((stage) => typeof stage?.stage === "string" && stage.stage.trim())
        .map((stage) => ({ stage: stage.stage.trim(), note: String(stage.note ?? "").trim() }))
    : [];

  const result = await pool.query(
    `INSERT INTO survey.personas (site_id, name, needs, pain_points, journey, data_link)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [
      siteId,
      name,
      body.needs ? String(body.needs).trim() : null,
      body.painPoints ? String(body.painPoints).trim() : null,
      JSON.stringify(journey),
      body.dataLink ? String(body.dataLink).trim() : null
    ]
  );
  response.status(201).json(toApi(result.rows[0]));
}));

personasRouter.delete("/:personaId", asyncHandler(async (request, response) => {
  const { siteId, personaId } = request.params;
  const result = await pool.query("DELETE FROM survey.personas WHERE id = $1 AND site_id = $2", [personaId, siteId]);
  if (result.rowCount === 0) {
    response.status(404).json({ message: "Persona not found" });
    return;
  }
  response.status(204).end();
}));

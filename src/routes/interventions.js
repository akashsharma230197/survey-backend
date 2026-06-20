import { Router } from "express";
import { pool } from "../db.js";
import { asyncHandler } from "../asyncHandler.js";
import { ATTRIBUTE_BY_CODE } from "../data/attributes.js";

export const interventionsRouter = Router({ mergeParams: true });

async function siteExists(siteId) {
  const result = await pool.query("SELECT 1 FROM survey.sites WHERE id = $1", [siteId]);
  return result.rows.length > 0;
}

function priorityFor(gap) {
  if (gap > 2) return { level: "Immediate", timeline: "0-3 months" };
  if (gap >= 1.5) return { level: "High", timeline: "3-6 months" };
  if (gap >= 1.0) return { level: "Medium", timeline: "6-12 months" };
  if (gap >= 0.5) return { level: "Minor", timeline: "12-24 months" };
  return { level: "Maintain", timeline: "Ongoing" };
}

async function loadMatrix(siteId) {
  const [assessmentRows, interventionRows] = await Promise.all([
    pool.query("SELECT attribute_code, importance, performance FROM survey.assessments WHERE site_id = $1", [siteId]),
    pool.query("SELECT attribute_code, responsible_agency, status FROM survey.interventions WHERE site_id = $1", [siteId])
  ]);

  const interventionByCode = new Map(interventionRows.rows.map((row) => [row.attribute_code, row]));

  const matrix = assessmentRows.rows
    .map((row) => {
      const attribute = ATTRIBUTE_BY_CODE.get(row.attribute_code);
      const gap = row.importance - row.performance;
      const intervention = interventionByCode.get(row.attribute_code);
      return {
        attributeCode: row.attribute_code,
        attributeName: attribute?.name ?? row.attribute_code,
        dimension: attribute?.dimension ?? null,
        importance: row.importance,
        performance: row.performance,
        gap,
        priority: priorityFor(gap),
        responsibleAgency: intervention?.responsible_agency ?? null,
        status: intervention?.status ?? "Pending"
      };
    })
    .sort((a, b) => b.gap - a.gap);

  return matrix;
}

interventionsRouter.get("/", asyncHandler(async (request, response) => {
  const { siteId } = request.params;
  if (!(await siteExists(siteId))) {
    response.status(404).json({ message: "Site not found" });
    return;
  }
  response.json(await loadMatrix(siteId));
}));

interventionsRouter.put("/:attributeCode", asyncHandler(async (request, response) => {
  const { siteId, attributeCode } = request.params;
  if (!(await siteExists(siteId))) {
    response.status(404).json({ message: "Site not found" });
    return;
  }
  if (!ATTRIBUTE_BY_CODE.has(attributeCode)) {
    response.status(400).json({ message: `Unknown attribute code: ${attributeCode}` });
    return;
  }

  const body = request.body ?? {};
  const status = body.status ?? "Pending";
  if (!["Pending", "In Progress", "Done"].includes(status)) {
    response.status(400).json({ message: "Status must be Pending, In Progress, or Done" });
    return;
  }

  await pool.query(
    `INSERT INTO survey.interventions (site_id, attribute_code, responsible_agency, status, updated_at)
     VALUES ($1, $2, $3, $4, now())
     ON CONFLICT (site_id, attribute_code)
     DO UPDATE SET responsible_agency = EXCLUDED.responsible_agency, status = EXCLUDED.status, updated_at = now()`,
    [siteId, attributeCode, body.responsibleAgency ? String(body.responsibleAgency).trim() : null, status]
  );

  response.json(await loadMatrix(siteId));
}));

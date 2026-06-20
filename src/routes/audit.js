import { Router } from "express";
import { pool } from "../db.js";
import { asyncHandler } from "../asyncHandler.js";
import { AUDIT_CRITERIA, AUDIT_CRITERION_BY_ID, AUDIT_SECTIONS } from "../data/auditCriteria.js";

export const auditRouter = Router({ mergeParams: true });

const STATUS_SCORE = { present: 1, partial: 0.5, absent: 0 };

async function siteExists(siteId) {
  const result = await pool.query("SELECT 1 FROM survey.sites WHERE id = $1", [siteId]);
  return result.rows.length > 0;
}

async function loadResults(siteId) {
  const result = await pool.query("SELECT criterion_id, status FROM survey.audit_results WHERE site_id = $1", [siteId]);
  const statusByCriterion = new Map(result.rows.map((row) => [row.criterion_id, row.status]));

  const criteria = AUDIT_CRITERIA.map((criterion) => ({
    ...criterion,
    status: statusByCriterion.get(criterion.id) ?? null
  }));

  return { criteria, summary: buildSummary(criteria) };
}

function buildSummary(criteria) {
  const rated = criteria.filter((criterion) => criterion.status !== null);
  const accessibilityScore = rated.length ? (rated.reduce((sum, c) => sum + STATUS_SCORE[c.status], 0) / criteria.length) * 100 : null;

  const sections = Object.entries(AUDIT_SECTIONS).map(([code, section]) => {
    const sectionCriteria = criteria.filter((criterion) => criterion.section === code);
    const sectionRated = sectionCriteria.filter((criterion) => criterion.status !== null);
    return {
      code,
      domain: section.domain,
      totalCount: sectionCriteria.length,
      ratedCount: sectionRated.length,
      score: sectionRated.length
        ? (sectionRated.reduce((sum, c) => sum + STATUS_SCORE[c.status], 0) / sectionCriteria.length) * 100
        : null
    };
  });

  return {
    ratedCount: rated.length,
    totalCount: criteria.length,
    accessibilityScore,
    sections
  };
}

auditRouter.get("/", asyncHandler(async (request, response) => {
  const { siteId } = request.params;
  if (!(await siteExists(siteId))) {
    response.status(404).json({ message: "Site not found" });
    return;
  }
  response.json(await loadResults(siteId));
}));

auditRouter.put("/", asyncHandler(async (request, response) => {
  const { siteId } = request.params;
  if (!(await siteExists(siteId))) {
    response.status(404).json({ message: "Site not found" });
    return;
  }

  const entries = Array.isArray(request.body?.results) ? request.body.results : [];
  for (const entry of entries) {
    if (!AUDIT_CRITERION_BY_ID.has(entry?.criterionId)) {
      response.status(400).json({ message: `Unknown criterion id: ${entry?.criterionId}` });
      return;
    }
    if (!["present", "partial", "absent"].includes(entry?.status)) {
      response.status(400).json({ message: `Status for ${entry.criterionId} must be present, partial, or absent` });
      return;
    }
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    for (const entry of entries) {
      await client.query(
        `INSERT INTO survey.audit_results (site_id, criterion_id, status, updated_at)
         VALUES ($1, $2, $3, now())
         ON CONFLICT (site_id, criterion_id)
         DO UPDATE SET status = EXCLUDED.status, updated_at = now()`,
        [siteId, entry.criterionId, entry.status]
      );
    }
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }

  response.json(await loadResults(siteId));
}));

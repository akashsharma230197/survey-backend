import { Router } from "express";
import { pool } from "../db.js";
import { ATTRIBUTE_BY_CODE, ATTRIBUTES, DIMENSIONS } from "../data/attributes.js";
import { asyncHandler } from "../asyncHandler.js";

export const assessmentsRouter = Router({ mergeParams: true });

function isRatingValid(value) {
  return Number.isInteger(value) && value >= 1 && value <= 5;
}

async function siteExists(siteId) {
  const result = await pool.query("SELECT 1 FROM survey.sites WHERE id = $1", [siteId]);
  return result.rows.length > 0;
}

assessmentsRouter.get("/", asyncHandler(async (request, response) => {
  const { siteId } = request.params;
  if (!(await siteExists(siteId))) {
    response.status(404).json({ message: "Site not found" });
    return;
  }

  const result = await pool.query("SELECT attribute_code, importance, performance FROM survey.assessments WHERE site_id = $1", [siteId]);
  const ratingsByCode = new Map(result.rows.map((row) => [row.attribute_code, row]));

  const attributes = ATTRIBUTES.map((attribute) => {
    const rating = ratingsByCode.get(attribute.code);
    const importance = rating?.importance ?? null;
    const performance = rating?.performance ?? null;
    return {
      ...attribute,
      importance,
      performance,
      gap: importance !== null && performance !== null ? importance - performance : null
    };
  });

  response.json({ attributes, summary: buildSummary(attributes) });
}));

assessmentsRouter.put("/", asyncHandler(async (request, response) => {
  const { siteId } = request.params;
  if (!(await siteExists(siteId))) {
    response.status(404).json({ message: "Site not found" });
    return;
  }

  const ratings = Array.isArray(request.body?.ratings) ? request.body.ratings : [];
  for (const rating of ratings) {
    if (!ATTRIBUTE_BY_CODE.has(rating?.attributeCode)) {
      response.status(400).json({ message: `Unknown attribute code: ${rating?.attributeCode}` });
      return;
    }
    if (!isRatingValid(rating.importance) || !isRatingValid(rating.performance)) {
      response.status(400).json({ message: `Importance and performance for ${rating.attributeCode} must be integers 1-5` });
      return;
    }
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    for (const rating of ratings) {
      await client.query(
        `INSERT INTO survey.assessments (site_id, attribute_code, importance, performance, updated_at)
         VALUES ($1, $2, $3, $4, now())
         ON CONFLICT (site_id, attribute_code)
         DO UPDATE SET importance = EXCLUDED.importance, performance = EXCLUDED.performance, updated_at = now()`,
        [siteId, rating.attributeCode, rating.importance, rating.performance]
      );
    }
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }

  const result = await pool.query("SELECT attribute_code, importance, performance FROM survey.assessments WHERE site_id = $1", [siteId]);
  const ratingsByCode = new Map(result.rows.map((row) => [row.attribute_code, row]));
  const attributes = ATTRIBUTES.map((attribute) => {
    const rating = ratingsByCode.get(attribute.code);
    const importance = rating?.importance ?? null;
    const performance = rating?.performance ?? null;
    return {
      ...attribute,
      importance,
      performance,
      gap: importance !== null && performance !== null ? importance - performance : null
    };
  });
  response.json({ attributes, summary: buildSummary(attributes) });
}));

function buildSummary(attributes) {
  const dimensionSummaries = Object.entries(DIMENSIONS).map(([code, dimension]) => {
    const dimensionAttributes = attributes.filter((attribute) => attribute.dimension === code && attribute.gap !== null);
    const rated = dimensionAttributes.length;
    const avgImportance = rated ? average(dimensionAttributes.map((attribute) => attribute.importance)) : null;
    const avgPerformance = rated ? average(dimensionAttributes.map((attribute) => attribute.performance)) : null;
    const avgGap = rated ? average(dimensionAttributes.map((attribute) => attribute.gap)) : null;
    return {
      code,
      name: dimension.name,
      weight: dimension.weight,
      ratedCount: rated,
      totalCount: attributes.filter((attribute) => attribute.dimension === code).length,
      avgImportance,
      avgPerformance,
      avgGap
    };
  });

  const ratedAttributes = attributes.filter((attribute) => attribute.gap !== null);
  const priorityActions = ratedAttributes
    .map((attribute) => ({ code: attribute.code, name: attribute.name, gap: attribute.gap, priority: priorityFor(attribute.gap) }))
    .sort((a, b) => b.gap - a.gap);

  return {
    ratedCount: ratedAttributes.length,
    totalCount: attributes.length,
    dimensions: dimensionSummaries,
    priorityActions
  };
}

function priorityFor(gap) {
  if (gap > 2) return { level: "Immediate", timeline: "0-3 months" };
  if (gap >= 1.5) return { level: "High", timeline: "3-6 months" };
  if (gap >= 1.0) return { level: "Medium", timeline: "6-12 months" };
  if (gap >= 0.5) return { level: "Minor", timeline: "12-24 months" };
  return { level: "Maintain", timeline: "Ongoing" };
}

function average(values) {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

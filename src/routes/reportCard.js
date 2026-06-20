import { Router } from "express";
import { pool } from "../db.js";
import { asyncHandler } from "../asyncHandler.js";
import { ATTRIBUTES, DIMENSIONS } from "../data/attributes.js";

export const reportCardRouter = Router({ mergeParams: true });

async function siteExists(siteId) {
  const result = await pool.query("SELECT 1 FROM survey.sites WHERE id = $1", [siteId]);
  return result.rows.length > 0;
}

function gradeFor(score) {
  if (score >= 85) return { grade: "A+", status: "World-class inclusive public space" };
  if (score >= 75) return { grade: "A", status: "Very good" };
  if (score >= 65) return { grade: "B", status: "Good but improvement needed" };
  if (score >= 50) return { grade: "C", status: "Moderate" };
  if (score >= 35) return { grade: "D", status: "Poor" };
  return { grade: "E", status: "Critical intervention required" };
}

reportCardRouter.get("/", asyncHandler(async (request, response) => {
  const { siteId } = request.params;
  if (!(await siteExists(siteId))) {
    response.status(404).json({ message: "Site not found" });
    return;
  }

  const result = await pool.query("SELECT attribute_code, performance FROM survey.assessments WHERE site_id = $1", [siteId]);
  const performanceByCode = new Map(result.rows.map((row) => [row.attribute_code, row.performance]));

  const dimensions = Object.entries(DIMENSIONS).map(([code, dimension]) => {
    const dimensionAttributes = ATTRIBUTES.filter((attribute) => attribute.dimension === code);
    const ratedAttributes = dimensionAttributes.filter((attribute) => performanceByCode.has(attribute.code));
    const totalWeight = ratedAttributes.reduce((sum, attribute) => sum + attribute.weight, 0);
    const score = totalWeight
      ? (ratedAttributes.reduce((sum, attribute) => sum + attribute.weight * performanceByCode.get(attribute.code), 0) / totalWeight) * 20
      : null;

    return {
      code,
      name: dimension.name,
      weight: dimension.weight,
      ratedCount: ratedAttributes.length,
      totalCount: dimensionAttributes.length,
      score,
      weightedScore: score !== null ? (score * dimension.weight) / 100 : null
    };
  });

  const ratedDimensions = dimensions.filter((dimension) => dimension.score !== null);
  const overall = ratedDimensions.length ? ratedDimensions.reduce((sum, dimension) => sum + dimension.weightedScore, 0) : null;
  const isComplete = dimensions.every((dimension) => dimension.ratedCount === dimension.totalCount);

  response.json({
    dimensions,
    overall,
    isComplete,
    ...(overall !== null ? gradeFor(overall) : { grade: null, status: null })
  });
}));

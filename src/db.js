import pg from "pg";

const { Pool } = pg;

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes("localhost") ? false : { rejectUnauthorized: false }
});

export async function initSchema() {
  await pool.query(`
    CREATE SCHEMA IF NOT EXISTS survey;

    CREATE TABLE IF NOT EXISTS survey.sites (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      location TEXT,
      lat DOUBLE PRECISION,
      lng DOUBLE PRECISION,
      typology TEXT,
      area_hectares NUMERIC,
      ownership TEXT,
      year_established INTEGER,
      accessibility_modes TEXT[] DEFAULT '{}',
      peak_visitors INTEGER,
      surrounding_land_use TEXT[] DEFAULT '{}',
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS survey.assessments (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      site_id UUID NOT NULL REFERENCES survey.sites(id) ON DELETE CASCADE,
      attribute_code TEXT NOT NULL,
      importance SMALLINT NOT NULL CHECK (importance BETWEEN 1 AND 5),
      performance SMALLINT NOT NULL CHECK (performance BETWEEN 1 AND 5),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      UNIQUE (site_id, attribute_code)
    );
  `);
}

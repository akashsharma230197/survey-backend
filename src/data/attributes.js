// 38-attribute UXQI reference set (UXF-IUPS Toolkit, Module 2 / Section III).
// Codes and weights are derived from the source spec's per-dimension tables.
export const DIMENSIONS = {
  D1: { name: "Spatial Quality", weight: 25 },
  D2: { name: "Accessibility & Inclusivity", weight: 30 },
  D3: { name: "Ecological & Environmental Comfort", weight: 25 },
  D4: { name: "Socio-Cultural Vitality", weight: 20 }
};

export const ATTRIBUTES = [
  { code: "SQ1", name: "Layout legibility", dimension: "D1", weight: 4 },
  { code: "SQ2", name: "Wayfinding clarity", dimension: "D1", weight: 4 },
  { code: "SQ3", name: "Seating adequacy", dimension: "D1", weight: 3 },
  { code: "SQ4", name: "Surface quality", dimension: "D1", weight: 3 },
  { code: "SQ5", name: "Cleanliness / maintenance", dimension: "D1", weight: 3 },
  { code: "SQ6", name: "Aesthetic character", dimension: "D1", weight: 2 },
  { code: "SQ7", name: "Activity-zone diversity", dimension: "D1", weight: 3 },
  { code: "SQ8", name: "Connectivity", dimension: "D1", weight: 1.5 },
  { code: "SQ9", name: "Spatial organisation", dimension: "D1", weight: 1 },
  { code: "SQ10", name: "Visual continuity / boundary clarity", dimension: "D1", weight: 0.5 },

  { code: "AI1", name: "Ramps & step-free access", dimension: "D2", weight: 4 },
  { code: "AI2", name: "Tactile paving", dimension: "D2", weight: 4 },
  { code: "AI3", name: "Accessible restrooms", dimension: "D2", weight: 4 },
  { code: "AI4", name: "Child-friendly design", dimension: "D2", weight: 3 },
  { code: "AI5", name: "Gender-sensitive facilities", dimension: "D2", weight: 3 },
  { code: "AI6", name: "Multi-ability seating", dimension: "D2", weight: 3 },
  { code: "AI7", name: "Economic inclusivity", dimension: "D2", weight: 2 },
  { code: "AI8", name: "Step-free access (overall)", dimension: "D2", weight: 3 },
  { code: "AI9", name: "Barrier-free routes", dimension: "D2", weight: 2 },
  { code: "AI10", name: "Universal wayfinding", dimension: "D2", weight: 2 },

  { code: "EC1", name: "Thermal comfort / shade", dimension: "D3", weight: 4 },
  { code: "EC2", name: "Greenery / vegetation cover", dimension: "D3", weight: 4 },
  { code: "EC3", name: "Noise / acoustic comfort", dimension: "D3", weight: 2 },
  { code: "EC4", name: "Air quality", dimension: "D3", weight: 3 },
  { code: "EC5", name: "Lighting quality", dimension: "D3", weight: 2 },
  { code: "EC6", name: "Drainage", dimension: "D3", weight: 2 },
  { code: "EC7", name: "Biodiversity", dimension: "D3", weight: 3 },
  { code: "EC8", name: "Microclimate", dimension: "D3", weight: 2 },
  { code: "EC9", name: "Water features", dimension: "D3", weight: 2 },

  { code: "SCV1", name: "Social interaction", dimension: "D4", weight: 3 },
  { code: "SCV2", name: "Cultural expression / events", dimension: "D4", weight: 2 },
  { code: "SCV3", name: "Safety perception", dimension: "D4", weight: 4 },
  { code: "SCV4", name: "Night safety", dimension: "D4", weight: 1 },
  { code: "SCV5", name: "Cultural identity", dimension: "D4", weight: 2 },
  { code: "SCV6", name: "Informal economy", dimension: "D4", weight: 1 },
  { code: "SCV7", name: "Women's safety", dimension: "D4", weight: 4 },
  { code: "SCV8", name: "Sense of belonging", dimension: "D4", weight: 2 },
  { code: "SCV9", name: "Demographic diversity", dimension: "D4", weight: 1 }
];

export const ATTRIBUTE_BY_CODE = new Map(ATTRIBUTES.map((attribute) => [attribute.code, attribute]));

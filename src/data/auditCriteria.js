// 62-criterion Physical Audit Tool (UXF-IUPS Toolkit, Module 3).
// Section/domain/criterion-count structure from the spec; individual line
// items derived from MoHUA Harmonised Guidelines 2021, RPwD Act 2016, and
// Story/Mueller/Mace (1998) Universal Design principles.
export const AUDIT_SECTIONS = {
  A: { domain: "Approach & entry" },
  B: { domain: "Pedestrian movement" },
  C: { domain: "Ramps & level changes" },
  D: { domain: "Wayfinding & signage" },
  E: { domain: "Street furniture & seating" },
  F: { domain: "Restrooms & water" },
  G: { domain: "Lighting & safety" },
  H: { domain: "Environmental amenities" }
};

export const AUDIT_CRITERIA = [
  { id: "A1", section: "A", description: "Clear path width ≥ 1.8 m to entry" },
  { id: "A2", section: "A", description: "Level entry / no abrupt steps" },
  { id: "A3", section: "A", description: "Ramp slope ≤ 1:12 at entry" },
  { id: "A4", section: "A", description: "Continuous handrails on entry ramps" },
  { id: "A5", section: "A", description: "Entry signage visible from the road" },
  { id: "A6", section: "A", description: "Accessible drop-off zone" },
  { id: "A7", section: "A", description: "Accessible parking near entry" },
  { id: "A8", section: "A", description: "Curb cuts at crossings near entry" },
  { id: "A9", section: "A", description: "Tactile warning at entry threshold" },
  { id: "A10", section: "A", description: "Adequate entry lighting" },

  { id: "B1", section: "B", description: "Continuous step-free path network" },
  { id: "B2", section: "B", description: "Path surface even and slip-resistant" },
  { id: "B3", section: "B", description: "Path width maintained ≥ 1.8 m throughout" },
  { id: "B4", section: "B", description: "Cross-slope ≤ 1:50" },
  { id: "B5", section: "B", description: "Obstruction-free path (no protruding objects)" },
  { id: "B6", section: "B", description: "Resting points along long paths" },
  { id: "B7", section: "B", description: "Clear sightlines along paths" },
  { id: "B8", section: "B", description: "Path edges well defined" },
  { id: "B9", section: "B", description: "Drainage does not pool on paths" },

  { id: "C1", section: "C", description: "Ramp slope compliant (≤ 1:12)" },
  { id: "C2", section: "C", description: "Ramp width ≥ 1.2 m" },
  { id: "C3", section: "C", description: "Handrails on both sides of ramps" },
  { id: "C4", section: "C", description: "Landing at top and bottom of ramp" },
  { id: "C5", section: "C", description: "Non-slip ramp surface" },
  { id: "C6", section: "C", description: "Edge protection / kerb on ramp" },
  { id: "C7", section: "C", description: "Step-free alternative provided wherever stairs exist" },

  { id: "D1", section: "D", description: "Directional signage at decision points" },
  { id: "D2", section: "D", description: "Signage in accessible format (large text / Braille / pictograms)" },
  { id: "D3", section: "D", description: "Tactile ground surface indicators (TGSI)" },
  { id: "D4", section: "D", description: "Consistent signage height and placement" },
  { id: "D5", section: "D", description: "Site map / directory provided" },
  { id: "D6", section: "D", description: "High-contrast signage" },
  { id: "D7", section: "D", description: "Multilingual signage" },
  { id: "D8", section: "D", description: "Emergency exit signage" },
  { id: "D9", section: "D", description: "Signage illuminated at night" },

  { id: "E1", section: "E", description: "Seating provided at regular intervals" },
  { id: "E2", section: "E", description: "Seat height/design suitable for elderly and disabled users" },
  { id: "E3", section: "E", description: "Shaded seating available" },
  { id: "E4", section: "E", description: "Armrests on a portion of seating" },
  { id: "E5", section: "E", description: "Litter bins accessible and within reach" },
  { id: "E6", section: "E", description: "Furniture placement does not obstruct paths" },
  { id: "E7", section: "E", description: "Accessible drinking water point" },
  { id: "E8", section: "E", description: "Furniture edges contrast-marked" },

  { id: "F1", section: "F", description: "Accessible toilet available" },
  { id: "F2", section: "F", description: "Toilet door width ≥ 900 mm" },
  { id: "F3", section: "F", description: "Grab bars installed" },
  { id: "F4", section: "F", description: "Wash basin reachable from a wheelchair" },
  { id: "F5", section: "F", description: "Signage for accessible toilet" },
  { id: "F6", section: "F", description: "Drinking water point accessible to all" },

  { id: "G1", section: "G", description: "Illuminance ≥ 50 lux on primary routes" },
  { id: "G2", section: "G", description: "No dark / unlit zones" },
  { id: "G3", section: "G", description: "CCTV coverage at key points" },
  { id: "G4", section: "G", description: "Active edges / natural surveillance" },
  { id: "G5", section: "G", description: "Emergency call / help point" },
  { id: "G6", section: "G", description: "Lighting at seating areas" },
  { id: "G7", section: "G", description: "Lighting at restrooms" },
  { id: "G8", section: "G", description: "Lighting at entry/exit points" },
  { id: "G9", section: "G", description: "Visible sightlines at night (no blind corners)" },

  { id: "H1", section: "H", description: "Shade structures / tree cover present" },
  { id: "H2", section: "H", description: "Drinking water availability" },
  { id: "H3", section: "H", description: "Waste management provided" },
  { id: "H4", section: "H", description: "Greenery / landscaping maintained" }
];

export const AUDIT_CRITERION_BY_ID = new Map(AUDIT_CRITERIA.map((criterion) => [criterion.id, criterion]));

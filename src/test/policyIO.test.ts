import { describe, it, expect } from "vitest";
import {
  buildJsonExport,
  buildCsvExport,
  parsePoliciesCsv,
  type PolicyBundle,
} from "@/lib/policyIO";

const bundle: PolicyBundle = {
  policies: [
    { name: "Wind Farm", economic: 60, wellbeing: 70, ecological: 85, intergenerational: 80 },
    { name: "Bio, Lab", economic: 55, wellbeing: 60, ecological: 50, intergenerational: 65 },
  ],
  timeline: {
    "Wind Farm": [
      { year: "Y1", positive: "jobs", negative: "noise", confidence: "high" },
    ],
    "Bio, Lab": [
      { year: "Y1", positive: "research", negative: 'risk "spill"', confidence: "medium" },
    ],
  },
  stakeholders: {
    "Wind Farm": [
      { group: "Coastal towns", benefit: 40, population: "10K", detail: "tourism" },
    ],
    "Bio, Lab": [
      { group: "Researchers", benefit: 70, population: "500", detail: "lab work" },
    ],
  },
};

describe("export option exclusion", () => {
  it("JSON omits timeline and stakeholders when both flags are false", () => {
    const text = buildJsonExport(bundle, { timeline: false, stakeholders: false });
    const obj = JSON.parse(text);
    expect(obj.policies).toHaveLength(2);
    expect("timeline" in obj).toBe(false);
    expect("stakeholders" in obj).toBe(false);
  });

  it("JSON omits only the unchecked section", () => {
    const noStake = JSON.parse(buildJsonExport(bundle, { timeline: true, stakeholders: false }));
    expect("timeline" in noStake).toBe(true);
    expect("stakeholders" in noStake).toBe(false);

    const noTime = JSON.parse(buildJsonExport(bundle, { timeline: false, stakeholders: true }));
    expect("timeline" in noTime).toBe(false);
    expect("stakeholders" in noTime).toBe(true);
  });

  it("CSV omits Timeline and Stakeholders sections when both flags are false", () => {
    const csv = buildCsvExport(bundle, { timeline: false, stakeholders: false });
    expect(csv).toContain("# Policies");
    expect(csv).not.toContain("# Timeline");
    expect(csv).not.toContain("# Stakeholders");
  });

  it("CSV omits only the unchecked section", () => {
    const noStake = buildCsvExport(bundle, { timeline: true, stakeholders: false });
    expect(noStake).toContain("# Timeline");
    expect(noStake).not.toContain("# Stakeholders");

    const noTime = buildCsvExport(bundle, { timeline: false, stakeholders: true });
    expect(noTime).not.toContain("# Timeline");
    expect(noTime).toContain("# Stakeholders");
  });
});

describe("export determinism (theme-independent diff check)", () => {
  it("produces byte-identical JSON across repeated calls", () => {
    const a = buildJsonExport(bundle, { timeline: true, stakeholders: true });
    const b = buildJsonExport(bundle, { timeline: true, stakeholders: true });
    expect(a).toBe(b);
  });

  it("produces byte-identical CSV across repeated calls", () => {
    const a = buildCsvExport(bundle, { timeline: true, stakeholders: true });
    const b = buildCsvExport(bundle, { timeline: true, stakeholders: true });
    expect(a).toBe(b);
  });

  it("CSV correctly escapes commas and quotes in field values", () => {
    const csv = buildCsvExport(bundle, { timeline: true, stakeholders: true });
    // policy name with comma must be quoted
    expect(csv).toContain('"Bio, Lab"');
    // embedded quote must be doubled
    expect(csv).toContain('"risk ""spill"""');
  });
});

describe("CSV ↔ JSON round-trip", () => {
  it("re-parses an exported CSV back into the same policies", () => {
    const csv = buildCsvExport(bundle, { timeline: true, stakeholders: true });
    const parsed = parsePoliciesCsv(csv);
    expect(parsed.errors).toEqual([]);
    expect(parsed.policies).toEqual(bundle.policies);
    expect(parsed.timeline).toEqual(bundle.timeline);
    expect(parsed.stakeholders).toEqual(bundle.stakeholders);
  });
});

describe("CSV schema validation", () => {
  it("reports a clear error for non-numeric policy fields", () => {
    const csv = [
      "# Policies",
      "name,economic,wellbeing,ecological,intergenerational",
      "Bad Policy,abc,50,60,70",
    ].join("\n");
    const result = parsePoliciesCsv(csv);
    expect(result.policies).toHaveLength(0);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors[0]).toMatch(/non-numeric economic/);
    expect(result.errors[0]).toMatch(/Line 3/);
  });

  it("reports an error for an invalid timeline confidence value", () => {
    const csv = [
      "# Policies",
      "name,economic,wellbeing,ecological,intergenerational",
      "Good,10,20,30,40",
      "",
      "# Timeline",
      "policy,year,positive,negative,confidence",
      "Good,Y1,p,n,maybe",
    ].join("\n");
    const result = parsePoliciesCsv(csv);
    expect(result.policies).toHaveLength(1);
    expect(result.errors.some((e) => /confidence/.test(e))).toBe(true);
  });

  it("reports an error when a section header is missing required columns", () => {
    const csv = [
      "# Policies",
      "name,economic,wellbeing,ecological", // missing intergenerational
      "Bad,1,2,3",
    ].join("\n");
    const result = parsePoliciesCsv(csv);
    expect(result.errors.some((e) => /intergenerational/.test(e))).toBe(true);
    expect(result.policies).toHaveLength(0);
  });

  it("skips invalid rows but still imports valid ones", () => {
    const csv = [
      "# Policies",
      "name,economic,wellbeing,ecological,intergenerational",
      "Good,10,20,30,40",
      "Bad,xx,20,30,40",
      ",10,10,10,10",
    ].join("\n");
    const result = parsePoliciesCsv(csv);
    expect(result.policies).toEqual([
      { name: "Good", economic: 10, wellbeing: 20, ecological: 30, intergenerational: 40 },
    ]);
    expect(result.errors).toHaveLength(2);
  });
});
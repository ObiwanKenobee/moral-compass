// Pure helpers for serializing / parsing custom policy data.
// Extracted so we can unit-test JSON ↔ CSV round-trips and schema validation.

export interface Policy {
  name: string;
  economic: number;
  wellbeing: number;
  ecological: number;
  intergenerational: number;
}

export interface TimelineEntry {
  year: string;
  positive: string;
  negative: string;
  confidence: "high" | "medium" | "low";
}

export interface StakeholderEntry {
  group: string;
  benefit: number;
  population: string;
  detail: string;
}

export interface PolicyBundle {
  policies: Policy[];
  timeline: Record<string, TimelineEntry[]>;
  stakeholders: Record<string, StakeholderEntry[]>;
}

export interface ExportOpts {
  timeline: boolean;
  stakeholders: boolean;
}

const escapeCsv = (val: unknown) => {
  const s = String(val ?? "");
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

// --- CSV line parser (respects quoted fields with embedded commas / "") ---
export const parseCsvLine = (line: string): string[] => {
  const out: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"' && line[i + 1] === '"') { cur += '"'; i++; }
      else if (ch === '"') { inQuotes = false; }
      else { cur += ch; }
    } else {
      if (ch === ',') { out.push(cur); cur = ""; }
      else if (ch === '"') { inQuotes = true; }
      else { cur += ch; }
    }
  }
  out.push(cur);
  return out;
};

// --- JSON export builder (pure, deterministic) ---
export const buildJsonExport = (
  bundle: PolicyBundle,
  opts: ExportOpts,
): string => {
  const data: Record<string, unknown> = {
    version: 1,
    policies: bundle.policies,
  };
  if (opts.timeline) {
    data.timeline = Object.fromEntries(
      bundle.policies.map((p) => [p.name, bundle.timeline[p.name] || []]),
    );
  }
  if (opts.stakeholders) {
    data.stakeholders = Object.fromEntries(
      bundle.policies.map((p) => [p.name, bundle.stakeholders[p.name] || []]),
    );
  }
  return JSON.stringify(data, null, 2);
};

// --- CSV export builder (pure, deterministic) ---
export const buildCsvExport = (
  bundle: PolicyBundle,
  opts: ExportOpts,
): string => {
  const lines: string[] = [];
  lines.push("# Policies");
  lines.push(["name", "economic", "wellbeing", "ecological", "intergenerational"].join(","));
  bundle.policies.forEach((p) => {
    lines.push([p.name, p.economic, p.wellbeing, p.ecological, p.intergenerational].map(escapeCsv).join(","));
  });
  if (opts.timeline) {
    lines.push("");
    lines.push("# Timeline");
    lines.push(["policy", "year", "positive", "negative", "confidence"].join(","));
    bundle.policies.forEach((p) => {
      (bundle.timeline[p.name] || []).forEach((t) => {
        lines.push([p.name, t.year, t.positive, t.negative, t.confidence].map(escapeCsv).join(","));
      });
    });
  }
  if (opts.stakeholders) {
    lines.push("");
    lines.push("# Stakeholders");
    lines.push(["policy", "group", "benefit", "population", "detail"].join(","));
    bundle.policies.forEach((p) => {
      (bundle.stakeholders[p.name] || []).forEach((s) => {
        lines.push([p.name, s.group, s.benefit, s.population, s.detail].map(escapeCsv).join(","));
      });
    });
  }
  return lines.join("\n");
};

// --- CSV import with row-level schema validation ---
export interface CsvImportResult {
  policies: Policy[];
  timeline: Record<string, TimelineEntry[]>;
  stakeholders: Record<string, StakeholderEntry[]>;
  errors: string[];
}

const POLICY_HEADER = ["name", "economic", "wellbeing", "ecological", "intergenerational"];
const TIMELINE_HEADER = ["policy", "year", "positive", "negative", "confidence"];
const STAKEHOLDER_HEADER = ["policy", "group", "benefit", "population", "detail"];

const isFiniteNumber = (s: string) => s.trim() !== "" && Number.isFinite(Number(s));

// --- Downloadable CSV template ---
export const CSV_TEMPLATE = [
  "# Policies",
  "name,economic,wellbeing,ecological,intergenerational",
  "Example Policy,60,55,70,65",
  "",
  "# Timeline",
  "policy,year,positive,negative,confidence",
  "Example Policy,Year 1-3,Initial benefits realized,Upfront cost,high",
  "",
  "# Stakeholders",
  "policy,group,benefit,population,detail",
  "Example Policy,Urban Residents,40,1.2M,Improved services",
].join("\n");

// --- SHA-256 helper using Web Crypto (browser) ---
export const sha256Hex = async (text: string): Promise<string> => {
  const enc = new TextEncoder().encode(text);
  const buf = await crypto.subtle.digest("SHA-256", enc);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
};

export const parsePoliciesCsv = (text: string): CsvImportResult => {
  const policies: Policy[] = [];
  const timeline: Record<string, TimelineEntry[]> = {};
  const stakeholders: Record<string, StakeholderEntry[]> = {};
  const errors: string[] = [];

  const rawLines = text.split(/\r?\n/);
  let section: "policies" | "timeline" | "stakeholders" | null = null;
  let header: string[] | null = null;

  rawLines.forEach((raw, idx) => {
    const lineNum = idx + 1;
    if (raw.trim() === "") { header = null; return; }
    if (raw.startsWith("#")) {
      const tag = raw.replace(/^#\s*/, "").trim().toLowerCase();
      if (tag.startsWith("polic")) section = "policies";
      else if (tag.startsWith("timeline")) section = "timeline";
      else if (tag.startsWith("stakeholder")) section = "stakeholders";
      else section = null;
      header = null;
      return;
    }
    if (!section) return;
    const cells = parseCsvLine(raw);

    // First non-comment, non-empty row in a section is the header.
    if (!header) {
      header = cells.map((c) => c.trim().toLowerCase());
      const expected =
        section === "policies" ? POLICY_HEADER
        : section === "timeline" ? TIMELINE_HEADER
        : STAKEHOLDER_HEADER;
      const missing = expected.filter((h) => !header!.includes(h));
      if (missing.length) {
        errors.push(`Line ${lineNum}: ${section} section is missing required column(s): ${missing.join(", ")}`);
        section = null; // skip this section
      }
      return;
    }

    if (section === "policies") {
      const [name, eco, well, ecol, inter] = cells;
      if (!name || !name.trim()) {
        errors.push(`Line ${lineNum}: policy row missing name`);
        return;
      }
      const numericChecks: Array<[string, string]> = [
        ["economic", eco], ["wellbeing", well], ["ecological", ecol], ["intergenerational", inter],
      ];
      const badField = numericChecks.find(([, v]) => !isFiniteNumber(v ?? ""));
      if (badField) {
        errors.push(`Line ${lineNum}: policy "${name}" has non-numeric ${badField[0]} value "${badField[1] ?? ""}"`);
        return;
      }
      policies.push({
        name: name.trim(),
        economic: Number(eco),
        wellbeing: Number(well),
        ecological: Number(ecol),
        intergenerational: Number(inter),
      });
    } else if (section === "timeline") {
      const [policy, year, positive, negative, confidence] = cells;
      if (!policy || !policy.trim()) {
        errors.push(`Line ${lineNum}: timeline row missing policy name`);
        return;
      }
      const conf = (confidence || "").trim().toLowerCase();
      if (conf && !["high", "medium", "low"].includes(conf)) {
        errors.push(`Line ${lineNum}: timeline confidence must be high|medium|low (got "${confidence}")`);
        return;
      }
      (timeline[policy] ||= []).push({
        year: year ?? "",
        positive: positive ?? "",
        negative: negative ?? "",
        confidence: (conf || "medium") as TimelineEntry["confidence"],
      });
    } else if (section === "stakeholders") {
      const [policy, group, benefit, population, detail] = cells;
      if (!policy || !policy.trim()) {
        errors.push(`Line ${lineNum}: stakeholder row missing policy name`);
        return;
      }
      if (benefit !== undefined && benefit !== "" && !isFiniteNumber(benefit)) {
        errors.push(`Line ${lineNum}: stakeholder benefit must be numeric (got "${benefit}")`);
        return;
      }
      (stakeholders[policy] ||= []).push({
        group: group ?? "",
        benefit: Number(benefit) || 0,
        population: population ?? "",
        detail: detail ?? "",
      });
    }
  });

  return { policies, timeline, stakeholders, errors };
};
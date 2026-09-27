import { readFileSync, writeFileSync, mkdirSync, copyFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import path from "node:path";
const root = process.cwd();
const base = process.env.ATLAS_SOURCE_ROOT || "/Users/rajantripathi";
const sources = {
  soas: {
    root: path.join(base, "Projects/soas-rag-evaluation"),
    repo: "soas-rag-evaluation",
  },
  vision: {
    root: path.join(base, "Projects/caselens-vlm"),
    repo: "caselens-vlm",
  },
  gate: {
    root: path.join(base, "visual-release-gate"),
    repo: "visual-release-gate",
  },
};
mkdirSync("public/evidence", { recursive: true });
mkdirSync("public/images", { recursive: true });
const manifest = [];
function snapshot(key, file, name) {
  const src = sources[key];
  const raw = readFileSync(path.join(src.root, file));
  const commit = execFileSync("git", ["rev-parse", "HEAD"], {
    cwd: src.root,
    encoding: "utf8",
  }).trim();
  writeFileSync(path.join(root, "public/evidence", name), raw);
  manifest.push({
    name,
    repository: src.repo,
    path: file,
    commit,
    sha256: createHash("sha256").update(raw).digest("hex"),
    url: `https://github.com/rajantripathi/ai-reliability-atlas/blob/v1.0.0/public/evidence/${name}`,
    snapshot: `/evidence/${name}`,
  });
  return raw.toString();
}
const csv = snapshot(
  "soas",
  "research_outputs/table_baseline_vs_supplements.csv",
  "soas-recall.csv",
);
const soasReport = snapshot(
  "soas",
  "results/reports/manual_eval_v2_uz_supplement_v2_report_20260309.md",
  "soas-methodology.md",
);
const visionReport = snapshot(
  "vision",
  "docs/results.md",
  "caselens-results.md",
);
const lines = (text) =>
  text
    .trim()
    .split("\n")
    .map((x) => JSON.parse(x));
const briefs = lines(
  snapshot("gate", "sample_pack/data/briefs.jsonl", "gate-briefs.jsonl"),
);
const labels = lines(
  snapshot("gate", "sample_pack/data/labels.jsonl", "gate-labels.jsonl"),
);
const runs = lines(
  snapshot(
    "gate",
    "docs/results/live-run-gemini-3.6-flash.jsonl",
    "gate-run.jsonl",
  ),
);
snapshot("gate", "sample_pack/PROVENANCE.md", "gate-provenance.md");
snapshot("gate", "DATA_LICENSE.md", "gate-data-license.md");
const recall = csv
  .trim()
  .split("\n")
  .slice(1)
  .map((row) => {
    const [condition, overall, en, uz] = row.split(",");
    return { condition, overall: +overall, en: +en, uz: +uz };
  });
const domains = ["Governance", "History", "Institutions", "Culture"].map(
  (domain) => {
    const section = soasReport.split(`## Uz ${domain}\n`)[1].split("\n## ")[0];
    return {
      name: domain,
      values: ["baseline", "supplement_v1", "supplement_v2"].map(
        (c) =>
          +section
            .split("\n")
            .find((r) => r.startsWith(`| ${c} |`))
            .split("|")
            .at(-2)
            .trim(),
      ),
    };
  },
);
const visionRows = visionReport
  .split("\n")
  .filter((r) =>
    /^\| (Metadata-only|Qwen3-VL summaries|Hybrid Qwen3-VL summaries) \|/.test(
      r,
    ),
  )
  .map((row) => {
    const cells = row
      .split("|")
      .slice(1, -1)
      .map((s) => s.trim());
    return {
      name: cells[0],
      evidence: cells[1],
      questions: +cells[2],
      recall5: +cells[4],
    };
  });
const cases = briefs.map((brief) => {
  const label = labels.find((x) => x.asset_id === brief.asset_id);
  const run = runs.find((x) => x.asset_id === brief.asset_id);
  const filename = path.basename(brief.image_path);
  copyFileSync(
    path.join(sources.gate.root, "sample_pack", brief.image_path),
    path.join("public/images", filename),
  );
  return {
    id: brief.asset_id,
    split: brief.split,
    image: `/images/${filename}`,
    request: brief.request,
    label: label.primary_verdict,
    rationale: label.rationale,
    provenance: label.provenance,
    run: run || null,
  };
});
const complete = cases.filter((c) => c.run?.processing_status === "completed");
const agreement = complete.filter((c) => c.run.verdict === c.label).length;
const unsafe = complete.filter(
  (c) =>
    c.run.verdict === "ship" && ["reject", "unsupported"].includes(c.label),
).length;
const data = {
  version: 1,
  soas: {
    recall,
    domains,
    n: 200,
    perLanguage: 100,
    limitation:
      "Targeted additions used evaluation-linked missing sources. This measures corpus repair on the same pilot, not generalisation to unseen questions. Full historical corpora are not bundled.",
  },
  vision: {
    rows: visionRows,
    pages: 100,
    questions: 339,
    limitation:
      "Metadata-only is a weak baseline. No OCR-text baseline was measured here, so this study does not establish that VLM summaries beat OCR. Retrieval recall is not answer accuracy.",
  },
  gate: {
    cases,
    stats: {
      total: cases.length,
      completed: complete.length,
      agreement,
      unsafe,
      incomplete: cases.length - complete.length,
    },
    limitation:
      "One live run; provisional author labels; 8 unique images reused across 24 briefs. Development and held-out cases share images. No independent label validation or image-level generalisation claim.",
  },
  sources: manifest,
};
writeFileSync(
  "public/evidence/atlas.json",
  JSON.stringify(data, null, 2) + "\n",
);
writeFileSync("lib/atlas-data.json", JSON.stringify(data, null, 2) + "\n");
console.log(
  `Imported ${manifest.length} source snapshots, ${cases.length} policy cases; ${agreement}/${complete.length} agreement.`,
);

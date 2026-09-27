import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
const data = JSON.parse(readFileSync("public/evidence/atlas.json", "utf8"));
test("the bundled application data is identical to the downloadable manifest", () => {
  assert.deepEqual(
    JSON.parse(readFileSync("lib/atlas-data.json", "utf8")),
    data,
  );
  for (const source of data.sources)
    assert.equal(
      source.url,
      `https://github.com/rajantripathi/ai-reliability-atlas/blob/v1.0.0/public/evidence/${source.name}`,
    );
});
const jsonl = (name) =>
  readFileSync(`public/evidence/${name}`, "utf8")
    .trim()
    .split("\n")
    .map((x) => JSON.parse(x));
test("every source snapshot matches its recorded SHA-256", () => {
  for (const s of data.sources) {
    assert.equal(
      createHash("sha256")
        .update(readFileSync(`public${s.snapshot}`))
        .digest("hex"),
      s.sha256,
      s.name,
    );
    assert.match(s.commit, /^[0-9a-f]{40}$/);
  }
});
test("retrieval display values reproduce the source tables", () => {
  const rows = readFileSync("public/evidence/soas-recall.csv", "utf8")
    .trim()
    .split("\n")
    .slice(1)
    .map((r) => r.split(","));
  rows.forEach((r, i) => {
    assert.equal(data.soas.recall[i].uz, +r[3]);
    assert.equal(data.soas.recall[i].en, +r[2]);
    assert.equal(data.soas.recall[i].overall, +r[1]);
    assert.ok(Math.abs((+r[2] + +r[3]) / 2 - +r[1]) < 1e-12);
  });
  const report = readFileSync("public/evidence/caselens-results.md", "utf8");
  data.vision.rows.forEach((r) => {
    const row = report
      .split("\n")
      .find((l) => l.startsWith(`| ${r.name} |`))
      .split("|")
      .map((x) => x.trim());
    assert.equal(r.recall5, +row[5]);
    assert.equal(r.questions, +row[3]);
  });
  const soas = readFileSync("public/evidence/soas-methodology.md", "utf8");
  data.soas.domains.forEach((d) => {
    const section = soas.split(`## Uz ${d.name}\n`)[1].split("\n## ")[0];
    ["baseline", "supplement_v1", "supplement_v2"].forEach((c, i) =>
      assert.equal(
        d.values[i],
        +section
          .split("\n")
          .find((l) => l.startsWith(`| ${c} |`))
          .split("|")
          .at(-2)
          .trim(),
      ),
    );
  });
});
test("gate totals derive from records, not prose; missing runs remain in denominator", () => {
  const runs = jsonl("gate-run.jsonl"),
    labels = jsonl("gate-labels.jsonl"),
    briefs = jsonl("gate-briefs.jsonl");
  const complete = runs.filter((r) => r.processing_status === "completed");
  const label = (id) => labels.find((l) => l.asset_id === id).primary_verdict;
  assert.equal(data.gate.stats.total, briefs.length);
  assert.equal(data.gate.stats.completed, complete.length);
  assert.equal(
    data.gate.stats.agreement,
    complete.filter((r) => r.verdict === label(r.asset_id)).length,
  );
  assert.equal(
    data.gate.stats.unsafe,
    complete.filter(
      (r) =>
        r.verdict === "ship" &&
        ["reject", "unsupported"].includes(label(r.asset_id)),
    ).length,
  );
  assert.equal(
    data.gate.stats.incomplete,
    runs.filter((r) => r.processing_status !== "completed").length,
  );
  assert.equal(new Set(briefs.map((b) => b.image_path)).size, 8);
  for (const c of data.gate.cases) {
    assert.deepEqual(
      c.run,
      runs.find((r) => r.asset_id === c.id),
    );
    assert.equal(c.label, label(c.id));
    assert.equal(c.provenance, "provisional_author");
  }
});

import test from "node:test";
import assert from "node:assert/strict";
import {
  rankDocuments,
  compareCorpora,
  exampleQuery,
  tokenize,
} from "../lib/retrieval.mjs";

test("a missing answer-bearing document cannot be retrieved; adding it repairs the example", () => {
  const result = compareCorpora(exampleQuery);
  assert.equal(
    result.baseline.some((d) => d.id === "expense-deadline"),
    false,
  );
  assert.equal(result.repaired[0].id, "expense-deadline");
  assert.match(result.repaired[0].text, /30 calendar days/);
  for (const rows of [result.baseline, result.repaired])
    for (const d of rows) {
      assert.ok(Number.isFinite(d.score));
      assert.ok(
        Math.abs(d.score - d.contributions.reduce((s, t) => s + t.score, 0)) <
          1e-12,
      );
    }
});
test("BM25 agrees with a hand-computed one-document example", () => {
  // df=N=1, tf=1, length=average length, so normalised tf=1; idf=ln(4/3).
  const result = rankDocuments("expense", [
    { id: "one", title: "", text: "expense" },
  ]);
  assert.ok(Math.abs(result[0].score - Math.log(4 / 3)) < 1e-12);
});
test("empty, unmatched and non-ASCII queries have defined behaviour", () => {
  assert.deepEqual(rankDocuments("expense", []), []);
  assert.deepEqual(compareCorpora("").baseline, []);
  assert.deepEqual(compareCorpora("xyzzzz").repaired, []);
  assert.deepEqual(tokenize("XARAJAT ３０"), ["xarajat", "30"]);
  assert.equal(compareCorpora("leave").baseline[0].id, "leave-policy");
});

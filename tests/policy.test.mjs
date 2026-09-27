import test from "node:test";
import assert from "node:assert/strict";
import { defaults, evaluatePolicy } from "../lib/policy.mjs";
test("all 64 flag combinations respect explicit priority and retain every trigger", () => {
  const keys = Object.keys(defaults);
  for (let mask = 0; mask < 64; mask++) {
    const input = Object.fromEntries(
      keys.map((k, i) => [k, Boolean(mask & (1 << i))]),
    );
    const result = evaluatePolicy(input);
    const expected = input.violation
      ? "reject"
      : !input.authority || !input.evidence
        ? "unsupported"
        : input.injection || input.conflict || input.ambiguous
          ? "human_review"
          : "ship";
    assert.equal(result.verdict, expected, JSON.stringify(input));
    assert.equal(
      result.trace.filter((r) => r.triggered).length,
      [
        input.violation,
        !input.authority,
        !input.evidence,
        input.injection,
        input.conflict,
        input.ambiguous,
      ].filter(Boolean).length,
    );
  }
});
test("no mutation or nondeterminism across repeated decisions", () => {
  const input = Object.freeze({ ...defaults, conflict: true, injection: true });
  assert.deepEqual(evaluatePolicy(input), evaluatePolicy(input));
  assert.equal(evaluatePolicy(input).rule, "P04");
});
test("incomplete input cannot silently approve", () =>
  assert.notEqual(evaluatePolicy({}).verdict, "ship"));

/** Educational policy, evaluated locally. Does not classify arbitrary model text. */
export const defaults = Object.freeze({
  evidence: true,
  conflict: false,
  injection: false,
  authority: true,
  ambiguous: false,
  violation: false,
});
export const ruleSpecs = [
  {
    key: "violation",
    id: "P01",
    title: "Established violation",
    verdict: "reject",
    reason: "A supplied observation establishes a rule violation.",
  },
  {
    key: "authority",
    id: "P02",
    title: "Required authority",
    verdict: "unsupported",
    reason: "The required approval record is absent.",
  },
  {
    key: "evidence",
    id: "P03",
    title: "Evidence availability",
    verdict: "unsupported",
    reason: "There is no evidence to support this answer.",
  },
  {
    key: "injection",
    id: "P04",
    title: "Untrusted instruction flagged",
    verdict: "human_review",
    reason:
      "A flagged instruction in the evidence requires review. This flag is supplied, not automatically detected.",
  },
  {
    key: "conflict",
    id: "P05",
    title: "Conflicting evidence",
    verdict: "human_review",
    reason: "The supplied sources disagree on the answer.",
  },
  {
    key: "ambiguous",
    id: "P06",
    title: "Ambiguous observation",
    verdict: "human_review",
    reason: "The observation is inconclusive.",
  },
];
export function evaluatePolicy(inputs) {
  const trace = ruleSpecs.map((rule) => ({
    ...rule,
    triggered:
      rule.key === "authority" || rule.key === "evidence"
        ? !inputs[rule.key]
        : !!inputs[rule.key],
  }));
  const decisive = trace.find((rule) => rule.triggered);
  return {
    verdict: decisive?.verdict || "ship",
    rule: decisive?.id || "P07",
    reason:
      decisive?.reason ||
      "All supplied conditions pass this educational policy.",
    trace,
  };
}

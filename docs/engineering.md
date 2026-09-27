# Engineering decisions

Author: Rajan Prasad Tripathi. The Atlas connects three existing project artifacts
to a small application with explicit, testable behaviour.

## What the application implements

- Evidence import: copy eight original source snapshots, record their local
  revisions and SHA-256 checksums, and derive displayed numbers from the tables
  and JSONL records. Tests compare the exported manifest with the application
  data and recalculate the displayed gate totals.
- BM25 retrieval: tokenise a query and a fictional corpus, calculate document
  frequencies and length-normalised term scores, sort matches, and export every
  contribution. A visitor can change the query and see rankings update.
- Policy evaluation: evaluate six supplied observations against ordered rules,
  retain all triggered rules, and export the decisive rule plus the full trace.
- Evidence interface: preserve provider errors and disagreements, expose the
  complete 24-case ledger, and provide original snapshots with reading notes.

## Run the executable retrieval example

```sh
npm ci
node scripts/retrieval-demo.mjs
node scripts/retrieval-demo.mjs "annual leave"
npm test
npm run typecheck
npm run build
npm run dev
```

No API key or GPU is required. The default query asks for a travel expense
submission deadline. The baseline corpus contains an expense-process document
but no deadline. Adding the fictional deadline policy makes the answer-bearing
document retrievable. Both rankings are computed; no saved score is substituted.

This is a mechanism demonstration, not a new benchmark result. The corpus is
small and intentionally constructed to explain coverage. BM25 is lexical; it
does not understand paraphrases, and its scores are not answer confidence.

## Data flow and boundaries

Original source artifacts → import script → hashed snapshots and manifest →
historical charts and recorded-case views.

User query + fictional corpus → BM25 → ranked documents and term contributions.

User-supplied flags → ordered policy rules → verdict and complete rule trace.

The latter two paths run locally in the browser. The historical views make no
model calls. No document upload, telemetry collection, or external inference is
part of the application.

## Why these choices

- Deterministic examples let readers reproduce behaviour without credentials.
- Original snapshots remain unchanged; interpretation notes explain obsolete
  heuristic fields instead of silently rewriting historical evidence.
- A public release holds the evidence even when an originating local revision
  is unavailable upstream. Checksums verify bytes, not experimental validity.
- Missing calls remain visible as provider errors; they are not counted as
  evaluated model decisions.
- Priority rules are explicit. They provide reproducible decisions over supplied
  flags, but cannot correct an incorrect observation or verify real authority.

## Verification

Tests include a hand-computed BM25 case, a missing-source retrieval check, empty
and unmatched query behaviour, source checksums, table arithmetic, all gate
records, and all 64 combinations of policy flags. The checked-in browser script
also covers existing controls, downloads, keyboard focus and narrow layouts.

After publishing a release, `npm run check:public` makes anonymous requests to
the site and public repository. It verifies every published source snapshot
against its recorded hash and checks that the demo is available without sign-in.

## What remains unproven

The dependency lockfile includes patched React server packages and updated build
tooling. A scoped override replaces Satori's old `fflate` dependency with 0.8.3
to avoid the malformed ZIP64 advisory GHSA-px8p-9vwx-vf98. The site uses a static
social card, but the unused transitive package is still kept patched. Package
audits are point-in-time checks, not proof of application security.

This site establishes neither production reliability nor research novelty. The
SOAS repair was evaluation-linked, CaseLens lacks an OCR baseline, and the visual
gate has provisional labels and reused images. The next useful experiments are
a held-out retrieval evaluation, an OCR comparison on the same pages/questions,
and independently adjudicated gate labels with an image-disjoint split.

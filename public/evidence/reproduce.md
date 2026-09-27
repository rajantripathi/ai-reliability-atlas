# Reproducing the Atlas

Download `source-bundle.zip` or `atlas.json` from the Evidence section. Each source entry contains its original repository, local commit, path and SHA-256 checksum. Release links point to the preserved snapshots in the public Atlas v1.0.0 release. Some originating local revisions are not available upstream; the published snapshots do not depend on those links.

Read `reading-notes.md` before interpreting the old tables. In particular, the historical SOAS “Grounded” and “Hallucination” columns are not validated answer-quality measurements. The Atlas uses the retrieval columns only.

The Atlas source includes `scripts/import-evidence.mjs`, which copies these public artifacts and derives the display values. `npm test` verifies hashes, table parsing, every gate record and all 64 policy input combinations.

The displayed SOAS comparison uses 200 questions (100 per language), not the later 400-row public dataset. Missing sources were identified with evaluation-linked knowledge: this is a targeted repair result. It does not measure generalisation to unseen questions. Full historical corpora are absent.

CaseLens measurements are reported aggregates for 100 DocVQA pages and 339 questions. The metadata-only baseline omits page text; no OCR baseline was measured. The Atlas cannot reproduce individual retrieval rankings without the original indices and per-query outputs.

Visual Release Gate agreement is recomputed from all 24 records. Nineteen completed, sixteen agreed with provisional author labels, and five have provider errors. The eight underlying images recur across development and held-out briefs. No independent label validation is implied. Raw outputs are preserved, including disagreements.

The sandbox executes a small educational policy over user-supplied booleans. It does not run a vision model, recognise injection text, verify rights, or measure model resilience. Download a JSON trace to inspect all triggered rules.

The editable retrieval example calculates BM25 scores over original fictional policies. It is separate from the SOAS measurements. Its download contains the query, both corpora and all score contributions. Reproduce it with `node scripts/retrieval-demo.mjs` from https://github.com/rajantripathi/ai-reliability-atlas.

Attribution: Rajan Prasad Tripathi. Source repositories are linked from the website and manifest. See /ATTRIBUTION.md for asset and data licences.

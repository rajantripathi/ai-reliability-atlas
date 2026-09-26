# AI Reliability Atlas

An interactive field lab by Rajan Prasad Tripathi: knowledge coverage, visual evidence and human authority in applied AI.

## Try it

```sh
npm ci
npm run dev
```

Open the local URL printed by the development server. Node 22.13 or later is required. No model API key, database, login or GPU is needed for the experiments. A Sites-hosted review can separately require owner authentication.

## What is real here?

| Surface | What happens | What it establishes |
| --- | --- | --- |
| Corpus comparison | Replays aggregate tables from the SOAS pilot | Reported recall under targeted corpus additions |
| Document retrieval | Replays CaseLens aggregate results | Evidence-layer comparison on 339 questions |
| Visual gate | Displays original assets and recorded decisions | Agreement/disagreement with provisional labels |
| Policy sandbox | Evaluates six supplied flags in local JavaScript | Exact, deterministic behaviour of the documented policy |

The Atlas does not make model calls or fabricate per-query retrieval results. Evidence snapshots and their hashes live in `public/evidence/`. Values are imported by `scripts/import-evidence.mjs` from the three original projects. The public snapshots let readers recompute the displayed arithmetic; they do not reproduce the original GPU runs.

## Evaluate

```sh
npm test
npm run typecheck
npm run build
```

Tests validate the source hashes, reported tables, all 24 gate records, and all 64 policy input combinations. CI repeats the checks and production build. The browser QA script checks desktop/mobile interactions, downloads, keyboard focus and overflow in a fresh browser.

```sh
python3 -m venv .venv
.venv/bin/pip install playwright pillow reportlab pypdf pymupdf
# Requires local Chrome and a running development server:
.venv/bin/python scripts/browser_qa.py
```

The launch artifact builder currently uses macOS Arial/Georgia fonts. Change its font directory before running it on another platform. `scripts/build_launch.py` generates a five-page PDF carousel, PNG previews, favicon and source ZIP. Launch copy is in `docs/launch.md`.

## Methodological limits

- SOAS: 200-question historical comparison; 100 questions per language. Corpus additions targeted evaluation-linked missing sources. This is repair on the evaluation set, not unseen-question generalisation. The later 400-row dataset is a different release.
- CaseLens: 100 pages, 339 questions; weak metadata baseline; no OCR baseline. Retrieval recall is not generated-answer accuracy. No raw DocVQA images are redistributed.
- Gate: provisional single-author labels, 19 completed cases, 5 provider errors, 8 images reused across 24 briefs. Held-out briefs share images with development. Zero observed unsafe approvals does not prove safety.
- Sandbox: user-supplied booleans. No automated prompt-injection detection, rights verification or real image classification. Code cannot compensate for all incorrect model observations.

## Structure

- `app/Atlas.tsx`: interactive exhibit
- `lib/policy.mjs`: explicit priority rules and complete traces
- `public/evidence/`: snapshots, manifest, reproduction guide and ZIP
- `tests/`: source and policy invariants
- `scripts/`: evidence import, browser QA and launch media generation
- `docs/launch.md`: LinkedIn, Featured, CV and GitHub profile drafts
- `PLAN.md`: delivery plan and acceptance criteria

## Credits

Source projects: [SOAS retrieval pilot](https://github.com/rajantripathi/soas-rag-evaluation), [CaseLens-VLM](https://github.com/rajantripathi/caselens-vlm), [Visual Release Gate](https://github.com/rajantripathi/visual-release-gate).

See [attribution](public/ATTRIBUTION.md) for dataset and image licences. The Atlas's original code is MIT licensed; source material keeps its original terms. No institutional endorsement is implied.

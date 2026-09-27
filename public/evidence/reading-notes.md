# How to read the historical evidence

The Atlas preserves original source snapshots byte for byte. These notes explain
their scope; they do not rewrite or independently validate the original runs.

## SOAS: retrieval columns only

`soas-methodology.md` includes historical “Grounded” and “Hallucination” columns
with values of 1.0000 and 0.0000. They came from an old heuristic pipeline and
must not be interpreted as validated perfect grounding or zero hallucinations.
The source project documents generation as a stub returning the first retrieved
sentence. No human evaluation or LLM-as-judge evaluation established answer
quality. The Atlas uses the retrieval columns only.

The 39% to 98% result concerns 100 Uzbek questions within a 200-question pilot.
Missing sources were selected using evaluation-linked information. This measures
targeted repair on that evaluation set, not generalisation to unseen questions.
The later 400-row public dataset is a separate release with documented quality
issues. It is not the denominator of the historical comparison.

Source context: https://github.com/rajantripathi/soas-rag-evaluation#limitations

## CaseLens: a limited evidence-layer comparison

The recorded comparison covers 100 pages and 339 questions. Metadata-only
retrieval has no page text and is a weak baseline. There is no OCR-text baseline,
so the result cannot establish that a VLM outperforms OCR. Recall@5 measures
retrieval, not generated-answer quality. The original report also retains a
gold-question-text sanity check; the Atlas excludes that from its comparison.

## Visual Release Gate: provisional labels

The 24 briefs reuse eight images. Nineteen model calls completed, sixteen agreed
with provisional author labels, and five encountered provider errors. There is
no independent adjudication. The recorded zero count means no completed “ship”
decision had an author label of “reject” or “unsupported”; it does not establish
safety and does not count every possible harmful decision.

## Published snapshots and original revisions

Each manifest record names the original project, path and local revision. Some
of those original revisions are not public. The clickable release link points
to the preserved snapshot in the public Atlas v1.0.0 release instead. SHA-256
checksums identify the bytes, not the truth of the claims within them.

## Runnable examples

The BM25 demo uses original fictional company policies, not the historical SOAS
corpus. It computes actual lexical rankings and exports its corpus and score
trace. The policy sandbox executes explicit rules over user-supplied flags.
Neither makes model calls or measures general AI reliability.

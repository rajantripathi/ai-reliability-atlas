"use client";
import { useRef, useState } from "react";
import data from "../lib/atlas-data.json";
import { defaults, evaluatePolicy } from "../lib/policy.mjs";
import RetrievalLab from "./RetrievalLab";

const pct = (n: number) => `${+(n * 100).toFixed(1)}%`;
const names: Record<string, string> = {
  ship: "Ship",
  reject: "Reject",
  human_review: "Human review",
  unsupported: "Unsupported",
};
const chapters = [
  {
    id: "knowledge",
    n: "01",
    label: "Knowledge",
    title: "The answer is absent.",
    metric: `${Math.round(data.soas.recall[0].uz * 100)} → ${pct(data.soas.recall[2].uz)}`,
    caption: "Uzbek retrieval recall",
    subtitle: "A targeted corpus repair study",
  },
  {
    id: "perception",
    n: "02",
    label: "Perception",
    title: "The page is invisible.",
    metric: `${+(data.vision.rows[0].recall5 * 100).toFixed(1)} → ${pct(data.vision.rows[2].recall5)}`,
    caption: "Document Recall@5",
    subtitle: "Visual evidence for scanned pages",
  },
  {
    id: "authority",
    n: "03",
    label: "Authority",
    title: "Permission is missing.",
    metric: "4 outcomes",
    caption: "One explicit decision boundary",
    subtitle: "Recorded observations, inspectable decisions",
  },
];

function Bars({
  items,
}: {
  items: { label: string; value: number; active?: boolean }[];
}) {
  return (
    <div className="bars" aria-label="Recall comparison">
      {items.map((item) => (
        <div
          className={`bar-row ${item.active ? "active" : ""}`}
          key={item.label}
        >
          <div className="bar-label">
            <span>{item.label}</span>
            <strong>{pct(item.value)}</strong>
          </div>
          <div className="bar-track">
            <div
              className="bar-fill"
              style={{ width: `${item.value * 100}%` }}
            />
          </div>
        </div>
      ))}
      <div className="axis">
        <span>0%</span>
        <span>50%</span>
        <span>100%</span>
      </div>
    </div>
  );
}

export default function Atlas() {
  const [chapter, setChapter] = useState("knowledge");
  const [condition, setCondition] = useState(0);
  const [mode, setMode] = useState(0);
  const [caseId, setCaseId] = useState("test_003");
  const [filter, setFilter] = useState("all");
  const [inputs, setInputs] = useState({ ...defaults });
  const [audience, setAudience] = useState("industry");
  const dialog = useRef<HTMLDialogElement>(null);
  const [evidence, setEvidence] = useState("soas");
  const chosen = data.gate.cases.find((c) => c.id === caseId)!;
  const decision = evaluatePolicy(inputs);
  const current = data.soas.recall[condition];
  const sourceFiles =
    evidence === "soas"
      ? ["soas-recall.csv", "soas-methodology.md"]
      : evidence === "vision"
        ? ["caselens-results.md"]
        : [
            "gate-briefs.jsonl",
            "gate-labels.jsonl",
            "gate-run.jsonl",
            "gate-provenance.md",
            "gate-data-license.md",
          ];
  const openEvidence = (kind: string) => {
    setEvidence(kind);
    dialog.current?.showModal();
  };
  const records = data.gate.cases.filter(
    (c) =>
      filter === "all" ||
      (filter === "disagreements" &&
        c.run?.processing_status === "completed" &&
        c.run.verdict !== c.label) ||
      (filter === "incomplete" && c.run?.processing_status !== "completed"),
  );
  function exportDecision() {
    const blob = new Blob(
      [
        JSON.stringify(
          {
            kind: "educational_policy_simulation",
            inputs,
            ...decision,
            scope:
              "Supplied flags only. No live model, threat detector or legal verification.",
          },
          null,
          2,
        ),
      ],
      { type: "application/json" },
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "atlas-policy-trace.json";
    a.click();
    URL.revokeObjectURL(url);
  }
  return (
    <>
      <a href="#experiments" className="skip-link">
        Skip to experiments
      </a>
      <div className="shell">
        <nav aria-label="Primary">
          <a
            className="brand"
            href="#top"
            aria-label="AI Reliability Atlas home"
          >
            A / R{" "}
            <span>
              AI RELIABILITY
              <br />
              ATLAS
            </span>
          </a>
          <div className="nav-links">
            <a href="#experiments">Field lab</a>
            <a href="#sandbox">Policy sandbox</a>
            <a href="#research">Evidence</a>
            <a className="nav-contact" href="#about">
              Meet the engineer ↗
            </a>
          </div>
        </nav>
        <header className="hero" id="top">
          <div className="hero-main">
            <div>
              <p className="eyebrow">
                <span className="live-dot" /> FIELD NOTES FROM APPLIED AI · VOL.
                01
              </p>
              <h1>
                Where AI breaks.
                <br />
                <em>
                  What the
                  <br className="desktop-break" /> evidence says.
                </em>
              </h1>
              <p className="intro">
                Knowledge can be missing. A page can be unreadable. Permission
                can be unprovable. Explore three experiments in building more
                reliable AI.
              </p>
              <a className="button" href="#experiments">
                Explore the field lab <span>↓</span>
              </a>
              <p className="byline">
                By Rajan Tripathi, PhD <span>Research × engineering</span>
              </p>
            </div>
            <aside className="field-card" aria-label="Atlas field guide">
              <p className="eyebrow">THE RELIABILITY BOUNDARY</p>
              <div className="field-route">
                {[
                  "Knowledge coverage",
                  "Evidence retrieval",
                  "Model observation",
                  "Policy validation",
                  "Human authority",
                ].map((name, i) => (
                  <div className="route-step" key={name}>
                    <span>{String(i + 1).padStart(2, "0")}</span>
                    <p>{name}</p>
                    <span className="route-marker">{i === 4 ? "◎" : "↓"}</span>
                  </div>
                ))}
              </div>
              <p className="field-caption">
                A fluent answer is only one part
                <br />
                of a dependable system.
              </p>
              <span className="field-stamp">OBSERVE / MEASURE / QUESTION</span>
            </aside>
          </div>
          <div className="hero-strip">
            <span>THREE CASE STUDIES</span>
            <span>SOURCE ARTIFACTS INCLUDED</span>
            <span>NO API KEY REQUIRED</span>
          </div>
        </header>

        <section
          className="section"
          id="experiments"
          aria-labelledby="lab-title"
        >
          <div className="section-heading">
            <div>
              <p className="eyebrow">01 — THE FIELD LAB</p>
              <h2 id="lab-title">Follow the failure.</h2>
            </div>
            <p>
              Change a condition. Inspect the result.
              <br />
              Understand what the measurement establishes.
            </p>
          </div>
          <div className="case-grid">
            {chapters.map((c) => (
              <button
                type="button"
                className={`case ${chapter === c.id ? "selected" : ""}`}
                key={c.id}
                aria-pressed={chapter === c.id}
                aria-controls="experiment-panel"
                onClick={() => setChapter(c.id)}
              >
                <span className="case-top">
                  <span>
                    {c.n} / {c.label.toUpperCase()}
                  </span>
                  <span>↗</span>
                </span>
                <h3>{c.title}</h3>
                <strong>{c.metric}</strong>
                <p>{c.caption}</p>
                <span className="case-foot">{c.subtitle}</span>
              </button>
            ))}
          </div>
          <div id="experiment-panel" className="experiment" aria-live="polite">
            {chapter === "knowledge" && (
              <>
                <div className="experiment-head">
                  <span className="tag">Historical measurement</span>
                  <button
                    className="text-button"
                    onClick={() => openEvidence("soas")}
                  >
                    Inspect source evidence ↗
                  </button>
                </div>
                <div className="two-col">
                  <div>
                    <p className="eyebrow">
                      EXPERIMENT 01 / SOAS RETRIEVAL PILOT
                    </p>
                    <h3 className="panel-title">
                      You cannot retrieve
                      <br />
                      what is not there.
                    </h3>
                    <p>
                      Keep the retriever fixed. Change the corpus. Compare three
                      historical runs on the same 200-question English–Uzbek
                      pilot.
                    </p>
                    <fieldset className="choice-group">
                      <legend>Choose the corpus</legend>
                      {["Baseline", "Supplement v1", "Supplement v2"].map(
                        (label, i) => (
                          <button
                            key={label}
                            className={condition === i ? "chosen" : ""}
                            aria-pressed={condition === i}
                            onClick={() => setCondition(i)}
                          >
                            {label}
                          </button>
                        ),
                      )}
                    </fieldset>
                    <div className="metric-pair">
                      <div>
                        <strong>{pct(current.uz)}</strong>
                        <span>Uzbek recall · 100 questions</span>
                      </div>
                      <div>
                        <strong>{pct(current.en)}</strong>
                        <span>English recall · 100 questions</span>
                      </div>
                    </div>
                    <p className="insight">
                      {condition === 0
                        ? "61 of 100 Uzbek questions did not retrieve their labelled source under the baseline condition."
                        : condition === 1
                          ? "Adding missing history and institution sources brought the Uzbek recall to 80%."
                          : "Structured source additions raised Uzbek recall to 98% on this evaluation set. English remained unchanged."}
                    </p>
                  </div>
                  <div className="chart-panel">
                    <div className="chart-title">
                      Where coverage changed
                      <span>Uzbek recall by domain · n = 25 each</span>
                    </div>
                    <Bars
                      items={data.soas.domains.map((d) => ({
                        label: d.name,
                        value: d.values[condition],
                        active: true,
                      }))}
                    />
                    <div className="micro-callout">
                      <strong>
                        {condition === 0
                          ? "Corpus coverage is a system dependency."
                          : `+${Math.round((current.uz - data.soas.recall[0].uz) * 100)} percentage points vs baseline`}
                      </strong>
                      <p>
                        These are reported retrieval measurements. Changing the
                        selection replays a configuration; it does not run
                        inference.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="limitation">
                  <strong>Read the result carefully</strong>
                  <p>
                    {data.soas.limitation} The public 400-row dataset is a later
                    release, separate from this 200-question comparison.
                    Generation quality was not measured here.
                  </p>
                </div>
              </>
            )}

            {chapter === "perception" && (
              <>
                <div className="experiment-head">
                  <span className="tag">Historical measurement</span>
                  <button
                    className="text-button"
                    onClick={() => openEvidence("vision")}
                  >
                    Inspect source evidence ↗
                  </button>
                </div>
                <div className="two-col">
                  <div>
                    <p className="eyebrow">EXPERIMENT 02 / CASELENS-VLM</p>
                    <h3 className="panel-title">
                      A page has more to say
                      <br />
                      than its filename.
                    </h3>
                    <p>
                      On 100 scanned DocVQA pages and 339 questions, compare the
                      evidence available to the retriever.
                    </p>
                    <fieldset className="choice-group">
                      <legend>Choose the evidence layer</legend>
                      {["Metadata", "VLM summaries", "Hybrid retrieval"].map(
                        (label, i) => (
                          <button
                            key={label}
                            className={mode === i ? "chosen" : ""}
                            aria-pressed={mode === i}
                            onClick={() => setMode(i)}
                          >
                            {label}
                          </button>
                        ),
                      )}
                    </fieldset>
                    <div className="metric-pair">
                      <div>
                        <strong>{pct(data.vision.rows[mode].recall5)}</strong>
                        <span>Recall@5 · same 339 questions</span>
                      </div>
                    </div>
                    <p className="insight">
                      {
                        [
                          "Only page identifiers and metadata are indexed. The visual content is absent.",
                          "Qwen3-VL descriptions and extracted visible text make page content searchable.",
                          "BM25 plus MiniLM embeddings search the same VLM evidence using lexical and semantic signals.",
                        ][mode]
                      }
                    </p>
                  </div>
                  <div className="chart-panel">
                    <div className="chart-title">
                      Same questions. Different evidence.
                      <span>Reported Recall@5 · higher is better</span>
                    </div>
                    <Bars
                      items={data.vision.rows.map((r, i) => ({
                        label: ["Metadata only", "VLM summaries", "Hybrid"][i],
                        value: r.recall5,
                        active: mode === i,
                      }))}
                    />
                    <div className="evidence-stack">
                      <span className="eyebrow">INDEXED REPRESENTATION</span>
                      <code>
                        {
                          [
                            "page_id · doc_id · page_number · question_type",
                            "page_id + visible text + visual descriptions",
                            "VLM descriptions → BM25 ∥ MiniLM → fused ranking",
                          ][mode]
                        }
                      </code>
                      <p>
                        Representation schematic. Raw DocVQA pages and model
                        outputs are not bundled in this exhibit.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="limitation">
                  <strong>What this comparison cannot establish</strong>
                  <p>
                    {data.vision.limitation} The model ran on a GH200 node; this
                    website replays the published aggregates.
                  </p>
                </div>
              </>
            )}

            {chapter === "authority" && (
              <>
                <div className="experiment-head">
                  <span className="tag">Recorded model run</span>
                  <button
                    className="text-button"
                    onClick={() => openEvidence("gate")}
                  >
                    Inspect source evidence ↗
                  </button>
                </div>
                <p className="eyebrow">EXPERIMENT 03 / VISUAL RELEASE GATE</p>
                <h3 className="panel-title">Same pixels. Different brief.</h3>
                <p>
                  Compare the recorded gate decision with a provisional author
                  label. Change the brief to see how the required evidence
                  changes.
                </p>
                <div className="gate-choices">
                  {[
                    ["test_003", "Check a phone"],
                    ["dev_002", "Wave hello"],
                    ["test_004", "Confirm client approval"],
                    ["dev_003", "Sit comfortably"],
                  ].map(([id, label]) => (
                    <button
                      key={id}
                      aria-pressed={caseId === id}
                      className={caseId === id ? "chosen" : ""}
                      onClick={() => setCaseId(id)}
                    >
                      {label}
                    </button>
                  ))}
                  <label>
                    All 24 cases
                    <select
                      value={caseId}
                      onChange={(e) => setCaseId(e.target.value)}
                    >
                      {data.gate.cases.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.id} · {c.request}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
                <div className="two-col gate-view">
                  <div className="asset-frame">
                    <img
                      src={chosen.image}
                      alt={`ExampleCo fictional illustration used in case ${chosen.id}: ${chosen.request}`}
                      width="1536"
                      height="1024"
                    />
                    <span>
                      {chosen.id} · {chosen.split.replace("_", " ")} · original
                      fictional asset
                    </span>
                  </div>
                  <div>
                    <p className="eyebrow">THE BRIEF</p>
                    <h4 className="brief">{chosen.request}</h4>
                    <div className="verdict-pair">
                      <div>
                        <small>Recorded gate</small>
                        <span
                          className={`verdict ${chosen.run?.verdict || "incomplete"}`}
                        >
                          {chosen.run?.verdict
                            ? names[chosen.run.verdict]
                            : "Not completed"}
                        </span>
                      </div>
                      <div>
                        <small>Provisional author</small>
                        <span className={`verdict ${chosen.label}`}>
                          {names[chosen.label]}
                        </span>
                      </div>
                    </div>
                    <p>{chosen.run?.summary}</p>
                    <div className="author-note">
                      <strong>Author rationale</strong>
                      <p>{chosen.rationale}</p>
                    </div>
                    {chosen.run?.processing_status === "completed" &&
                      chosen.run.verdict !== chosen.label && (
                        <p className="disagreement">
                          Disagreement preserved. This case has not been
                          independently adjudicated.
                        </p>
                      )}
                    {chosen.run?.blocking_reason && (
                      <p className="disagreement">
                        {chosen.run.blocking_reason}
                      </p>
                    )}
                    <details>
                      <summary>
                        Inspect recorded observations and citations
                      </summary>
                      <pre>
                        {JSON.stringify(
                          {
                            issues: chosen.run?.issues,
                            unverifiable_checks:
                              chosen.run?.unverifiable_checks,
                            telemetry: chosen.run?.telemetry,
                          },
                          null,
                          2,
                        )}
                      </pre>
                    </details>
                  </div>
                </div>
                <div className="run-stats">
                  <div>
                    <strong>
                      {data.gate.stats.agreement}/{data.gate.stats.completed}
                    </strong>
                    <span>Agreement with author labels</span>
                  </div>
                  <div>
                    <strong>
                      {data.gate.stats.incomplete}/{data.gate.stats.total}
                    </strong>
                    <span>Provider errors · not evaluated</span>
                  </div>
                  <div>
                    <strong>{data.gate.stats.unsafe}</strong>
                    <span>Observed unsafe approvals*</span>
                  </div>
                </div>
                <p className="fine">
                  *Gate said “ship” while author labelled “reject” or
                  “unsupported”. Zero in this small run does not demonstrate
                  safety. The model selected no human-review decisions among the
                  19 completions.
                </p>
                <details className="ledger">
                  <summary>Open the complete 24-case ledger</summary>
                  <div className="filter-controls">
                    <label>
                      Show
                      <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                      >
                        <option value="all">All cases</option>
                        <option value="disagreements">Disagreements</option>
                        <option value="incomplete">Not completed</option>
                      </select>
                    </label>
                    <span>{records.length} records</span>
                  </div>
                  <div className="table-scroll">
                    <table>
                      <caption>
                        Recorded decisions compared with provisional labels
                      </caption>
                      <thead>
                        <tr>
                          <th>Case</th>
                          <th>Split</th>
                          <th>Author label</th>
                          <th>Gate decision</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {records.map((c) => (
                          <tr key={c.id}>
                            <td>
                              <button
                                className="text-button"
                                onClick={() => setCaseId(c.id)}
                              >
                                {c.id}
                              </button>
                            </td>
                            <td>{c.split.replace("_", " ")}</td>
                            <td>{names[c.label]}</td>
                            <td>
                              {c.run?.verdict ? names[c.run.verdict] : "—"}
                            </td>
                            <td>
                              {c.run?.processing_status !== "completed"
                                ? "Provider error"
                                : c.label === c.run.verdict
                                  ? "Agreement"
                                  : "Disagreement"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </details>
                <div className="limitation">
                  <strong>Agreement is not validated accuracy</strong>
                  <p>
                    {data.gate.limitation} Code enforces rules over
                    observations, but incorrect observations can still produce
                    incorrect decisions.
                  </p>
                </div>
              </>
            )}
            {chapter === "knowledge" && <RetrievalLab />}
          </div>
        </section>

        <section className="section sandbox-section" id="sandbox">
          <div className="section-heading">
            <div>
              <p className="eyebrow">02 — THE POLICY SANDBOX</p>
              <h2>
                Change the conditions.
                <br />
                <em>Inspect the decision.</em>
              </h2>
            </div>
            <p>
              A runnable teaching model.
              <br />
              Each switch evaluates real policy code locally.
            </p>
          </div>
          <div className="sandbox-grid">
            <div className="controls">
              <span className="tag">
                Educational simulation · no model call
              </span>
              <h3>What does the system know?</h3>
              {(
                [
                  {
                    key: "evidence",
                    label: "Supporting evidence is present",
                    hint: "A source is available for the proposed answer.",
                  },
                  {
                    key: "authority",
                    label: "Required approval is on file",
                    hint: "An approval flag is supplied for this example.",
                  },
                  {
                    key: "violation",
                    label: "A clear violation is observed",
                    hint: "A supplied observation breaks an explicit rule.",
                  },
                  {
                    key: "conflict",
                    label: "Sources contradict each other",
                    hint: "Evidence supports incompatible conclusions.",
                  },
                  {
                    key: "injection",
                    label: "Untrusted instruction is flagged",
                    hint: "A supplied flag marks a suspicious source instruction.",
                  },
                  {
                    key: "ambiguous",
                    label: "The observation is ambiguous",
                    hint: "The evidence allows multiple interpretations.",
                  },
                ] as const
              ).map((control) => (
                <label
                  className="switch-row"
                  key={control.key}
                  htmlFor={`flag-${control.key}`}
                  aria-label={control.label}
                >
                  <span>
                    <strong>{control.label}</strong>
                    <small>{control.hint}</small>
                  </span>
                  <input
                    id={`flag-${control.key}`}
                    type="checkbox"
                    checked={inputs[control.key]}
                    onChange={(e) =>
                      setInputs({ ...inputs, [control.key]: e.target.checked })
                    }
                  />
                </label>
              ))}
              <button
                className="text-button"
                onClick={() => setInputs({ ...defaults })}
              >
                ↺ Reset conditions
              </button>
            </div>
            <div className="decision-panel" aria-live="polite">
              <div className="decision-top">
                <span className="eyebrow">POLICY OUTPUT</span>
                <span>{decision.rule}</span>
              </div>
              <div className={`decision-word ${decision.verdict}`}>
                {names[decision.verdict]}
              </div>
              <p>{decision.reason}</p>
              <div className="trace">
                {decision.trace.map((rule) => (
                  <div
                    key={rule.id}
                    className={rule.triggered ? "triggered" : ""}
                  >
                    <span>{rule.id}</span>
                    <p>{rule.title}</p>
                    <span>{rule.triggered ? "TRIGGERED" : "CLEAR"}</span>
                  </div>
                ))}
              </div>
              <p className="fine">
                Priority: reject → missing authority/evidence → human review →
                ship. All triggered rules remain visible. “Ship” means these
                supplied flags pass; it is not permission for real publication.
              </p>
              <button className="button" onClick={exportDecision}>
                Download decision trace <span>↓</span>
              </button>
            </div>
          </div>
          <p className="sandbox-scope">
            The flags are supplied by you. This simulator does not detect prompt
            injection, verify approvals, judge arbitrary images, or establish
            that a model is safe. It demonstrates an inspectable boundary
            between observations and decisions.
          </p>
        </section>

        <section className="section research" id="research">
          <div className="section-heading">
            <div>
              <p className="eyebrow">03 — OPEN THE NOTEBOOK</p>
              <h2>Evidence you can inspect.</h2>
            </div>
            <a className="text-button" href="/evidence/atlas.json" download>
              Download evidence manifest ↓
            </a>
          </div>
          <div className="research-grid">
            <article>
              <span className="index">A / DATA</span>
              <h3>Sources travel with the claims.</h3>
              <p>
                Local snapshots, source commits and SHA-256 checksums connect
                the displayed results to the artifacts used to build this
                exhibit.
              </p>
              <a href="/evidence/source-bundle.zip" download>
                Download source bundle ↗
              </a>
            </article>
            <article>
              <span className="index">B / METHOD</span>
              <h3>Different questions. Different metrics.</h3>
              <p>
                Retrieval recall, model agreement and policy behaviour are
                different measures. The Atlas keeps their samples, definitions
                and limits visible.
              </p>
              <button
                className="text-button"
                onClick={() => openEvidence("soas")}
              >
                Read a methodology snapshot ↗
              </button>
            </article>
            <article>
              <span className="index">C / REPRODUCTION</span>
              <h3>Audit what is available.</h3>
              <p>
                The bundle reproduces the displayed arithmetic and gate
                agreement. Re-running the original retrieval experiments needs
                their corpora, models and compute.
              </p>
              <a href="/evidence/reproduce.md">Reproduction guide ↗</a>
            </article>
          </div>
          <div className="source-links">
            <a
              href="https://github.com/rajantripathi/soas-rag-evaluation"
              target="_blank"
              rel="noreferrer"
            >
              SOAS retrieval pilot ↗
            </a>
            <a
              href="https://github.com/rajantripathi/caselens-vlm"
              target="_blank"
              rel="noreferrer"
            >
              CaseLens-VLM ↗
            </a>
            <a
              href="https://github.com/rajantripathi/visual-release-gate"
              target="_blank"
              rel="noreferrer"
            >
              Visual Release Gate ↗
            </a>
            <a
              href="https://doi.org/10.5281/zenodo.21067667"
              target="_blank"
              rel="noreferrer"
            >
              Dataset DOI ↗
            </a>
          </div>
        </section>

        <section className="section about" id="about">
          <div>
            <p className="eyebrow">THE ENGINEER BEHIND THE EXPERIMENTS</p>
            <h2>
              Rajan Tripathi, <em>PhD</em>
            </h2>
            <p className="intro">
              Applied AI engineering across multilingual retrieval, multimodal
              evidence and governed workflows.
            </p>
            <div className="implementation-note">
              <strong>What I built</strong>
              <p>
                An evidence import pipeline with checksum checks, a
                browser-based BM25 retriever with per-term scoring traces, and
                an explicit decision policy tested across all 64 input
                combinations. The historical model runs are replayed and
                labelled separately.
              </p>
              <a
                href="https://github.com/rajantripathi/ai-reliability-atlas/blob/main/docs/engineering.md"
                target="_blank"
                rel="noreferrer"
              >
                Read the engineering decisions and reproduction steps ↗
              </a>
            </div>
            <div className="audience-controls">
              <button
                aria-pressed={audience === "industry"}
                className={audience === "industry" ? "chosen" : ""}
                onClick={() => setAudience("industry")}
              >
                For industry
              </button>
              <button
                aria-pressed={audience === "research"}
                className={audience === "research" ? "chosen" : ""}
                onClick={() => setAudience("research")}
              >
                For research & teaching
              </button>
            </div>
            <p className="audience-copy">
              {audience === "industry"
                ? "This work demonstrates how I connect data quality, model integration, measurable retrieval performance and auditable decision logic. Interested in senior Applied AI, Enterprise GenAI and AI Solutions Architecture roles."
                : "These exhibits expose study design, source provenance and failure cases. They offer starting points for independent annotation, stronger retrieval baselines and generalisation studies, and can support a hands-on reliability teaching session."}
            </p>
            <a
              className="button"
              href="https://www.linkedin.com/in/rajan-tripathi-phd-14135243/"
              target="_blank"
              rel="noreferrer"
            >
              Connect on LinkedIn <span>↗</span>
            </a>
            <a
              className="secondary-link"
              href="https://github.com/rajantripathi/ai-reliability-atlas"
              target="_blank"
              rel="noreferrer"
            >
              Read the Atlas code ↗
            </a>
          </div>
          <aside className="about-note">
            <p className="eyebrow">A QUESTION WORTH ASKING</p>
            <blockquote>
              “What would have to be true for this answer to deserve our trust?”
            </blockquote>
            <p>
              Start with the evidence.
              <br />
              Make the assumptions visible.
              <br />
              Keep the failure cases.
            </p>
          </aside>
        </section>
        <footer>
          <span>A / R · AI RELIABILITY ATLAS</span>
          <span>
            Built from research artifacts, recorded runs and explicit rules.
          </span>
          <a href="/ATTRIBUTION.md">Attribution & licences ↗</a>
        </footer>
      </div>
      <dialog ref={dialog} className="evidence-dialog">
        <div className="dialog-head">
          <span className="eyebrow">SOURCE NOTEBOOK</span>
          <button
            aria-label="Close source notebook"
            onClick={() => dialog.current?.close()}
          >
            ×
          </button>
        </div>
        <h2>
          {evidence === "soas"
            ? "Knowledge coverage"
            : evidence === "vision"
              ? "Visual retrieval"
              : "Model observations & labels"}
        </h2>
        <p>
          Original snapshots are preserved in the public Atlas release. Each
          record retains its originating project, local revision and checksum.
          The release links open the exact published snapshot; they do not imply
          that every originating revision is available upstream.
        </p>
        {evidence === "soas" && (
          <div className="limitation">
            <strong>Read the historical table correctly</strong>
            <p>
              The report contains “Grounded = 1.0000” and “Hallucination =
              0.0000” columns from the old heuristic pipeline. These are not
              validated measures of answer quality. Generation was a stub that
              returned the first retrieved sentence; no human or model-judge
              evaluation established perfect grounding or zero hallucinations.
              The Atlas uses only the retrieval columns.
            </p>
          </div>
        )}
        <p>
          <a
            className="text-button"
            href="/evidence/reading-notes.md"
            target="_blank"
            rel="noreferrer"
          >
            Read interpretation and provenance notes ↗
          </a>
        </p>
        {data.sources
          .filter((s) => sourceFiles.includes(s.name))
          .map((s) => (
            <article key={s.name} className="source-record">
              <h3>{s.name}</h3>
              <p>
                {s.repository} / {s.path}
              </p>
              <div>
                <a href={s.snapshot} target="_blank" rel="noreferrer">
                  Open original snapshot ↗
                </a>
                <a href={s.url} target="_blank" rel="noreferrer">
                  Published release copy ↗
                </a>
              </div>
              <small>Originating local revision</small>
              <code>{s.commit}</code>
              <small>SHA-256</small>
              <code>{s.sha256}</code>
            </article>
          ))}
        <p className="fine">
          A matching hash verifies the snapshot has not changed. It does not
          independently validate the original experiment or labels.
        </p>
      </dialog>
    </>
  );
}

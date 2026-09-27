"use client";
import { useState } from "react";
import { compareCorpora, exampleQuery } from "../lib/retrieval.mjs";

export default function RetrievalLab() {
  const [query, setQuery] = useState(exampleQuery);
  const result = compareCorpora(query);
  const preset = query.trim() === exampleQuery;
  function download() {
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(result, null, 2)], { type: "application/json" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = "atlas-retrieval-trace.json";
    a.click();
    URL.revokeObjectURL(url);
  }
  return (
    <section className="retrieval-lab" aria-labelledby="retrieval-title">
      <span className="tag">Runnable example · fictional documents</span>
      <h3 id="retrieval-title" className="panel-title">
        Watch a missing source change the result.
      </h3>
      <p>
        This small BM25 retriever runs in your browser. Search three fictional
        company documents, then compare the ranking after adding the missing
        expense policy. Every score below is calculated from the query and
        document text.
      </p>
      <label className="query-label" htmlFor="retrieval-query">
        Your search query
      </label>
      <input
        id="retrieval-query"
        className="query-input"
        value={query}
        maxLength={250}
        onChange={(e) => setQuery(e.target.value)}
        spellCheck={false}
      />
      <div className="retrieval-actions">
        <button className="text-button" onClick={() => setQuery(exampleQuery)}>
          Reset example query
        </button>
        <button className="text-button" onClick={download}>
          Download query, corpus & scoring trace ↓
        </button>
      </div>
      <div className="retrieval-comparison" aria-live="polite">
        {(
          [
            {
              key: "baseline",
              title: "Before · 3 documents",
              rows: result.baseline,
            },
            {
              key: "repaired",
              title: "After · 4 documents",
              rows: result.repaired,
            },
          ] as const
        ).map((side) => (
          <article key={side.key}>
            <h4>{side.title}</h4>
            <p className="retrieval-outcome">
              {preset
                ? side.key === "baseline"
                  ? "The answer-bearing policy is absent. A high ranking alone cannot supply the deadline."
                  : "The added policy states the deadline: 30 calendar days after the trip ends."
                : "Custom query: inspect the text yourself. No answer correctness label is assigned."}
            </p>
            {side.rows.length === 0 ? (
              <p>No matching terms. Try “expense”, “travel” or “leave”.</p>
            ) : (
              <ol className="ranked-documents">
                {side.rows.slice(0, 3).map((doc, index) => (
                  <li key={doc.id}>
                    <div className="rank-heading">
                      <strong>
                        {index + 1}. {doc.title}
                      </strong>
                      <span>BM25 {doc.score.toFixed(3)}</span>
                    </div>
                    <p>{doc.text}</p>
                    <details>
                      <summary>Why did this document rank here?</summary>
                      <p>
                        Matched query terms and their contribution to the score:
                      </p>
                      <ul className="term-scores">
                        {doc.contributions
                          .filter((t) => t.score > 0)
                          .map((t) => (
                            <li key={t.term}>
                              <code>{t.term}</code>
                              <span>{t.score.toFixed(3)}</span>
                            </li>
                          ))}
                      </ul>
                    </details>
                  </li>
                ))}
              </ol>
            )}
          </article>
        ))}
      </div>
      <p className="fine">
        This is a controlled teaching example, separate from the historical
        English–Uzbek study. It performs lexical retrieval, not semantic
        understanding or answer generation. BM25 scores are not probabilities
        and should not be compared as confidence across the two corpora.
      </p>
      <details>
        <summary>Inspect the implementation</summary>
        <p>
          Documents are tokenised in lowercase with a small stopword list. BM25
          uses k1 = 1.2 and b = 0.75 over titles and body text. Adding a
          document also changes corpus statistics. The exported trace contains
          all documents, rankings and per-term contributions.
        </p>
        <a
          className="text-button"
          href="https://github.com/rajantripathi/ai-reliability-atlas/blob/main/lib/retrieval.mjs"
          target="_blank"
          rel="noreferrer"
        >
          Read the retrieval code and reproduce it ↗
        </a>
      </details>
    </section>
  );
}

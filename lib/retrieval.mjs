/** A small, dependency-free BM25 demonstration. All documents are fictional. */
export const exampleQuery = "What is the travel expense submission deadline?";
export const baseCorpus = Object.freeze([
  {
    id: "travel-booking",
    title: "Travel booking",
    text: "Book work travel through the company portal. Compare flight and hotel prices before requesting manager approval.",
  },
  {
    id: "expense-process",
    title: "Expense processing",
    text: "Travel expense claims need itemised receipts. Finance reviews each expense submission and pays approved claims in the next payment cycle.",
  },
  {
    id: "leave-policy",
    title: "Annual leave",
    text: "Submit annual leave requests at least ten working days before departure. Your manager confirms coverage.",
  },
]);
export const missingDocument = Object.freeze({
  id: "expense-deadline",
  title: "Travel expense deadline",
  text: "The travel expense submission deadline is 30 calendar days after the trip ends. Late claims require written approval from Finance.",
});
const stopwords = new Set(
  "a an and are as at be before by for from how in is it of on or the through to what which with".split(
    " ",
  ),
);
export function tokenize(text) {
  return (
    String(text)
      .normalize("NFKC")
      .toLowerCase()
      .match(/[\p{L}\p{N}]+/gu) || []
  ).filter((t) => !stopwords.has(t));
}
export function rankDocuments(query, documents, { k1 = 1.2, b = 0.75 } = {}) {
  const terms = [...new Set(tokenize(query))];
  const indexed = documents.map((doc) => ({
    ...doc,
    tokens: tokenize(`${doc.title} ${doc.text}`),
  }));
  const averageLength =
    indexed.reduce((sum, d) => sum + d.tokens.length, 0) /
    (indexed.length || 1);
  return indexed
    .map((doc) => {
      const contributions = terms.map((term) => {
        const frequency = doc.tokens.filter((t) => t === term).length;
        const documentFrequency = indexed.filter((d) =>
          d.tokens.includes(term),
        ).length;
        const idf = Math.log(
          1 +
            (indexed.length - documentFrequency + 0.5) /
              (documentFrequency + 0.5),
        );
        const score =
          frequency === 0
            ? 0
            : (idf * frequency * (k1 + 1)) /
              (frequency +
                k1 * (1 - b + (b * doc.tokens.length) / (averageLength || 1)));
        return { term, frequency, documentFrequency, idf, score };
      });
      return {
        id: doc.id,
        title: doc.title,
        text: doc.text,
        length: doc.tokens.length,
        score: contributions.reduce((s, t) => s + t.score, 0),
        contributions,
      };
    })
    .filter((d) => d.score > 0)
    .sort((a, b) => b.score - a.score || a.id.localeCompare(b.id));
}
export function compareCorpora(query) {
  const supplemented = [...baseCorpus, missingDocument];
  return {
    query,
    kind: "fictional_bm25_demonstration",
    parameters: { k1: 1.2, b: 0.75 },
    baseline: rankDocuments(query, baseCorpus),
    repaired: rankDocuments(query, supplemented),
    corpora: { baseline: baseCorpus, repaired: supplemented },
    scope:
      "Synthetic teaching example. Scores are lexical relevance, not confidence or proof that a document answers the question. No model call or answer generation.",
  };
}

export interface SourceDocument {
  id: string;
  title: string;
  text: string;
}
export interface TermContribution {
  term: string;
  frequency: number;
  documentFrequency: number;
  idf: number;
  score: number;
}
export interface RankedDocument extends SourceDocument {
  length: number;
  score: number;
  contributions: TermContribution[];
}
export interface RetrievalTrace {
  query: string;
  kind: string;
  parameters: { k1: number; b: number };
  baseline: RankedDocument[];
  repaired: RankedDocument[];
  corpora: { baseline: readonly SourceDocument[]; repaired: SourceDocument[] };
  scope: string;
}
export const exampleQuery: string;
export const baseCorpus: readonly SourceDocument[];
export const missingDocument: Readonly<SourceDocument>;
export function tokenize(text: string): string[];
export function rankDocuments(
  query: string,
  documents: readonly SourceDocument[],
  options?: { k1?: number; b?: number },
): RankedDocument[];
export function compareCorpora(query: string): RetrievalTrace;

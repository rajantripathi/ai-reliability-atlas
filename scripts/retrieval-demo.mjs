import { compareCorpora, exampleQuery } from "../lib/retrieval.mjs";
console.log(
  JSON.stringify(
    compareCorpora(process.argv.slice(2).join(" ") || exampleQuery),
    null,
    2,
  ),
);

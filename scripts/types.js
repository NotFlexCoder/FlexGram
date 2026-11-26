import { genSuggest } from "../auto-generate/gen-suggest.js";
import { generateSnippets } from "../auto-generate/gen-snippet.js";

genSuggest();
const count = Object.keys(generateSnippets()).length;
console.log(`globals.d.ts updated, ${count} snippets written to .vscode/`);

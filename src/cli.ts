import { loadChunks, search } from "./retrieve.js";
import { answerQuestion } from "./answer.js";

const question = process.argv.slice(2).join(" ");
if (!question) { console.error('Usage: npm run ask -- "your question"'); process.exit(1); }

const chunks = loadChunks(process.env.DOCS_DIR ?? "./docs");
const result = await answerQuestion(question, search(chunks, question));
console.log(`\n${result.answer}\n\nSources (${result.mode}):`);
result.sources.forEach((s, i) => console.log(`  [${i + 1}] ${s.source}`));

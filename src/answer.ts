import { complete } from "./llm.js";
import type { Hit } from "./retrieve.js";

export interface Answer {
  answer: string;
  sources: { id: string; source: string; text: string }[];
  mode: "llm" | "extractive";
}

const SYSTEM = `Answer the question using ONLY the numbered context passages.
Cite passages like [1]. If the context does not contain the answer, say you could not find it in the documents.`;

export async function answerQuestion(question: string, hits: Hit[]): Promise<Answer> {
  const sources = hits.map((h) => ({ id: h.chunk.id, source: h.chunk.source, text: h.chunk.text }));
  if (!hits.length) {
    return { answer: "I could not find this in the documents.", sources: [], mode: "extractive" };
  }
  const context = hits.map((h, i) => `[${i + 1}] (${h.chunk.source}) ${h.chunk.text}`).join("\n\n");
  const llm = await complete(SYSTEM, `Context:\n${context}\n\nQuestion: ${question}`);
  if (llm) return { answer: llm.trim(), sources, mode: "llm" };
  // No key / failure: return the best passage so the tool is still useful offline.
  return { answer: `${hits[0].chunk.text} [1]`, sources, mode: "extractive" };
}

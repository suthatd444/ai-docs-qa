import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

export interface Chunk { id: string; source: string; text: string; tokens: string[] }
export interface Hit { chunk: Chunk; score: number }

const STOP = new Set("a an the and or of to in on for is are was were be it this that with as at by from how what when which who do does can i you we our your their there".split(" "));

export const tokenize = (s: string): string[] =>
  s.toLowerCase().replace(/[^a-z0-9%\s]/g, " ").split(/\s+/).filter((w) => w && !STOP.has(w));

/** Split a document into paragraph chunks, keeping the nearest heading for context. */
export function chunkDocument(source: string, text: string): Chunk[] {
  const chunks: Chunk[] = [];
  let heading = "";
  for (const para of text.split(/\n\s*\n/)) {
    const p = para.trim();
    if (!p) continue;
    if (p.startsWith("#")) { heading = p.replace(/^#+\s*/, ""); if (!p.includes("\n")) continue; }
    const body = p.replace(/^#.*\n?/, "").trim() || p;
    const full = heading ? `${heading}: ${body}` : body;
    chunks.push({ id: `${source}#${chunks.length + 1}`, source, text: full, tokens: tokenize(full) });
  }
  return chunks;
}

export function loadChunks(dir: string): Chunk[] {
  return readdirSync(dir)
    .filter((f) => /\.(md|txt)$/i.test(f))
    .flatMap((f) => chunkDocument(f, readFileSync(join(dir, f), "utf8")));
}

/** BM25 ranking. */
export function search(chunks: Chunk[], query: string, k = 3): Hit[] {
  const q = tokenize(query);
  const N = chunks.length;
  const avgLen = chunks.reduce((s, c) => s + c.tokens.length, 0) / (N || 1);
  const df = new Map<string, number>();
  for (const c of chunks) for (const t of new Set(c.tokens)) df.set(t, (df.get(t) ?? 0) + 1);
  const k1 = 1.5, b = 0.75;

  return chunks
    .map((chunk) => {
      let score = 0;
      for (const term of q) {
        const f = chunk.tokens.filter((t) => t === term).length;
        if (!f) continue;
        const idf = Math.log(1 + (N - (df.get(term) ?? 0) + 0.5) / ((df.get(term) ?? 0) + 0.5));
        score += idf * ((f * (k1 + 1)) / (f + k1 * (1 - b + (b * chunk.tokens.length) / avgLen)));
      }
      return { chunk, score };
    })
    .filter((h) => h.score > 0)
    .sort((a, b2) => b2.score - a.score)
    .slice(0, k);
}

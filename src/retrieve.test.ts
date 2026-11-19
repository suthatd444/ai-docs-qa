import test from "node:test";
import assert from "node:assert/strict";
import { chunkDocument, loadChunks, search } from "./retrieve.js";
import { answerQuestion } from "./answer.js";

const chunks = loadChunks("./docs");

test("loads and chunks the sample docs", () => {
  assert.ok(chunks.length >= 6);
  assert.ok(chunkDocument("x.md", "# Title\n\nHello world").length === 1);
});

test("finds the right document for a question", () => {
  assert.equal(search(chunks, "How many square feet in a marla?")[0].chunk.source, "inventory.md");
  assert.equal(search(chunks, "What percentage is the down payment?")[0].chunk.source, "payment-plans.md");
  assert.equal(search(chunks, "What can an agent see?")[0].chunk.source, "leads.md");
});

test("returns nothing for unrelated questions", () => {
  assert.equal(search(chunks, "quantum chromodynamics").length, 0);
});

test("answers extractively without an API key and says when it does not know", async () => {
  delete process.env.ANTHROPIC_API_KEY;
  const a = await answerQuestion("late penalty?", search(chunks, "late penalty?"));
  assert.equal(a.mode, "extractive");
  assert.match(a.answer, /1% per month/);
  const none = await answerQuestion("zzz", []);
  assert.match(none.answer, /could not find/);
});

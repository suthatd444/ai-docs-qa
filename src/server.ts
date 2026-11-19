import express from "express";
import { z } from "zod";
import { loadChunks, search } from "./retrieve.js";
import { answerQuestion } from "./answer.js";

const app = express();
app.use(express.json());
const chunks = loadChunks(process.env.DOCS_DIR ?? "./docs");

app.get("/health", (_req, res) => res.json({ ok: true, chunks: chunks.length }));

app.post("/ask", async (req, res) => {
  const body = z.object({ question: z.string().min(2) }).safeParse(req.body);
  if (!body.success) return res.status(400).json({ error: "question is required" });
  res.json(await answerQuestion(body.data.question, search(chunks, body.data.question)));
});

const port = Number(process.env.PORT ?? 3000);
app.listen(port, () => console.log(`Docs Q&A listening on :${port} (${chunks.length} chunks)`));

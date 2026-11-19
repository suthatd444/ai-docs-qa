# AI Docs Q&A (RAG)

Ask questions about your own documents and get an answer **with source citations**. Drop `.md` / `.txt` files into `docs/`, run the CLI or the API.

- **Retrieval:** paragraph chunking + BM25 ranking (no vector DB needed to start)
- **Answering:** Claude answers using only the retrieved passages and cites them like `[1]`
- **Fallback:** with no API key, it returns the best matching passage so it still works offline
- Says "I could not find this in the documents" when nothing matches, instead of guessing

The sample `docs/` describe a fictional real-estate CRM (payment plans, inventory, lead handling).

## Run

```bash
npm install
cp .env.example .env       # optional: add ANTHROPIC_API_KEY
npm run ask -- "What is the late payment penalty?"
npm start                  # API on :3000
npm test
```

```bash
curl -X POST localhost:3000/ask -H 'content-type: application/json' \
  -d '{"question":"What can an agent see?"}'
```

## Upgrade path
Swap BM25 for embeddings + pgvector (PostgreSQL) when the document set grows; the `search()` function is the only thing that changes.

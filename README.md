# Waste Wise

A TypeScript command-line assistant that helps café staff sort, weigh, and record food waste using the Cafe Food Waste Handbook. It retrieves handbook passages from Qdrant and uses an Anvia agent with OpenRouter to answer questions with available page and section citations.

## Requirements

- Node.js with support for the project's TypeScript tooling
- pnpm 12.18.0 (declared in `package.json`)
- Docker with Docker Compose
- An OpenRouter API key with access to the configured completion and embedding models
- A LlamaCloud API key only if you want to parse the PDF again

## Setup

Run commands from the project root so the scripts can find `data/`.

```sh
pnpm install
```

Create or update `.env` with your own credentials:

```dotenv
OPENROUTER_API_KEY=your_openrouter_api_key
OPENROUTER_MODEL=openai/gpt-4.1-mini
# Optional: required only for src/ocr.ts
LLAMA_CLOUD_API_KEY=your_llama_cloud_api_key
```

`OPENROUTER_MODEL` is optional and defaults to `openai/gpt-4.1-mini`. Embeddings use `openai/text-embedding-3-small` with 1,536 dimensions. `.env` is ignored by Git; keep credentials out of commits.

Start Qdrant:

```sh
docker compose up -d
```

The scripts connect to `http://localhost:6333`. Compose also exposes port `6334` and persists the database in `qdrant_data/`.

## Index the handbook

The repository includes the PDF, extracted text, and page-level JSON, so PDF parsing is optional. Load the page-level documents into Qdrant before asking questions:

```sh
pnpm exec tsx src/ingest.ts
```

Ingestion creates the `cafe-food-waste-handbook` collection if needed and embeds each page as one document, preserving source, title, page, and version metadata. It requires Qdrant and OpenRouter.

## Ask a question

```sh
pnpm exec tsx src/agent.ts "We discarded 1.5 kg of rice prepared for sale but never served. How should I log it?"
```

Omit the argument to run the built-in sample question:

```sh
pnpm exec tsx src/agent.ts
```

The CLI prints the question, search tool calls, and answer. The agent searches up to three matching handbook passages by default and is instructed to ask for missing log details and acknowledge unsupported answers.

## Other commands

| Command | Purpose |
| --- | --- |
| `pnpm exec tsx src/ocr.ts` | Parse the PDF through LlamaCloud and overwrite the extracted text and page JSON. Requires `LLAMA_CLOUD_API_KEY`. |
| `pnpm exec tsx src/chunking.ts` | Preview recursive text chunks locally; no API key or database needed. |
| `pnpm exec tsx src/embedding.ts` | Generate and print embeddings for text chunks using OpenRouter. |
| `pnpm exec tsx src/query.ts` | Print retrieved passages for a fixed sample question. Requires an indexed collection. |
| `pnpm typecheck` | Check TypeScript without emitting files. |
| `pnpm build` | Compile TypeScript using `tsc`. The current configuration emits files alongside the sources. |
| `docker compose down` | Stop Qdrant while retaining its persisted data. |

The existing `pnpm start` and `pnpm dev` scripts reference `src/index.ts`, which is not currently present. Use the direct `tsx` commands above to run the available scripts.

## Project layout

```text
data/
  cafe-food-waste-handbook.pdf         Source handbook
  cafe-food-waste-handbook.txt         Extracted Markdown text
  cafe-food-waste-handbook-pages.json  Extracted text with page numbers
src/
  agent.ts       Handbook question-answering agent
  chunking.ts    Text chunking demonstration
  embedding.ts   Embedding demonstration
  ingest.ts      Page-level ingestion into Qdrant
  ocr.ts         PDF parsing through LlamaCloud
  query.ts       Retrieval demonstration
docker-compose.yml
```

After regenerating the extracted handbook files, run ingestion again to index the updated content. Parsing, embedding, and answering questions call external services and may incur usage charges.

## License

`package.json` declares the ISC license.

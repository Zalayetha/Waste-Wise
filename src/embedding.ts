import { readFile } from "node:fs/promises";
import { chunkTextDocuments } from "@anvia/core/documents";
import {
  cosineSimilarity,
  embedText,
  embedTexts,
} from "@anvia/core/embeddings";
import { OpenAIClient } from "@anvia/openai";
import "dotenv/config";

const openrouter = new OpenAIClient({
  apiKey: process.env.OPENROUTER_API_KEY!,
  baseUrl: "https://openrouter.ai/api/v1",
});

const embeddingModel = openrouter.embeddingModel({
  modelId: "openai/text-embedding-3-small",
});

const text = await readFile("data/cafe-food-waste-handbook.txt", "utf8");
const chunks = chunkTextDocuments({
  documents: [{ id: "cafe-food-waste-handbook", text: text }],
  chunking: {
    strategy: "recursive",
    maxSize: 2000,
    overlap: 300,
    separators: ["\n\n", "\n", ". "],
  },
});

const { embeddings } = await embedTexts({
  model: embeddingModel,
  texts: chunks.map((chunk) => chunk.text),
});

console.log(embeddings);

import { readFile } from "node:fs/promises";
import { OpenAIClient } from "@anvia/openai";
import "dotenv/config";
import { QdrantVectorClient } from "@anvia/qdrant";
import {
  ingestVectorDocuments,
  retrieveDocuments
} from "@anvia/core/vector-store";
import type { TextDocument } from "@anvia/core/documents";

const openrouter = new OpenAIClient({
  apiKey: process.env.OPENROUTER_API_KEY!,
  baseUrl: "https://openrouter.ai/api/v1",
});

const embeddingModel = openrouter.embeddingModel({
  modelId: "openai/text-embedding-3-small"
});

const qdrant = new QdrantVectorClient({url: "http://localhost:6333"});
const store = qdrant.vectorStore<TextDocument>({
  collectionName: "cafe-food-waste-handbook",
  dimensions: 1536,
  metric: "cosine"
});

const question = "We threw away 1.5 kg of rice after closing. It was prepared for sale but never served. What should I enter in the waste log?";

const results = await retrieveDocuments({
  store,
  model: embeddingModel,
  query: question,
  topK: 3,
});
console.log(results);



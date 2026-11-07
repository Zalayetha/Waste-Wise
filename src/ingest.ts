import { readFile } from "node:fs/promises";
import { OpenAIClient } from "@anvia/openai";
import "dotenv/config";
import { QdrantVectorClient } from "@anvia/qdrant";
import { ingestVectorDocuments } from "@anvia/core/vector-store";
import type { TextDocument } from "@anvia/core/documents";


const openrouter = new OpenAIClient({
  apiKey: process.env.OPENROUTER_API_KEY!,
  baseUrl: "https://openrouter.ai/api/v1",
});

const embeddingModel = openrouter.embeddingModel({
  modelId: "openai/text-embedding-3-small"
});

const qdrant = new QdrantVectorClient({
  url: "http://localhost:6333"
});

const store = qdrant.vectorStore<TextDocument>({
  collectionName: "cafe-food-waste-handbook",
  dimensions: 1536,
  metric: "cosine"
});

try{
  await store.ensure();
  const pages: { page: number; text: string }[] = JSON.parse(
    await readFile("data/cafe-food-waste-handbook-pages.json", "utf8")
  );
  const pageDocuments = pages.map((page)=>({
    id: `cafe-food-waste-handbook-page${page.page}`,
    text: page.text,
    metadata: {
      source: "cafe-food-waste-handbook.pdf",
      title: "Cafe Food Waste Handbook",
      page: page.page,
      version: 2,
    },
  }));

  await ingestVectorDocuments({
    store,
    documents: pageDocuments,
    embeddingModel,
    chunking: { strategy: "none"}
  });
}catch(error){
  console.log(error);
}

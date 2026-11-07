import { readFile } from "node:fs/promises";
import { chunkTextDocuments } from "@anvia/core/documents";

const text = await readFile("data/cafe-food-waste-handbook.txt", "utf8");
const chunks = chunkTextDocuments({
  documents: [{
    id: "handbook",
    text: text,
  }],
  chunking: {
    strategy: "recursive",
    maxSize: 2000,
    overlap: 300,
    separators: ["\n\n", "\n", ". "]
  },
});

for (const chunk of chunks){
  console.log(`==== Chunk ${chunk.index} (${chunk.text.length} characters) ===`);
  console.log(chunk.text);
  console.log("");
}

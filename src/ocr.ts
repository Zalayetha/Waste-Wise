// pdfjs (extract text for non-rasterize docs)
// tesseract (ocr tool -> scanned doc to text - English only)
// mistralOCR / LlamaParse (ocr tool -> text/scanning/image/charts/table) - PAID
// PaddleOCR (ocr tool -> text/scanning/image/charts/table) - FREE

import { createReadStream } from "node:fs";
import { writeFile } from "node:fs/promises";
import LlamaCloud from "@llamaindex/llama-cloud";
import "dotenv/config";

const client = new LlamaCloud({
  apiKey: process.env.LLAMA_CLOUD_API_KEY!,
});

const result = await client.parsing.parse({
  upload_file:  createReadStream("data/cafe-food-waste-handbook.pdf"),
  tier: "cost_effective",
  version: "latest",
  expand: ["markdown"],
  output_options: {
    markdown: {
      tables: {
        output_tables_as_markdown: true,
      }
    }
  }
});

const pages = (result.markdown?.pages ?? []).filter(
  (page) => page.success
);
const text = pages.map((page)=>page.markdown).join("\n\n");
await writeFile("data/cafe-food-waste-handbook.txt", text);

const pageList = pages.map((page)=>({
  page: page.page_number,
  text: page.markdown
}));

await writeFile("data/cafe-food-waste-handbook-pages.json", JSON.stringify(pageList, null, 2));

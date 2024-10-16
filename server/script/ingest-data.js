import { UnstructuredLoader } from "langchain/document_loaders/fs/unstructured";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { PineconeClient } from "@pinecone-database/pinecone";
import { PineconeStore } from "langchain/vectorstores/pinecone";
import path from "path";
import * as dotenv from "dotenv";
import * as url from "url";
const __dirname = url.fileURLToPath(new URL(".", import.meta.url));

dotenv.config();
console.log('path.resolve(__dirname, "../source/vue3-document-en.md")',path.resolve(__dirname, "../source/vue3-document-en.md"));

const loader = new UnstructuredLoader(
  path.resolve(__dirname, "../source/vue3-document-en.md"),
  {
    apiKey: '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',
    apiUrl: "https://openrouter.ai/"
  }
);
debugger
const rawDocs = await loader.load();
console.log('rawDocs', rawDocs);

const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 1000,
  chunkOverlap: 200,
});

const docs = await splitter.splitDocuments(rawDocs);

const embeddings = new OpenAIEmbeddings();

const client = new PineconeClient();
await client.init({
  apiKey: process.env.PINECONE_API_KEY,
  environment: process.env.PINECONE_ENVIRONMENT,
});

const pineconeIndex = client.Index(process.env.PINECONE_INDEX);

try {
  await PineconeStore.fromDocuments(docs, embeddings, {
    pineconeIndex,
    textKey: "text",
    namespace: "vue3-document-en",
  });
} catch (error) {
  console.log(error);
}

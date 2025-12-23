import { remark } from "remark";
import remarkRehype from "remark-rehype";
import rehypeRaw from "rehype-raw";
import rehypeStringify from "rehype-stringify";

// Cache the remark processor instance to avoid recreating it on every call
// This significantly improves performance for markdown processing
let cachedProcessor: Awaited<ReturnType<typeof createProcessor>> | null = null;

function createProcessor() {
  return remark()
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(rehypeStringify, { allowDangerousHtml: true });
}

async function getProcessor() {
  if (!cachedProcessor) {
    cachedProcessor = createProcessor();
  }
  return cachedProcessor;
}

export async function processMarkdown(content: string): Promise<string> {
  const processor = await getProcessor();
  const processedContent = await processor.process(content);
  return processedContent.toString();
}


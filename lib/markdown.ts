import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { remark } from "remark";
import remarkRehype from "remark-rehype";
import rehypeRaw from "rehype-raw";
import rehypeStringify from "rehype-stringify";

const contentDirectory = path.join(process.cwd(), "content");

export interface PostMetadata {
  title: string;
  date: string;
  excerpt?: string;
  slug: string;
  image?: string;
}

export interface Post extends PostMetadata {
  content: string;
  contentHtml: string;
}

export function getPosts(type: "stories" | "blogs"): Post[] {
  const fullPath = path.join(contentDirectory, type);

  if (!fs.existsSync(fullPath)) {
    return [];
  }

  const fileNames = fs.readdirSync(fullPath);
  const allPostsData = fileNames
    .filter((name) => name.endsWith(".md"))
    .map((fileName) => {
      const slug = fileName.replace(/\.md$/, "");
      const fullFilePath = path.join(fullPath, fileName);
      const fileContents = fs.readFileSync(fullFilePath, "utf8");
      const { data, content } = matter(fileContents);

      return {
        slug,
        title: data.title || slug,
        date: data.date || new Date().toISOString(),
        excerpt: data.excerpt || "",
        image: data.image || "",
        content,
        contentHtml: "",
      };
    });

  // Sort posts by date
  return allPostsData.sort((a, b) => {
    if (a.date < b.date) {
      return 1;
    } else {
      return -1;
    }
  });
}

export async function getPostBySlug(
  type: "stories" | "blogs",
  slug: string
): Promise<Post | null> {
  const fullPath = path.join(contentDirectory, type, `${slug}.md`);

  if (!fs.existsSync(fullPath)) {
    return null;
  }

  const fileContents = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(fileContents);

  // Process markdown to HTML - use rehype pipeline to allow HTML tags like <br>
  const processedContent = await remark()
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(rehypeStringify, { allowDangerousHtml: true })
    .process(content);
  let contentHtml = processedContent.toString();

  return {
    slug,
    title: data.title || slug,
    date: data.date || new Date().toISOString(),
    excerpt: data.excerpt || "",
    image: data.image || "",
    content,
    contentHtml,
  };
}

export function savePost(
  type: "stories" | "blogs",
  slug: string,
  title: string,
  content: string,
  date?: string,
  excerpt?: string,
  image?: string
): void {
  const fullPath = path.join(contentDirectory, type);

  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
  }

  const frontMatter = `---
title: "${title.replace(/"/g, '\\"')}"
date: ${date || new Date().toISOString()}
${excerpt ? `excerpt: "${excerpt.replace(/"/g, '\\"')}"` : ""}
${image ? `image: "${image.replace(/"/g, '\\"')}"` : ""}
---

`;

  const filePath = path.join(fullPath, `${slug}.md`);
  fs.writeFileSync(filePath, frontMatter + content, "utf8");
}

export function deletePost(type: "stories" | "blogs", slug: string): void {
  const fullPath = path.join(contentDirectory, type, `${slug}.md`);

  if (fs.existsSync(fullPath)) {
    fs.unlinkSync(fullPath);
  }
}

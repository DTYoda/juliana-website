import { sql } from './db';
import { remark } from "remark";
import remarkRehype from "remark-rehype";
import rehypeRaw from "rehype-raw";
import rehypeStringify from "rehype-stringify";

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

export async function getPosts(type: 'stories' | 'blogs'): Promise<Post[]> {
  try {
    const posts = await sql`
      SELECT slug, title, content, date, excerpt, image
      FROM posts
      WHERE type = ${type}
      ORDER BY date DESC
    `;
    
    return posts.map((post: any) => ({
      slug: post.slug,
      title: post.title,
      content: post.content,
      date: post.date,
      excerpt: post.excerpt || '',
      image: post.image || '',
      contentHtml: '', // Will be generated on-demand in getPostBySlug
    }));
  } catch (error) {
    console.error('Error getting posts from Postgres:', error);
    return [];
  }
}

export async function getPostBySlug(
  type: 'stories' | 'blogs',
  slug: string
): Promise<Post | null> {
  try {
    const result = await sql`
      SELECT slug, title, content, date, excerpt, image
      FROM posts
      WHERE type = ${type} AND slug = ${slug}
      LIMIT 1
    `;
    
    if (result.length === 0) {
      return null;
    }
    
    const post = result[0] as any;
    
    // Process markdown to HTML - use rehype pipeline to allow HTML tags like <br>
    const processedContent = await remark()
      .use(remarkRehype, { allowDangerousHtml: true })
      .use(rehypeRaw)
      .use(rehypeStringify, { allowDangerousHtml: true })
      .process(post.content);
    const contentHtml = processedContent.toString();
    
    return {
      slug: post.slug,
      title: post.title,
      content: post.content,
      date: post.date,
      excerpt: post.excerpt || '',
      image: post.image || '',
      contentHtml,
    };
  } catch (error) {
    console.error('Error getting post from Postgres:', error);
    return null;
  }
}

export async function savePost(
  type: 'stories' | 'blogs',
  slug: string,
  title: string,
  content: string,
  date?: string,
  excerpt?: string,
  image?: string
): Promise<void> {
  try {
    const postDate = date || new Date().toISOString();
    
    // Use INSERT ... ON CONFLICT to handle both create and update
    await sql`
      INSERT INTO posts (type, slug, title, content, date, excerpt, image, updated_at)
      VALUES (${type}, ${slug}, ${title}, ${content}, ${postDate}, ${excerpt || null}, ${image || null}, NOW())
      ON CONFLICT (slug) 
      DO UPDATE SET
        title = EXCLUDED.title,
        content = EXCLUDED.content,
        date = EXCLUDED.date,
        excerpt = EXCLUDED.excerpt,
        image = EXCLUDED.image,
        updated_at = NOW()
    `;
  } catch (error) {
    console.error('Error saving post to Postgres:', error);
    throw error;
  }
}

export async function deletePost(
  type: 'stories' | 'blogs',
  slug: string
): Promise<void> {
  try {
    await sql`
      DELETE FROM posts
      WHERE type = ${type} AND slug = ${slug}
    `;
  } catch (error) {
    console.error('Error deleting post from Postgres:', error);
    throw error;
  }
}


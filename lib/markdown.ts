// Re-export types and functions from Postgres storage
export type { PostMetadata, Post } from './postgres-storage';
export {
  getPosts,
  getPostBySlug,
  savePost,
  deletePost,
} from './postgres-storage';

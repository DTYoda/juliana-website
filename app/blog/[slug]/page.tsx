import { getPostBySlug, getPosts } from '@/lib/markdown';
import { format } from 'date-fns';
import { notFound } from 'next/navigation';
import Link from 'next/link';

export async function generateStaticParams() {
  const blogs = await getPosts('blogs');
  return blogs.map((blog) => ({
    slug: blog.slug,
  }));
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const blog = await getPostBySlug('blogs', slug);

  if (!blog) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-cyan-100 via-rose-50 to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <article className="max-w-3xl mx-auto px-6 py-16">
        <Link
          href="/blog"
          className="text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 transition-colors mb-8 inline-block font-medium"
        >
          ← Back to Blog
        </Link>
        
        <header className="mb-12">
          <h1 className="text-5xl font-serif text-cyan-600 dark:text-cyan-400 mb-4 font-bold">
            {blog.title}
          </h1>
          <p className="text-gray-700 dark:text-white font-medium">
            {format(new Date(blog.date), 'MMMM d, yyyy')}
          </p>
          {blog.image && (
            <div className="mt-6">
              <img
                src={blog.image}
                alt={blog.title}
                className="w-full rounded-2xl"
              />
            </div>
          )}
        </header>

        <div
          className="prose prose-lg max-w-none"
          dangerouslySetInnerHTML={{ __html: blog.contentHtml }}
        />
      </article>
    </div>
  );
}


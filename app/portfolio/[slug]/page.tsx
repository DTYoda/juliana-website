import { getPostBySlug, getPosts } from '@/lib/markdown';
import { format } from 'date-fns';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

// Use ISR with 60 second revalidate for better performance while still allowing updates
export const revalidate = 60;

export async function generateStaticParams() {
  const stories = await getPosts('stories');
  return stories.map((story) => ({
    slug: story.slug,
  }));
}

export default async function StoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const story = await getPostBySlug('stories', slug);

  if (!story) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-cyan-100 via-rose-50 to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <article className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12 md:py-16">
        <Link
          href="/portfolio"
          className="text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 transition-colors mb-6 sm:mb-8 inline-block font-medium text-sm sm:text-base"
        >
          ← Back to Portfolio
        </Link>
        
        <header className="mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif text-cyan-600 dark:text-cyan-400 mb-4 font-bold">
            {story.title}
          </h1>
          <p className="text-gray-700 dark:text-white font-medium">
            {format(new Date(story.date), 'MMMM d, yyyy')}
          </p>
          {story.image && (
            <div className="mt-6 w-full">
              <Image
                src={story.image}
                alt={story.title}
                width={1200}
                height={800}
                className="w-full h-auto rounded-2xl"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
              />
            </div>
          )}
        </header>

        <div
          className="prose prose-lg max-w-none"
          dangerouslySetInnerHTML={{ __html: story.contentHtml }}
        />
      </article>
    </div>
  );
}


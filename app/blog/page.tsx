import Link from "next/link";
import { getPosts } from "@/lib/markdown";
import { format } from "date-fns";
import AnimatedSection from "@/components/AnimatedSection";
import { getWebsiteContent } from "@/lib/postgres-website-content";
import Image from "next/image";

interface WebsiteContent {
  blog: {
    title: string;
    description: string;
  };
}

// Use ISR with 60 second revalidate for better performance while still allowing updates
export const revalidate = 60;

export default async function Blog() {
  // Parallelize data fetching
  const [blogs, websiteContent] = await Promise.all([
    getPosts("blogs"),
    getWebsiteContent(),
  ]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-cyan-100 via-rose-50 to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 md:py-16">
        <AnimatedSection>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif text-cyan-600 dark:text-cyan-400 mb-4 font-bold">
            {websiteContent.blog.title}
          </h1>
          <p className="text-base sm:text-lg text-gray-800 dark:text-white mb-8 sm:mb-12">
            {websiteContent.blog.description}
          </p>
        </AnimatedSection>

        {blogs.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {blogs.map((blog) => (
              <Link
                key={blog.slug}
                href={`/blog/${blog.slug}`}
                className="card-hover bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-sm hover:shadow-md transition-all border border-cyan-100/50 dark:border-gray-700/50 hover:border-cyan-300/50 dark:hover:border-gray-600/50 overflow-hidden h-full flex flex-col"
              >
                {blog.image ? (
                  <div className="zoom-img aspect-square overflow-hidden relative flex-shrink-0">
                    <Image
                      src={blog.image}
                      alt={blog.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      loading="lazy"
                    />
                  </div>
                ) : (
                  <div className="aspect-square bg-gradient-to-br from-cyan-100/50 via-rose-50/50 to-cyan-50/50 dark:from-gray-700/50 dark:via-gray-600/50 dark:to-gray-700/50 flex-shrink-0"></div>
                )}
                <div className="p-4 sm:p-6 flex-grow flex flex-col">
                  <h2 className="text-lg sm:text-xl font-serif text-gray-900 dark:text-white mb-2 font-semibold">
                    {blog.title}
                  </h2>
                  {blog.excerpt && (
                    <p className="text-gray-700 dark:text-white mb-3 leading-relaxed line-clamp-2 text-sm flex-grow">
                      {blog.excerpt}
                    </p>
                  )}
                  <p className="text-sm text-cyan-600 dark:text-cyan-400 font-medium mt-auto">
                    {format(new Date(blog.date), "MMMM d, yyyy")}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-gradient-to-br from-cyan-100/80 via-rose-50/80 to-cyan-50/80 dark:from-gray-800/80 dark:via-gray-700/80 dark:to-gray-800/80 backdrop-blur-sm rounded-2xl p-6 sm:p-8 md:p-12 text-center border border-cyan-200/50 dark:border-gray-700/50">
            <p className="text-lg sm:text-xl text-gray-800 dark:text-white">
              No blog posts yet. Check back soon!
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

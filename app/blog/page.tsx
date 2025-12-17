import Link from "next/link";
import { getPosts } from "@/lib/markdown";
import { format } from "date-fns";
import AnimatedSection from "@/components/AnimatedSection";
import { readFile } from "fs/promises";
import { join } from "path";

interface WebsiteContent {
  blog: {
    title: string;
    description: string;
  };
}

async function getWebsiteContent(): Promise<WebsiteContent> {
  try {
    const contentFile = join(process.cwd(), "content", "website-content.json");
    const content = await readFile(contentFile, "utf-8");
    const parsed = JSON.parse(content);
    return { blog: parsed.blog };
  } catch (error) {
    return {
      blog: {
        title: "Blog",
        description:
          "Thoughts, reflections, and musings from my writing journey",
      },
    };
  }
}

export default async function Blog() {
  const blogs = getPosts("blogs");
  const websiteContent = await getWebsiteContent();

  return (
    <div className="min-h-screen bg-gradient-to-b from-cyan-100 via-rose-50 to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <main className="max-w-6xl mx-auto px-6 py-16">
        <AnimatedSection>
          <h1 className="text-5xl font-serif text-cyan-600 dark:text-cyan-400 mb-4 font-bold">
            {websiteContent.blog.title}
          </h1>
          <p className="text-lg text-gray-800 dark:text-white mb-12">
            {websiteContent.blog.description}
          </p>
        </AnimatedSection>

        {blogs.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogs.map((blog) => (
              <Link
                key={blog.slug}
                href={`/blog/${blog.slug}`}
                className="card-hover block bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-sm hover:shadow-md transition-all border border-cyan-100/50 dark:border-gray-700/50 hover:border-cyan-300/50 dark:hover:border-gray-600/50 overflow-hidden"
              >
                {blog.image && (
                  <div className="zoom-img aspect-square overflow-hidden">
                    <img
                      src={blog.image}
                      alt={blog.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="p-6">
                  <h2 className="text-xl font-serif text-gray-900 dark:text-white mb-2 font-semibold">
                    {blog.title}
                  </h2>
                  {blog.excerpt && (
                    <p className="text-gray-700 dark:text-white mb-3 leading-relaxed line-clamp-2 text-sm">
                      {blog.excerpt}
                    </p>
                  )}
                  <p className="text-sm text-cyan-600 dark:text-cyan-400 font-medium">
                    {format(new Date(blog.date), "MMMM d, yyyy")}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-gradient-to-br from-cyan-100/80 via-rose-50/80 to-cyan-50/80 dark:from-gray-800/80 dark:via-gray-700/80 dark:to-gray-800/80 backdrop-blur-sm rounded-2xl p-12 text-center border border-cyan-200/50 dark:border-gray-700/50">
            <p className="text-xl text-gray-800 dark:text-white">
              No blog posts yet. Check back soon!
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

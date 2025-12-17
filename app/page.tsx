import Link from "next/link";
import { getPosts } from "@/lib/markdown";
import { format } from "date-fns";
import AnimatedSection from "@/components/AnimatedSection";
import Image from "next/image";
import { readFile } from "fs/promises";
import { join } from "path";

interface WebsiteContent {
  home: {
    name: string;
    title: string;
    quote: string;
    description1: string;
    description2: string;
    bannerImage: string;
    profileImage: string;
    aboutPreviewTitle: string;
    aboutPreviewText: string;
    aboutPreviewButtonText: string;
    navbarTitle: string;
  };
  about: {
    title: string;
    navbarTitle: string;
    content: string[];
    galleryTitle: string;
    galleryImages: string[];
  };
  portfolio: {
    title: string;
    description: string;
    navbarTitle: string;
  };
  blog: {
    title: string;
    description: string;
    navbarTitle: string;
  };
}

async function getWebsiteContent(): Promise<WebsiteContent> {
  try {
    const contentFile = join(process.cwd(), "content", "website-content.json");
    const content = await readFile(contentFile, "utf-8");
    return JSON.parse(content);
  } catch (error) {
    // Return default content if file doesn't exist
    return {
      home: {
        name: "Juliana",
        title: "Writer & Storyteller",
        quote:
          "Every story is a journey, and every word is a step closer to understanding the beauty of life.",
        description1:
          "Welcome to my little corner of the internet, where I share the stories that live in my heart and the thoughts that dance through my mind. I believe in the power of words to connect, heal, and inspire.",
        description2:
          "Here you'll find a collection of my creative writing, personal reflections, and the moments that have shaped me as a writer and as a person. Thank you for joining me on this journey.",
        bannerImage: "/banner.JPG",
        profileImage: "/profile.jpeg",
        aboutPreviewTitle: "About Me",
        aboutPreviewText:
          "I'm a writer who finds joy in crafting stories that touch the heart and spark the imagination. Through my words, I explore the beauty of everyday moments and the magic that exists in the ordinary.",
        aboutPreviewButtonText: "Read More About Me",
        navbarTitle: "Home",
      },
      about: {
        title: "About Me",
        navbarTitle: "About",
        content: [],
        galleryTitle: "A Glimpse Into My World",
        galleryImages: [],
      },
      portfolio: {
        title: "Writing Portfolio",
        description: "A collection of my stories and creative writing pieces",
        navbarTitle: "Portfolio",
      },
      blog: {
        title: "Blog",
        description:
          "Thoughts, reflections, and musings from my writing journey",
        navbarTitle: "Blog",
      },
    };
  }
}

export default async function Home() {
  const recentStories = getPosts("stories").slice(0, 3);
  const recentBlogs = getPosts("blogs").slice(0, 3);
  const websiteContent = await getWebsiteContent();

  return (
    <div className="min-h-screen bg-gradient-to-b from-cyan-100 via-rose-50 to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Banner Image Section with Profile Picture and Description */}
      <AnimatedSection>
        <div className="relative w-full min-h-[600px] md:min-h-[700px] overflow-hidden">
          {/* Banner Background */}
          {/* Placeholder for banner image - replace with your banner image */}
          {/* To add a banner image: 
              1. Place your image in the /public folder (e.g., banner.jpg)
              2. Uncomment the Image component below and comment out the div
              3. Update the src path to match your image filename
          */}
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-100 via-rose-50 to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
            {websiteContent.home.bannerImage && (
              <Image
                src={websiteContent.home.bannerImage}
                alt="Banner"
                fill
                className="object-cover"
                priority
              />
            )}
          </div>

          {/* Overlay gradient for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/50 dark:from-black/40 dark:via-black/20 dark:to-black/50"></div>

          {/* Content Overlay */}
          <div className="relative z-10 max-w-6xl mx-auto px-6 py-16 md:py-24">
            <div className="text-center">
              {/* Profile Picture */}
              <div className="mb-8 flex justify-center">
                <div className="relative w-32 h-32 md:w-40 md:h-40">
                  {/* Placeholder for profile picture - replace with your profile image */}
                  {/* To add a profile image:
                      1. Place your image in the /public folder (e.g., profile.jpg)
                      2. Uncomment the Image component below and comment out the div
                      3. Update the src path to match your image filename
                  */}
                  {websiteContent.home.profileImage ? (
                    <Image
                      src={websiteContent.home.profileImage}
                      alt={websiteContent.home.name}
                      fill
                      className="object-cover rounded-full border-4 border-white shadow-2xl ring-4 ring-white/50"
                      priority
                    />
                  ) : (
                    <div className="w-full h-full rounded-full overflow-hidden border-4 border-white shadow-2xl ring-4 ring-white/50 bg-gradient-to-br from-cyan-200 to-rose-200 flex items-center justify-center">
                      <p className="text-gray-400 text-xs">Profile Picture</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Name and Title */}
              <h1 className="text-5xl md:text-6xl font-serif text-white dark:text-white mb-4 drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)] dark:drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)] font-bold">
                {websiteContent.home.name}
              </h1>
              <p className="text-xl md:text-2xl text-white dark:text-white mb-8 font-medium drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] dark:drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                {websiteContent.home.title}
              </p>

              {/* Quote */}
              <div className="max-w-3xl mx-auto mb-8">
                <blockquote className="text-xl md:text-2xl font-serif text-white dark:text-white italic leading-relaxed drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)] dark:drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)] font-medium">
                  "{websiteContent.home.quote}"
                </blockquote>
              </div>

              {/* Personal Description */}
              <div className="max-w-2xl mx-auto">
                <p className="text-lg text-white dark:text-white leading-relaxed mb-4 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] dark:drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] font-medium">
                  {websiteContent.home.description1}
                </p>
                <p className="text-lg text-white dark:text-white leading-relaxed drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] dark:drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] font-medium">
                  {websiteContent.home.description2}
                </p>
              </div>
            </div>
          </div>
        </div>
      </AnimatedSection>

      <main className="max-w-6xl mx-auto px-6 py-16">
        {/* Recent Stories */}
        <AnimatedSection delay={400}>
          <section className="mb-20">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-4xl font-serif text-cyan-600 dark:text-cyan-400 font-bold">
                Recent Stories
              </h2>
              <Link
                href="/portfolio"
                className="text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 transition-colors font-medium"
              >
                View All →
              </Link>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {recentStories.length > 0 ? (
                recentStories.map((story) => (
                  <Link
                    key={story.slug}
                    href={`/portfolio/${story.slug}`}
                    className="card-hover bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm hover:shadow-md transition-all border border-cyan-100/50 dark:border-gray-700/50 hover:border-cyan-300/50 dark:hover:border-gray-600/50"
                  >
                    {story.image && (
                      <div className="zoom-img mb-4 -mx-6 -mt-6 aspect-square overflow-hidden">
                        <img
                          src={story.image}
                          alt={story.title}
                          className="w-full h-full object-cover rounded-t-2xl"
                        />
                      </div>
                    )}
                    <h3 className="text-2xl font-serif text-gray-900 dark:text-white mb-3 font-semibold">
                      {story.title}
                    </h3>
                    {story.excerpt && (
                      <p className="text-gray-700 dark:text-white mb-4 line-clamp-3">
                        {story.excerpt}
                      </p>
                    )}
                    <p className="text-sm text-cyan-600 dark:text-cyan-400 font-medium">
                      {format(new Date(story.date), "MMMM d, yyyy")}
                    </p>
                  </Link>
                ))
              ) : (
                <div className="col-span-3 text-center py-12 text-gray-700 dark:text-white">
                  <p>No stories yet. Check back soon!</p>
                </div>
              )}
            </div>
          </section>
        </AnimatedSection>

        {/* Recent Blog Posts */}
        <AnimatedSection delay={600}>
          <section className="mb-20">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-4xl font-serif text-cyan-600 dark:text-cyan-400 font-bold">
                Latest Blog Posts
              </h2>
              <Link
                href="/blog"
                className="text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 transition-colors font-medium"
              >
                View All →
              </Link>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {recentBlogs.length > 0 ? (
                recentBlogs.map((blog) => (
                  <Link
                    key={blog.slug}
                    href={`/blog/${blog.slug}`}
                    className="card-hover bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm hover:shadow-md transition-all border border-cyan-100/50 dark:border-gray-700/50 hover:border-cyan-300/50 dark:hover:border-gray-600/50"
                  >
                    {blog.image && (
                      <div className="zoom-img mb-4 -mx-6 -mt-6 aspect-square overflow-hidden">
                        <img
                          src={blog.image}
                          alt={blog.title}
                          className="w-full h-full object-cover rounded-t-2xl"
                        />
                      </div>
                    )}
                    <h3 className="text-2xl font-serif text-gray-900 dark:text-white mb-3 font-semibold">
                      {blog.title}
                    </h3>
                    {blog.excerpt && (
                      <p className="text-gray-700 dark:text-white mb-4 line-clamp-3">
                        {blog.excerpt}
                      </p>
                    )}
                    <p className="text-sm text-cyan-600 dark:text-cyan-400 font-medium">
                      {format(new Date(blog.date), "MMMM d, yyyy")}
                    </p>
                  </Link>
                ))
              ) : (
                <div className="col-span-3 text-center py-12 text-gray-700 dark:text-white">
                  <p>No blog posts yet. Check back soon!</p>
                </div>
              )}
            </div>
          </section>
        </AnimatedSection>

        {/* About Preview */}
        <AnimatedSection delay={800}>
          <section className="bg-gradient-to-br from-cyan-100/80 via-rose-50/80 to-cyan-50/80 dark:from-gray-800/80 dark:via-gray-700/80 dark:to-gray-800/80 backdrop-blur-sm rounded-3xl p-12 border border-cyan-200/50 dark:border-gray-700/50">
            <h2 className="text-4xl font-serif text-cyan-600 dark:text-cyan-400 mb-6 font-bold">
              {websiteContent.home.aboutPreviewTitle}
            </h2>
            <p className="text-lg text-gray-800 dark:text-white leading-relaxed mb-6">
              {websiteContent.home.aboutPreviewText}
            </p>
            <Link
              href="/about"
              className="inline-block bg-cyan-600 dark:bg-cyan-600 text-white px-8 py-3 rounded-full hover:bg-cyan-700 dark:hover:bg-cyan-700 transition-colors font-medium shadow-md hover:shadow-lg"
            >
              {websiteContent.home.aboutPreviewButtonText}
            </Link>
          </section>
        </AnimatedSection>
      </main>
    </div>
  );
}

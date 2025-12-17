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
  };
  blog: {
    title: string;
    description: string;
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
      },
      about: {
        title: "About Me",
        content: [
          "Welcome to my little corner of the internet! I'm Juliana, a writer who finds magic in the everyday moments and beauty in the stories we tell.",
          "Writing has always been my way of making sense of the world—of capturing fleeting emotions, exploring different perspectives, and creating connections through words. Whether I'm crafting a short story, sharing thoughts in a blog post, or working on a longer piece, I believe that every word matters and every story deserves to be told.",
          "My journey with words began in childhood, when I would fill notebooks with stories about imaginary worlds and the people who lived in them. As I grew older, I discovered that writing wasn't just a hobby—it was a way to process experiences, to understand myself and others better, and to create something meaningful from the chaos of everyday life.",
          "I'm drawn to stories that explore the human experience in all its complexity. I love writing about quiet moments of connection, the beauty found in ordinary places, and the ways we navigate the spaces between what we feel and what we say. My work often reflects themes of belonging, memory, and the small acts of kindness that can change everything.",
          "When I'm not writing, you'll find me curled up with a good book, sipping tea while watching the world go by, or taking long walks that inspire my next piece. I'm drawn to cozy spaces, meaningful conversations, and the quiet moments that make life beautiful. I believe in the power of stories to heal, to connect, and to remind us that we're never truly alone.",
          "I'm constantly learning and growing as a writer, and I'm grateful for every reader who takes the time to engage with my work. Each story is a conversation, and I'm honored to be part of yours.",
          "Thank you for visiting my writing corner. I hope you find something here that resonates with you, sparks your imagination, or simply brings a moment of peace to your day.",
        ],
        galleryTitle: "A Glimpse Into My World",
        galleryImages: [],
        navbarTitle: "About",
      },
      portfolio: {
        title: "Writing Portfolio",
        description: "A collection of my stories and creative writing pieces",
      },
      blog: {
        title: "Blog",
        description:
          "Thoughts, reflections, and musings from my writing journey",
      },
    };
  }
}

export default async function About() {
  const websiteContent = await getWebsiteContent();

  return (
    <div className="min-h-screen bg-gradient-to-b from-cyan-100 via-rose-50 to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <main className="max-w-4xl mx-auto px-6 py-16">
        <h1 className="text-5xl font-serif text-cyan-600 dark:text-cyan-400 mb-8 font-bold">
          {websiteContent.about.title}
        </h1>

        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-12 shadow-sm border border-cyan-100/50 dark:border-gray-700/50 space-y-8">
          <div className="prose prose-lg max-w-none">
            {websiteContent.about.content.map((paragraph, index) => (
              <p
                key={index}
                className="text-lg text-gray-800 dark:text-white leading-relaxed"
              >
                {paragraph}
              </p>
            ))}
          </div>

          {/* Image Gallery */}
          <div className="mt-12 pt-12 border-t border-cyan-100 dark:border-gray-700">
            <h2 className="text-3xl font-serif text-cyan-600 dark:text-cyan-400 mb-6 font-bold">
              {websiteContent.about.galleryTitle}
            </h2>
            {websiteContent.about.galleryImages.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {websiteContent.about.galleryImages.map((image, index) => (
                  <div
                    key={index}
                    className="zoom-img aspect-square overflow-hidden rounded-xl"
                  >
                    <Image
                      src={image}
                      alt={`Gallery image ${index + 1}`}
                      width={300}
                      height={300}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6].map((num) => (
                  <div
                    key={num}
                    className="aspect-square bg-gradient-to-br from-cyan-100 via-rose-50 to-cyan-50 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded-xl border-2 border-dashed border-cyan-300 dark:border-gray-600 flex items-center justify-center"
                  >
                    <p className="text-cyan-600 dark:text-cyan-400 text-sm font-medium">
                      Image {num}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

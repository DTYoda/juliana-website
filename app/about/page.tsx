import Image from "next/image";
import { getWebsiteContent } from "@/lib/postgres-website-content";

// Force dynamic rendering to show real-time updates
export const dynamic = "force-dynamic";

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

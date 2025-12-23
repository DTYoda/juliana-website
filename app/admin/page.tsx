"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import RichTextEditor from "@/components/RichTextEditor";
import { htmlToMarkdown } from "@/lib/html-to-markdown";
import Image from "next/image";
import DarkModeToggle from "@/components/DarkModeToggle";

interface Post {
  slug: string;
  title: string;
  date: string;
  excerpt?: string;
  content?: string;
  image?: string;
}

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

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState<"stories" | "blogs" | "website">("stories");
  const [posts, setPosts] = useState<Post[]>([]);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    contentHtml: "",
    excerpt: "",
    date: new Date().toISOString().split("T")[0],
    image: "",
  });
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [websiteContent, setWebsiteContent] = useState<WebsiteContent | null>(null);
  const [editingWebsiteContent, setEditingWebsiteContent] = useState(false);
  const [websiteFormData, setWebsiteFormData] = useState<WebsiteContent | null>(null);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [uploadingProfile, setUploadingProfile] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [websiteContentSection, setWebsiteContentSection] = useState<
    "home" | "about" | "portfolio" | "blog"
  >("home");

  useEffect(() => {
    if (activeTab === "website") {
      loadWebsiteContent();
    } else if (!isCreating && !editingPost) {
      loadPosts();
    }
  }, [activeTab, isCreating, editingPost]);

  const loadPosts = async () => {
    try {
      // Add timestamp to prevent caching
      const timestamp = Date.now();
      const response = await fetch(`/api/posts?type=${activeTab}&_t=${timestamp}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
        },
      });
      const data = await response.json();
      setPosts(data);
    } catch (error) {
      console.error("Failed to load posts:", error);
    }
  };

  const loadWebsiteContent = async () => {
    try {
      const response = await fetch("/api/website-content");
      const data = await response.json();
      setWebsiteContent(data);
      setWebsiteFormData(data);
    } catch (error) {
      console.error("Failed to load website content:", error);
    }
  };

  const handleWebsiteImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "banner" | "profile"
  ) => {
    const file = e.target.files?.[0];
    if (!file || !websiteFormData) return;

    if (type === "banner") {
      setUploadingBanner(true);
    } else {
      setUploadingProfile(true);
    }

    try {
      const uploadFormData = new FormData();
      uploadFormData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: uploadFormData,
      });

      const data = await response.json();
      if (data.success) {
        setWebsiteFormData((prev) => {
          if (!prev) return null;
          if (type === "banner") {
            return { ...prev, home: { ...prev.home, bannerImage: data.filename } };
          } else {
            return { ...prev, home: { ...prev.home, profileImage: data.filename } };
          }
        });
      } else {
        alert("Failed to upload image");
      }
    } catch (error) {
      console.error("Failed to upload image:", error);
      alert("Failed to upload image");
    } finally {
      if (type === "banner") {
        setUploadingBanner(false);
      } else {
        setUploadingProfile(false);
      }
    }
  };

  const handleGalleryImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !websiteFormData) return;

    setUploadingGallery(true);
    try {
      const uploadFormData = new FormData();
      uploadFormData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: uploadFormData,
      });

      const data = await response.json();
      if (data.success) {
        setWebsiteFormData((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            about: {
              ...prev.about,
              galleryImages: [...prev.about.galleryImages, data.filename],
            },
          };
        });
      } else {
        alert("Failed to upload image");
      }
    } catch (error) {
      console.error("Failed to upload image:", error);
      alert("Failed to upload image");
    } finally {
      setUploadingGallery(false);
      // Reset file input
      e.target.value = "";
    }
  };

  const handleWebsiteContentSave = async () => {
    if (!websiteFormData) return;

    setLoading(true);
    try {
      const response = await fetch("/api/website-content", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(websiteFormData),
      });

      if (response.ok) {
        setWebsiteContent(websiteFormData);
        setEditingWebsiteContent(false);
        alert("Website content saved successfully!");
      } else {
        alert("Failed to save website content");
      }
    } catch (error) {
      console.error("Failed to save website content:", error);
      alert("Failed to save website content");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingPost(null);
    setIsCreating(true);
    setFormData({
      title: "",
      content: "",
      contentHtml: "",
      excerpt: "",
      date: new Date().toISOString().split("T")[0],
      image: "",
    });
  };

  const handleEdit = async (slug: string) => {
    try {
      const response = await fetch(`/api/posts/${slug}?type=${activeTab}`);
      const post = await response.json();
      setEditingPost(post);
      setIsCreating(false);
      
      // Convert markdown to HTML for the editor
      const { remark } = await import("remark");
      const remarkRehype = (await import("remark-rehype")).default;
      const rehypeRaw = (await import("rehype-raw")).default;
      const rehypeStringify = (await import("rehype-stringify")).default;
      const processed = await remark()
        .use(remarkRehype, { allowDangerousHtml: true })
        .use(rehypeRaw)
        .use(rehypeStringify, { allowDangerousHtml: true })
        .process(post.content || "");
      const contentHtml = processed.toString();
      
      setFormData({
        title: post.title,
        content: post.content || "",
        contentHtml: contentHtml,
        excerpt: post.excerpt || "",
        date: post.date.split("T")[0],
        image: post.image || "",
      });
    } catch (error) {
      console.error("Failed to load post:", error);
    }
  };

  const handleDelete = async (slug: string) => {
    if (!confirm("Are you sure you want to delete this post?")) {
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(
        `/api/posts?type=${activeTab}&slug=${slug}`,
        {
          method: "DELETE",
          cache: 'no-store',
        }
      );

      if (response.ok) {
        // Force reload posts without cache
        await loadPosts();
        if (editingPost?.slug === slug) {
          handleCancel();
        }
        // Also reload website content if we're on that tab to ensure consistency
        if (activeTab === 'website') {
          await loadWebsiteContent();
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        alert(errorData.error || "Failed to delete post");
      }
    } catch (error) {
      console.error("Failed to delete post:", error);
      alert("Failed to delete post");
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const uploadFormData = new FormData();
      uploadFormData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: uploadFormData,
      });

      const data = await response.json();
      if (data.success) {
        setFormData((prev) => ({ ...prev, image: data.filename }));
      } else {
        alert("Failed to upload image");
      }
    } catch (error) {
      console.error("Failed to upload image:", error);
      alert("Failed to upload image");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleContentChange = (html: string) => {
    setFormData((prev) => ({ ...prev, contentHtml: html }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Convert HTML to markdown
      const markdown = htmlToMarkdown(formData.contentHtml);

      const url = editingPost
        ? `/api/posts/${editingPost.slug}`
        : "/api/posts";

      const method = editingPost ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: activeTab,
          title: formData.title,
          content: markdown,
          excerpt: formData.excerpt,
          date: new Date(formData.date).toISOString(),
          image: formData.image,
        }),
      });

      if (response.ok) {
        // Wait for posts to reload before canceling to ensure UI updates
        await loadPosts();
        handleCancel();
      } else {
        const error = await response.json();
        alert(error.error || "Failed to save post");
      }
    } catch (error) {
      console.error("Failed to save post:", error);
      alert("Failed to save post");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEditingPost(null);
    setIsCreating(false);
    setFormData({
      title: "",
      content: "",
      contentHtml: "",
      excerpt: "",
      date: new Date().toISOString().split("T")[0],
      image: "",
    });
  };

  // If editing website content, show website editor
  if (activeTab === "website" && editingWebsiteContent && websiteFormData) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-cyan-100 via-rose-50 to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 admin-panel">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-4xl font-serif text-cyan-500 dark:text-cyan-400">Edit Website Content</h1>
            <DarkModeToggle />
            <button
              onClick={() => {
                setEditingWebsiteContent(false);
                setWebsiteFormData(websiteContent);
              }}
              className="text-cyan-500 dark:text-cyan-400 hover:text-cyan-600 dark:hover:text-cyan-300 transition-colors font-medium"
            >
              ← Back
            </button>
          </div>

          {/* Sub-tabs for website content sections */}
          <div className="flex gap-4 mb-8 border-b border-cyan-100 dark:border-gray-700">
            <button
              onClick={() => setWebsiteContentSection("home")}
              className={`px-6 py-3 font-medium transition-colors ${
                websiteContentSection === "home"
                  ? "text-cyan-500 dark:text-cyan-400 border-b-2 border-cyan-500 dark:border-cyan-400"
                  : "text-gray-600 dark:text-gray-400 hover:text-cyan-500 dark:hover:text-cyan-400"
              }`}
            >
              Home Page
            </button>
            <button
              onClick={() => setWebsiteContentSection("about")}
              className={`px-6 py-3 font-medium transition-colors ${
                websiteContentSection === "about"
                  ? "text-cyan-500 dark:text-cyan-400 border-b-2 border-cyan-500 dark:border-cyan-400"
                  : "text-gray-600 dark:text-gray-400 hover:text-cyan-500 dark:hover:text-cyan-400"
              }`}
            >
              About Page
            </button>
            <button
              onClick={() => setWebsiteContentSection("portfolio")}
              className={`px-6 py-3 font-medium transition-colors ${
                websiteContentSection === "portfolio"
                  ? "text-cyan-500 dark:text-cyan-400 border-b-2 border-cyan-500 dark:border-cyan-400"
                  : "text-gray-600 dark:text-gray-400 hover:text-cyan-500 dark:hover:text-cyan-400"
              }`}
            >
              Portfolio Page
            </button>
            <button
              onClick={() => setWebsiteContentSection("blog")}
              className={`px-6 py-3 font-medium transition-colors ${
                websiteContentSection === "blog"
                  ? "text-cyan-500 dark:text-cyan-400 border-b-2 border-cyan-500 dark:border-cyan-400"
                  : "text-gray-600 dark:text-gray-400 hover:text-cyan-500 dark:hover:text-cyan-400"
              }`}
            >
              Blog Page
            </button>
          </div>

          <div className="space-y-8">
            {/* Home Page Content */}
            {websiteContentSection === "home" && (
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-8 border border-cyan-100 dark:border-gray-700/50">
              <h2 className="text-3xl font-serif text-cyan-500 mb-6">Home Page</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">Navbar Button Title</label>
                  <input
                    type="text"
                    value={websiteFormData.home.navbarTitle}
                    onChange={(e) =>
                      setWebsiteFormData((prev) =>
                        prev ? { ...prev, home: { ...prev.home, navbarTitle: e.target.value } } : null
                      )
                    }
                    className="w-full px-4 py-2 border border-cyan-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white mb-4"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">Name</label>
                  <input
                    type="text"
                    value={websiteFormData.home.name}
                    onChange={(e) =>
                      setWebsiteFormData((prev) =>
                        prev ? { ...prev, home: { ...prev.home, name: e.target.value } } : null
                      )
                    }
                    className="w-full px-4 py-2 border border-cyan-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">Title</label>
                  <input
                    type="text"
                    value={websiteFormData.home.title}
                    onChange={(e) =>
                      setWebsiteFormData((prev) =>
                        prev ? { ...prev, home: { ...prev.home, title: e.target.value } } : null
                      )
                    }
                    className="w-full px-4 py-2 border border-cyan-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">Quote</label>
                  <textarea
                    value={websiteFormData.home.quote}
                    onChange={(e) =>
                      setWebsiteFormData((prev) =>
                        prev ? { ...prev, home: { ...prev.home, quote: e.target.value } } : null
                      )
                    }
                    className="w-full px-4 py-2 border border-cyan-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">Description 1</label>
                  <textarea
                    value={websiteFormData.home.description1}
                    onChange={(e) =>
                      setWebsiteFormData((prev) =>
                        prev
                          ? { ...prev, home: { ...prev.home, description1: e.target.value } }
                          : null
                      )
                    }
                    className="w-full px-4 py-2 border border-cyan-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    rows={4}
                  />
                </div>

                <div>
                  <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">Description 2</label>
                  <textarea
                    value={websiteFormData.home.description2}
                    onChange={(e) =>
                      setWebsiteFormData((prev) =>
                        prev
                          ? { ...prev, home: { ...prev.home, description2: e.target.value } }
                          : null
                      )
                    }
                    className="w-full px-4 py-2 border border-cyan-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    rows={4}
                  />
                </div>

                <div>
                  <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">Banner Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleWebsiteImageUpload(e, "banner")}
                    className="w-full px-4 py-2 border border-cyan-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    disabled={uploadingBanner}
                  />
                  {uploadingBanner && <p className="text-sm text-cyan-500 mt-2">Uploading...</p>}
                  {websiteFormData.home.bannerImage && (
                    <div className="mt-4">
                      <Image
                        src={websiteFormData.home.bannerImage}
                        alt="Banner"
                        width={600}
                        height={200}
                        className="rounded-lg object-cover"
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">Profile Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleWebsiteImageUpload(e, "profile")}
                    className="w-full px-4 py-2 border border-cyan-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    disabled={uploadingProfile}
                  />
                  {uploadingProfile && <p className="text-sm text-cyan-500 mt-2">Uploading...</p>}
                  {websiteFormData.home.profileImage && (
                    <div className="mt-4">
                      <Image
                        src={websiteFormData.home.profileImage}
                        alt="Profile"
                        width={200}
                        height={200}
                        className="rounded-full object-cover"
                      />
                    </div>
                  )}
                </div>

                <div className="pt-6 border-t border-cyan-200 dark:border-gray-600">
                  <h3 className="text-xl font-serif text-cyan-500 mb-4">About Preview Section</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">Preview Title</label>
                      <input
                        type="text"
                        value={websiteFormData.home.aboutPreviewTitle}
                        onChange={(e) =>
                          setWebsiteFormData((prev) =>
                            prev
                              ? {
                                  ...prev,
                                  home: { ...prev.home, aboutPreviewTitle: e.target.value },
                                }
                              : null
                          )
                        }
                        className="w-full px-4 py-2 border border-cyan-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">Preview Text</label>
                      <textarea
                        value={websiteFormData.home.aboutPreviewText}
                        onChange={(e) =>
                          setWebsiteFormData((prev) =>
                            prev
                              ? {
                                  ...prev,
                                  home: { ...prev.home, aboutPreviewText: e.target.value },
                                }
                              : null
                          )
                        }
                        className="w-full px-4 py-2 border border-cyan-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        rows={4}
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">Button Text</label>
                      <input
                        type="text"
                        value={websiteFormData.home.aboutPreviewButtonText}
                        onChange={(e) =>
                          setWebsiteFormData((prev) =>
                            prev
                              ? {
                                  ...prev,
                                  home: { ...prev.home, aboutPreviewButtonText: e.target.value },
                                }
                              : null
                          )
                        }
                        className="w-full px-4 py-2 border border-cyan-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            )}

            {/* About Page Content */}
            {websiteContentSection === "about" && (
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-8 border border-cyan-100 dark:border-gray-700/50">
                <h2 className="text-3xl font-serif text-cyan-500 mb-6">About Page</h2>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">Navbar Button Title</label>
                    <input
                      type="text"
                      value={websiteFormData.about.navbarTitle}
                      onChange={(e) =>
                        setWebsiteFormData((prev) =>
                          prev ? { ...prev, about: { ...prev.about, navbarTitle: e.target.value } } : null
                        )
                      }
                      className="w-full px-4 py-2 border border-cyan-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white mb-4"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">Page Title</label>
                    <input
                      type="text"
                      value={websiteFormData.about.title}
                      onChange={(e) =>
                        setWebsiteFormData((prev) =>
                          prev ? { ...prev, about: { ...prev.about, title: e.target.value } } : null
                        )
                      }
                      className="w-full px-4 py-2 border border-cyan-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>

                <div>
                  <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">Content (one paragraph per line)</label>
                  <textarea
                    value={websiteFormData.about.content.join("\n\n")}
                    onChange={(e) =>
                      setWebsiteFormData((prev) =>
                        prev
                          ? {
                              ...prev,
                              about: {
                                ...prev.about,
                                content: e.target.value.split("\n\n").filter((p) => p.trim()),
                              },
                            }
                          : null
                      )
                    }
                    className="w-full px-4 py-2 border border-cyan-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    rows={15}
                  />
                </div>

                <div>
                  <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">Gallery Title</label>
                  <input
                    type="text"
                    value={websiteFormData.about.galleryTitle}
                    onChange={(e) =>
                      setWebsiteFormData((prev) =>
                        prev
                          ? { ...prev, about: { ...prev.about, galleryTitle: e.target.value } }
                          : null
                      )
                    }
                    className="w-full px-4 py-2 border border-cyan-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">Gallery Images</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleGalleryImageUpload(e)}
                    className="w-full px-4 py-2 border border-cyan-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white mb-4"
                    disabled={uploadingGallery}
                  />
                  {uploadingGallery && <p className="text-sm text-cyan-500 mb-4">Uploading...</p>}
                  {websiteFormData.about.galleryImages.length > 0 && (
                    <div className="grid grid-cols-3 gap-4 mt-4">
                      {websiteFormData.about.galleryImages.map((image, index) => (
                        <div key={index} className="relative group">
                          <Image
                            src={image}
                            alt={`Gallery image ${index + 1}`}
                            width={200}
                            height={200}
                            className="w-full h-32 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setWebsiteFormData((prev) =>
                                prev
                                  ? {
                                      ...prev,
                                      about: {
                                        ...prev.about,
                                        galleryImages: prev.about.galleryImages.filter(
                                          (_, i) => i !== index
                                        ),
                                      },
                                    }
                                  : null
                              );
                            }}
                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            )}

            {/* Portfolio Page Content */}
            {websiteContentSection === "portfolio" && (
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-8 border border-cyan-100 dark:border-gray-700/50">
                <h2 className="text-3xl font-serif text-cyan-500 mb-6">Portfolio Page</h2>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">Navbar Button Title</label>
                    <input
                      type="text"
                      value={websiteFormData.portfolio.navbarTitle}
                      onChange={(e) =>
                        setWebsiteFormData((prev) =>
                          prev
                            ? { ...prev, portfolio: { ...prev.portfolio, navbarTitle: e.target.value } }
                            : null
                        )
                      }
                      className="w-full px-4 py-2 border border-cyan-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white mb-4"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">Page Title</label>
                    <input
                      type="text"
                      value={websiteFormData.portfolio.title}
                      onChange={(e) =>
                        setWebsiteFormData((prev) =>
                          prev
                            ? { ...prev, portfolio: { ...prev.portfolio, title: e.target.value } }
                            : null
                        )
                      }
                      className="w-full px-4 py-2 border border-cyan-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">Description</label>
                    <textarea
                      value={websiteFormData.portfolio.description}
                      onChange={(e) =>
                        setWebsiteFormData((prev) =>
                          prev
                            ? {
                                ...prev,
                                portfolio: { ...prev.portfolio, description: e.target.value },
                              }
                            : null
                        )
                      }
                      className="w-full px-4 py-2 border border-cyan-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      rows={3}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Blog Page Content */}
            {websiteContentSection === "blog" && (
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl p-8 border border-cyan-100 dark:border-gray-700/50">
                <h2 className="text-3xl font-serif text-cyan-500 mb-6">Blog Page</h2>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">Navbar Button Title</label>
                    <input
                      type="text"
                      value={websiteFormData.blog.navbarTitle}
                      onChange={(e) =>
                        setWebsiteFormData((prev) =>
                          prev
                            ? { ...prev, blog: { ...prev.blog, navbarTitle: e.target.value } }
                            : null
                        )
                      }
                      className="w-full px-4 py-2 border border-cyan-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white mb-4"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">Page Title</label>
                    <input
                      type="text"
                      value={websiteFormData.blog.title}
                      onChange={(e) =>
                        setWebsiteFormData((prev) =>
                          prev
                            ? { ...prev, blog: { ...prev.blog, title: e.target.value } }
                            : null
                        )
                      }
                      className="w-full px-4 py-2 border border-cyan-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">Description</label>
                    <textarea
                      value={websiteFormData.blog.description}
                      onChange={(e) =>
                        setWebsiteFormData((prev) =>
                          prev
                            ? { ...prev, blog: { ...prev.blog, description: e.target.value } }
                            : null
                        )
                      }
                      className="w-full px-4 py-2 border border-cyan-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      rows={3}
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-4 pt-6">
              <button
                onClick={handleWebsiteContentSave}
                disabled={loading}
                className="bg-cyan-500 dark:bg-cyan-600 text-white px-8 py-3 rounded-full hover:bg-cyan-600 dark:hover:bg-cyan-700 transition-colors font-medium disabled:opacity-50"
              >
                {loading ? "Saving..." : "Save Changes"}
              </button>
              <button
                onClick={() => {
                  setEditingWebsiteContent(false);
                  setWebsiteFormData(websiteContent);
                }}
                className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-8 py-3 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If editing or creating, show full-page editor
  if (isCreating || editingPost) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-cyan-100 via-rose-50 to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 admin-panel">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-4xl font-serif text-cyan-500 dark:text-cyan-400">
              {editingPost ? "Edit" : "Create"} {activeTab === "stories" ? "Story" : "Blog Post"}
            </h1>
            <DarkModeToggle />
            <button
              onClick={handleCancel}
              className="text-cyan-500 dark:text-cyan-400 hover:text-cyan-600 dark:hover:text-cyan-300 transition-colors font-medium"
            >
              ← Back to List
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-6">
              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, title: e.target.value }))
                  }
                  className="w-full px-4 py-2 border border-cyan-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
                  Date *
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, date: e.target.value }))
                  }
                  className="w-full px-4 py-2 border border-cyan-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
                  Excerpt (optional)
                </label>
                <textarea
                  value={formData.excerpt}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, excerpt: e.target.value }))
                  }
                  className="w-full px-4 py-2 border border-cyan-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
                  Featured Image (optional)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="w-full px-4 py-2 border border-cyan-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  disabled={uploadingImage}
                />
                {uploadingImage && (
                  <p className="text-sm text-cyan-500 mt-2">Uploading...</p>
                )}
                {formData.image && (
                  <div className="mt-4">
                    <Image
                      src={formData.image}
                      alt="Featured"
                      width={300}
                      height={200}
                      className="rounded-lg object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, image: "" }))}
                      className="mt-2 text-sm text-red-500 hover:text-red-600"
                    >
                      Remove image
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Rich Text Editor - Full Width */}
            <div>
              <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
                Content *
              </label>
              <RichTextEditor
                content={formData.contentHtml}
                onChange={handleContentChange}
                placeholder="Start writing your story or blog post..."
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-6 border-t border-cyan-200 dark:border-gray-600">
              <button
                type="submit"
                disabled={loading}
                className="bg-cyan-500 dark:bg-cyan-600 text-white px-8 py-3 rounded-full hover:bg-cyan-600 dark:hover:bg-cyan-700 transition-colors font-medium disabled:opacity-50"
              >
                {loading ? "Saving..." : "Save"}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-8 py-3 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // List view
  return (
    <div className="min-h-screen bg-gradient-to-b from-cyan-100 via-rose-50 to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 admin-panel">
      <main className="max-w-6xl mx-auto px-6 py-16">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-5xl font-serif text-cyan-500 dark:text-cyan-400">Admin Panel</h1>
          <DarkModeToggle />
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-cyan-100 dark:border-gray-700 dark:border-gray-700">
          <button
            onClick={() => {
              setActiveTab("stories");
            }}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === "stories"
                ? "text-cyan-500 dark:text-cyan-400 border-b-2 border-cyan-500 dark:border-cyan-400"
                : "text-gray-600 dark:text-gray-400 dark:text-gray-400 hover:text-cyan-500 dark:hover:text-cyan-400"
            }`}
          >
            Stories
          </button>
          <button
            onClick={() => {
              setActiveTab("blogs");
            }}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === "blogs"
                ? "text-cyan-500 dark:text-cyan-400 border-b-2 border-cyan-500 dark:border-cyan-400"
                : "text-gray-600 dark:text-gray-400 dark:text-gray-400 hover:text-cyan-500 dark:hover:text-cyan-400"
            }`}
          >
            Blog Posts
          </button>
          <button
            onClick={() => {
              setActiveTab("website");
            }}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === "website"
                ? "text-cyan-500 dark:text-cyan-400 border-b-2 border-cyan-500 dark:border-cyan-400"
                : "text-gray-600 dark:text-gray-400 dark:text-gray-400 hover:text-cyan-500 dark:hover:text-cyan-400"
            }`}
          >
            Website Content
          </button>
        </div>

        {activeTab === "website" ? (
          <div className="space-y-4">
            {websiteContent && (
              <>
                {/* Home Page Section */}
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-6 border border-cyan-100 dark:border-gray-700/50">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-serif text-gray-800 dark:text-white">Home Page</h2>
                    <button
                      onClick={() => {
                        setEditingWebsiteContent(true);
                        setWebsiteFormData(websiteContent);
                        setWebsiteContentSection("home");
                      }}
                      className="text-cyan-500 hover:text-cyan-600 transition-colors font-medium text-sm"
                    >
                      Edit
                    </button>
                  </div>
                  <div className="space-y-2 text-gray-700 dark:text-gray-300">
                    <div>
                      <strong>Navbar Title:</strong> {websiteContent.home.navbarTitle}
                    </div>
                    <div>
                      <strong>Name:</strong> {websiteContent.home.name}
                    </div>
                    <div>
                      <strong>Title:</strong> {websiteContent.home.title}
                    </div>
                  </div>
                </div>

                {/* About Page Section */}
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-6 border border-cyan-100 dark:border-gray-700/50">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-serif text-gray-800 dark:text-white">About Page</h2>
                    <button
                      onClick={() => {
                        setEditingWebsiteContent(true);
                        setWebsiteFormData(websiteContent);
                        setWebsiteContentSection("about");
                      }}
                      className="text-cyan-500 hover:text-cyan-600 transition-colors font-medium text-sm"
                    >
                      Edit
                    </button>
                  </div>
                  <div className="space-y-2 text-gray-700 dark:text-gray-300">
                    <div>
                      <strong>Navbar Title:</strong> {websiteContent.about.navbarTitle}
                    </div>
                    <div>
                      <strong>Page Title:</strong> {websiteContent.about.title}
                    </div>
                    <div>
                      <strong>Content Paragraphs:</strong> {websiteContent.about.content.length}
                    </div>
                    <div>
                      <strong>Gallery Images:</strong> {websiteContent.about.galleryImages.length}
                    </div>
                  </div>
                </div>

                {/* Portfolio Page Section */}
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-6 border border-cyan-100 dark:border-gray-700/50">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-serif text-gray-800 dark:text-white">Portfolio Page</h2>
                    <button
                      onClick={() => {
                        setEditingWebsiteContent(true);
                        setWebsiteFormData(websiteContent);
                        setWebsiteContentSection("portfolio");
                      }}
                      className="text-cyan-500 hover:text-cyan-600 transition-colors font-medium text-sm"
                    >
                      Edit
                    </button>
                  </div>
                  <div className="space-y-2 text-gray-700 dark:text-gray-300">
                    <div>
                      <strong>Navbar Title:</strong> {websiteContent.portfolio.navbarTitle}
                    </div>
                    <div>
                      <strong>Page Title:</strong> {websiteContent.portfolio.title}
                    </div>
                    <div>
                      <strong>Description:</strong> {websiteContent.portfolio.description.substring(0, 50)}...
                    </div>
                  </div>
                </div>

                {/* Blog Page Section */}
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-6 border border-cyan-100 dark:border-gray-700/50">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-serif text-gray-800 dark:text-white">Blog Page</h2>
                    <button
                      onClick={() => {
                        setEditingWebsiteContent(true);
                        setWebsiteFormData(websiteContent);
                        setWebsiteContentSection("blog");
                      }}
                      className="text-cyan-500 hover:text-cyan-600 transition-colors font-medium text-sm"
                    >
                      Edit
                    </button>
                  </div>
                  <div className="space-y-2 text-gray-700 dark:text-gray-300">
                    <div>
                      <strong>Navbar Title:</strong> {websiteContent.blog.navbarTitle}
                    </div>
                    <div>
                      <strong>Page Title:</strong> {websiteContent.blog.title}
                    </div>
                    <div>
                      <strong>Description:</strong> {websiteContent.blog.description.substring(0, 50)}...
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        ) : (
          <>
            <div className="mb-6">
              <button
                onClick={handleCreate}
                className="bg-cyan-500 dark:bg-cyan-600 text-white px-6 py-3 rounded-full hover:bg-cyan-600 dark:hover:bg-cyan-700 transition-colors font-medium"
              >
                + New {activeTab === "stories" ? "Story" : "Post"}
              </button>
            </div>

            <div className="space-y-4">
          {posts.map((post) => (
            <div
              key={post.slug}
              className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-6 border border-cyan-100 dark:border-gray-700/50 flex items-center gap-6"
            >
              {post.image && (
                <div className="flex-shrink-0">
                  <Image
                    src={post.image}
                    alt={post.title}
                    width={120}
                    height={80}
                    className="rounded-lg object-cover"
                  />
                </div>
              )}
              <div className="flex-1">
                <h3 className="text-xl font-serif text-gray-800 dark:text-white mb-2">
                  {post.title}
                </h3>
                <p className="text-sm text-cyan-500 mb-4">
                  {format(new Date(post.date), "MMMM d, yyyy")}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(post.slug)}
                    className="text-cyan-500 hover:text-cyan-600 transition-colors font-medium text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(post.slug)}
                    className="text-red-500 hover:text-red-600 transition-colors font-medium text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
          {posts.length === 0 && (
            <div className="bg-gradient-to-br from-cyan-100/80 via-rose-50/80 to-cyan-50/80 dark:from-gray-800/80 dark:via-gray-700/80 dark:to-gray-800/80 backdrop-blur-sm rounded-xl p-8 text-center border border-cyan-200 dark:border-gray-600/50">
              <p className="text-gray-600 dark:text-gray-400">No {activeTab} yet</p>
            </div>
          )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}

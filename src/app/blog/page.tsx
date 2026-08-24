import React from "react";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import { blogs } from "@/lib/blogData";
import BlogListing from "@/components/BlogListing";
import { Metadata } from "next";

import { createMetadata, getBlogCollectionSchema } from "@/lib/seo";
import { headers } from "next/headers";

export const metadata: Metadata = {
  ...createMetadata({
    title: "AI Learning Blog for Students and Parents",
    description:
      "Explore guides on ChatGPT, Canva AI, presentations, project workflows, and AI study tools for Class 6–10 students and parents.",
    path: "/blog",
  }),
};

export default async function BlogListingPage() {
  const featuredBlog = blogs.find(blog => blog.featured) || blogs[0];
  const regularBlogs = blogs.filter(blog => blog.slug !== featuredBlog.slug);

  const categories = [
    "All",
    "AI for Students",
    "AI Learning Guides",
    "AI Tools Tutorials",
    "Future Skills",
    "Bootcamp Insights"
  ];

  const blogListSchema = getBlogCollectionSchema(blogs);
  const nonce = (await headers()).get("x-nonce") ?? "";

  return (
    <main className="bg-transparent min-h-screen text-slate-800 dark:text-slate-200 font-sans relative pb-20 transition-colors duration-300">
      <script
        type="application/ld+json"
        nonce={nonce}
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogListSchema) }}
      />

      {/* Background Gradients */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[10%] left-[10%] w-[500px] h-[500px] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#0060aa]/5 via-[#0060aa]/2 to-transparent rounded-full" />
        <div className="absolute top-[40%] right-[10%] w-[600px] h-[600px] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#ff8b12]/5 via-[#ff8b12]/2 to-transparent rounded-full" />
      </div>

      <Navbar />

      <div className="container mx-auto px-6 relative z-10 pt-32 lg:pt-40">

        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#0060aa] via-[#8b5cf6] to-[#ff8b12] mb-6 tracking-tight leading-tight pb-2">
            AI Learning Blog for Students and Parents
          </h1>
          <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 font-light leading-relaxed">
            Learn AI tools, study smarter, and build future-ready project skills.
          </p>
        </div>

        {/* Featured Article */}
        {featuredBlog && (
          <div className="mb-20 group relative rounded-[24px] overflow-hidden bg-white/80 dark:bg-[#0a0f1c]/80 backdrop-blur-md border border-slate-200/60 dark:border-white/5 shadow-md transition-all duration-300 hover:border-[#ff8b12]/30 dark:hover:border-[#ff8b12]/20 hover:shadow-lg hover:-translate-y-1">
            <div className="flex flex-col lg:flex-row">
              <div className="w-full lg:w-1/2 aspect-video lg:aspect-auto h-64 lg:h-auto overflow-hidden relative">
                <Image
                  src={featuredBlog.thumbnail}
                  alt={featuredBlog.title}
                  priority
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute top-4 left-4 bg-[#0060aa]/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-white">
                  Featured
                </div>
              </div>
              <div className="w-full lg:w-1/2 p-8 lg:p-12 flex flex-col justify-center">
                <div className="flex items-center gap-3 mb-4 flex-wrap">
                  <span className="text-xs font-semibold text-[#ff8b12] dark:text-[#ff9d3b] uppercase tracking-widest">{featuredBlog.category}</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-350 dark:bg-slate-700"></span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">By Skillyug</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-350 dark:bg-slate-700"></span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">{featuredBlog.readTime}</span>
                </div>
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white mb-4 leading-tight group-hover:text-[#0060aa] dark:group-hover:text-[#ff9d3b] transition-colors">
                  {featuredBlog.title}
                </h2>
                <p className="text-slate-600 dark:text-slate-300 mb-8 leading-relaxed text-base md:text-lg">
                  {featuredBlog.shortDescription}
                </p>
                <Link
                  href={`/blog/${featuredBlog.slug}`}
                  className="inline-flex max-w-max items-center justify-center px-6 py-3 rounded-full text-sm font-bold text-white bg-gradient-to-r from-[#0060aa] to-[#ff8b12] hover:from-[#005291] hover:to-[#e0770b] shadow-md transition-all duration-300"
                >
                  Read Article
                </Link>
              </div>
            </div>
          </div>
        )}

        <BlogListing categories={categories} blogs={regularBlogs} reactionCounts={{}} />

      </div>

    </main>
  );
}

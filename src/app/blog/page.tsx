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
      "Explore guides on ChatGPT, Canva AI, presentations, project workflows, and AI study tools for Class 6–12 students and parents.",
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
    <main className="bg-slate-50 min-h-screen text-slate-800 font-sans selection:bg-blue-500/10 selection:text-blue-900 relative pb-20">
      <script
        type="application/ld+json"
        nonce={nonce}
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogListSchema) }}
      />

      {/* Background Gradients */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[10%] left-[10%] w-[500px] h-[500px] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-500/5 via-blue-500/2 to-transparent rounded-full" />
        <div className="absolute top-[40%] right-[10%] w-[600px] h-[600px] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-purple-500/5 via-purple-500/2 to-transparent rounded-full" />
      </div>

      <Navbar />

      <div className="container mx-auto px-6 relative z-10 pt-32 lg:pt-40">

        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 mb-6 tracking-tight leading-[1.1]">
            AI Learning Blog for Students and Parents
          </h1>
          <p className="text-lg md:text-xl text-slate-600 font-light leading-relaxed">
            Learn AI tools, study smarter, and build future-ready project skills.
          </p>
        </div>

        {/* Featured Article */}
        {featuredBlog && (
          <div className="mb-20 group relative rounded-[24px] overflow-hidden bg-white border border-slate-200 shadow-md transition-all duration-300 hover:border-blue-300 hover:shadow-lg hover:-translate-y-1">
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
                <div className="absolute top-4 left-4 bg-blue-600/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-white">
                  Featured
                </div>
              </div>
              <div className="w-full lg:w-1/2 p-8 lg:p-12 flex flex-col justify-center">
                <div className="flex items-center gap-3 mb-4 flex-wrap">
                  <span className="text-xs font-semibold text-purple-600 uppercase tracking-widest">{featuredBlog.category}</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-350"></span>
                  <span className="text-xs text-slate-500 font-medium">By Skillyug</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-350"></span>
                  <span className="text-xs text-slate-500 font-mono">{featuredBlog.readTime}</span>
                </div>
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-slate-900 mb-4 leading-tight group-hover:text-blue-600 transition-colors">
                  {featuredBlog.title}
                </h2>
                <p className="text-slate-600 mb-8 leading-relaxed text-base md:text-lg">
                  {featuredBlog.shortDescription}
                </p>
                <Link
                  href={`/blog/${featuredBlog.slug}`}
                  className="inline-flex max-w-max items-center justify-center px-6 py-3 rounded-full text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-md transition-all duration-300"
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

/* eslint-disable @next/next/no-img-element */
import React from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { blogs } from "@/lib/blogData";
import BlogListing from "@/components/BlogListing";
import { Metadata } from "next";
import { getReactionCounts } from "@/app/actions/reactions";
import FloatingCTA from "@/components/FloatingCTA";

export const metadata: Metadata = {
  title: "AI Learning Blog for Students and Parents | Skillyug",
  description: "Learn AI tools, study smarter, and prepare for the future. Discover the best AI apps and tutorials for students.",
  keywords: "AI Tools for Students, AI Learning for Kids, AI Bootcamp for Students, Summer AI Bootcamp",
  alternates: {
    canonical: 'https://www.skillyugedu.com/blog',
  },
  openGraph: {
    title: 'AI Learning Blog for Students and Parents | Skillyug',
    description: 'Learn AI tools, study smarter, and prepare for the future. Discover the best AI apps and tutorials for students.',
    url: 'https://www.skillyugedu.com/blog',
    siteName: 'Skillyug',
    locale: 'en_IN',
    type: 'website',
  },
};

export default async function BlogListingPage() {
  const featuredBlog = blogs.find(blog => blog.featured) || blogs[0];
  const regularBlogs = blogs.filter(blog => blog.slug !== featuredBlog.slug);

  // Fetch reaction counts for all blogs
  const reactionCountsArray = await Promise.all(
    regularBlogs.map(async (blog) => ({
      slug: blog.slug,
      counts: await getReactionCounts(blog.slug),
    }))
  );

  const reactionCounts = Object.fromEntries(
    reactionCountsArray.map(({ slug, counts }) => [slug, counts])
  );

  const categories = [
    "All",
    "AI for Students",
    "AI Learning Guides",
    "AI Tools Tutorials",
    "Future Skills",
    "Bootcamp Insights"
  ];

  return (
    <main className="bg-[#020617] min-h-screen text-slate-50 font-sans selection:bg-purple-500/30 selection:text-white relative pb-20">
      
      {/* Background Gradients */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-[10%] left-[10%] w-[500px] h-[500px] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/15 via-blue-900/5 to-transparent rounded-full" />
        <div className="absolute top-[40%] right-[10%] w-[600px] h-[600px] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-purple-900/15 via-purple-900/5 to-transparent rounded-full" />
      </div>

      <Navbar />

      <div className="container mx-auto px-6 relative z-10 pt-32 lg:pt-40">
        
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 neon-text mb-6 tracking-tight leading-[1.1]">
            AI Learning Blog for Students and Parents
          </h1>
          <p className="text-lg md:text-xl text-slate-300 font-light leading-relaxed">
            Learn AI tools, study smarter, and prepare for the future.
          </p>
        </div>

        {/* Featured Article */}
        {featuredBlog && (
          <div className="mb-20 group relative rounded-[24px] overflow-hidden bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.1)] backdrop-blur-sm transition-all duration-300 hover:border-blue-500/30 hover:shadow-[0_0_30px_rgba(59,130,246,0.15)] hover:-translate-y-1">
            <div className="flex flex-col lg:flex-row">
              <div className="w-full lg:w-1/2 aspect-video lg:aspect-auto h-64 lg:h-auto overflow-hidden relative">
                <img 
                  src={featuredBlog.thumbnail} 
                  alt={featuredBlog.title}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute top-4 left-4 bg-blue-600/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-white">
                  Featured
                </div>
              </div>
              <div className="w-full lg:w-1/2 p-8 lg:p-12 flex flex-col justify-center">
                <div className="flex items-center gap-3 mb-4 flex-wrap">
                  <span className="text-xs font-semibold text-purple-400 uppercase tracking-widest">{featuredBlog.category}</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-600"></span>
                  <span className="text-xs text-slate-300 font-medium">By Skillyug</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-600"></span>
                  <span className="text-xs text-slate-400 font-mono">{featuredBlog.readTime}</span>
                </div>
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-4 leading-tight group-hover:text-blue-300 transition-colors">
                  {featuredBlog.title}
                </h2>
                <p className="text-slate-300 mb-8 leading-relaxed text-base md:text-lg opacity-90">
                  {featuredBlog.shortDescription}
                </p>
                <Link 
                  href={`/blog/${featuredBlog.slug}`}
                  className="inline-flex max-w-max items-center justify-center px-6 py-3 rounded-full text-sm font-bold text-white bg-gradient-to-r from-blue-600/80 to-purple-600/80 hover:from-blue-500 hover:to-purple-500 shadow-[0_0_15px_rgba(59,130,246,0.3)] hover:shadow-[0_0_25px_rgba(139,92,246,0.5)] transition-all duration-300 border border-white/10"
                >
                  Read Article
                </Link>
              </div>
            </div>
          </div>
        )}

        <BlogListing categories={categories} blogs={regularBlogs} reactionCounts={reactionCounts} />

      </div>
      <FloatingCTA />
    </main>
  );
}

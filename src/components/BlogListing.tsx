"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { BlogPost } from "@/lib/blogData";

import AnonymousReactionBar from "@/components/AnonymousReactionBar";
import ShareButton from "@/components/ShareButton";

interface BlogListingProps {
  categories: string[];
  blogs: BlogPost[];
  reactionCounts?: Record<string, Record<string, number>>;
}

export default function BlogListing({ categories, blogs, reactionCounts = {} }: BlogListingProps) {
  const [activeCategory, setActiveCategory] = useState("All");

  const filteredBlogs = activeCategory === "All"
    ? blogs
    : blogs.filter(blog => blog.category === activeCategory);

  return (
    <div>
      {/* Blog Categories (Filter Tabs) */}
      <div className="mb-12 flex flex-wrap items-center justify-center gap-3">
        {categories.map((cat, i) => {
          const isActive = activeCategory === cat;
          return (
            <button 
              key={i}
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
                isActive
                  ? "bg-blue-600 text-white border border-blue-600 shadow-sm" 
                  : "bg-white text-slate-650 border border-slate-200 hover:text-slate-900 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-350 dark:border-slate-805 dark:hover:text-white dark:hover:bg-slate-800 shadow-sm"
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Blog Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredBlogs.map((blog) => (
            <div key={blog.slug}>
              <Link 
                href={`/blog/${blog.slug}`} 
                className="group flex flex-col h-full rounded-[20px] bg-white dark:bg-[#0a0f1c] border border-slate-200 dark:border-white/10 overflow-hidden transition-all duration-300 hover:border-blue-300 dark:hover:border-blue-500/50 hover:shadow-md hover:-translate-y-1.5"
                aria-label={`Read ${blog.title}`}
              >
                <div className="w-full h-48 overflow-hidden relative">
                  <Image 
                    src={blog.thumbnail} 
                    alt={blog.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <div className="p-6 flex flex-col flex-grow relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-semibold text-blue-700 dark:text-blue-400 uppercase tracking-widest bg-blue-50 dark:bg-blue-950/40 px-2 py-1 rounded-md">{blog.category}</span>
                    <div className="flex items-center gap-2">
                       <span className="text-[11px] text-slate-500 dark:text-slate-450 font-medium whitespace-nowrap">By Skillyug</span>
                       <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700 hidden sm:block"></span>
                       <span className="text-xs text-slate-500 dark:text-slate-450 font-mono hidden sm:block">{blog.readTime}</span>
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {blog.title}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-350 text-sm mb-6 leading-relaxed flex-grow line-clamp-3">
                    {blog.shortDescription}
                  </p>
                  <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-800/80">
                    <div className="mb-4 flex flex-wrap items-center gap-2" onClick={(e) => e.preventDefault()}>
                      <AnonymousReactionBar itemId={blog.slug} initialCounts={reactionCounts[blog.slug] || {}} />
                      <ShareButton url={`/blog/${blog.slug}`} title={blog.title} />
                    </div>
                    <div className="flex items-center text-sm font-bold text-slate-700 dark:text-slate-300 group-hover:text-blue-650 dark:group-hover:text-blue-400 transition-colors">
                      Read More 
                      <svg className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          ))}
      </div>
    </div>
  );
}

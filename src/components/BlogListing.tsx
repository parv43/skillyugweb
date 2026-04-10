/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { BlogPost } from "@/lib/blogData";
import { motion, AnimatePresence } from "framer-motion";
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
                  ? "bg-white/10 text-white border border-white/20 shadow-[0_0_15px_rgba(255,255,255,0.05)]" 
                  : "bg-transparent text-slate-400 border border-transparent hover:text-white hover:bg-white/5"
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Blog Grid */}
      <motion.div 
        layout
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
      >
        <AnimatePresence mode="popLayout">
          {filteredBlogs.map((blog) => (
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.4, type: "spring", bounce: 0.3 }}
              key={blog.slug}
            >
              <Link 
                href={`/blog/${blog.slug}`} 
                className="group flex flex-col h-full rounded-[20px] bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] backdrop-blur-sm overflow-hidden transition-all duration-300 hover:border-purple-500/30 hover:shadow-[0_0_30px_rgba(139,92,246,0.15)] hover:-translate-y-1.5"
                aria-label={`Read ${blog.title}`}
              >
                <div className="w-full h-48 overflow-hidden relative">
                  <img 
                    src={blog.thumbnail} 
                    alt={blog.title}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-blue-900/10 group-hover:bg-transparent transition-colors duration-500"></div>
                </div>
                <div className="p-6 flex flex-col flex-grow relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-semibold text-blue-400 uppercase tracking-widest bg-blue-500/10 px-2 py-1 rounded-md">{blog.category}</span>
                    <div className="flex items-center gap-2">
                       <span className="text-[11px] text-slate-400 font-medium whitespace-nowrap">By Skillyug</span>
                       <span className="w-1 h-1 rounded-full bg-slate-600 hidden sm:block"></span>
                       <span className="text-xs text-slate-400 font-mono hidden sm:block">{blog.readTime}</span>
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3 leading-snug group-hover:text-purple-300 transition-colors">
                    {blog.title}
                  </h3>
                  <p className="text-slate-400 text-sm mb-6 leading-relaxed flex-grow line-clamp-3">
                    {blog.shortDescription}
                  </p>
                  <div className="mt-auto pt-4 border-t border-white/5">
                    <div className="mb-4 flex flex-wrap items-center gap-2" onClick={(e) => e.preventDefault()}>
                      <AnonymousReactionBar itemId={blog.slug} initialCounts={reactionCounts[blog.slug] || {}} />
                      <ShareButton url={`/blog/${blog.slug}`} title={blog.title} />
                    </div>
                    <div className="flex items-center text-sm font-bold text-slate-300 group-hover:text-white transition-colors">
                      Read More 
                      <svg className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

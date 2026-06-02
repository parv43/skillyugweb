import React from "react";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { blogs } from "@/lib/blogData";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import AnonymousReactionBar from "@/components/AnonymousReactionBar";
import ShareButton from "@/components/ShareButton";
import CommentSection from "@/components/comments/CommentSection";

import { createMetadata, getBlogPostingSchema } from "@/lib/seo";
import { headers } from "next/headers";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const blog = blogs.find(b => b.slug === slug);
  if (!blog) return { title: "Blog Not Found" };

  return createMetadata({
    title: blog.title,
    description: blog.metaDescription,
    path: `/blog/${slug}`,
    type: "article",
  });
}

export async function generateStaticParams() {
  return blogs.map((blog) => ({
    slug: blog.slug,
  }));
}

export default async function BlogArticle({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const blog = blogs.find(b => b.slug === slug);

  if (!blog) {
    notFound();
  }

  let MdxContent: React.ComponentType | null = null;
  try {
    const mdxModule = await import(`@/content/blogs/${slug}.tsx`);
    MdxContent = mdxModule.default;
  } catch {
    // No MDX file found, we will fallback to blogData.ts
  }



  // Find related blogs (same category, different slug)
  const relatedBlogs = blogs
    .filter(b => b.category === blog.category && b.slug !== blog.slug)
    .slice(0, 3);
  if (relatedBlogs.length < 3) {
    const moreBlogs = blogs.filter(b => b.slug !== blog.slug && !relatedBlogs.find(r => r.slug === b.slug));
    relatedBlogs.push(...moreBlogs.slice(0, 3 - relatedBlogs.length));
  }

  // Check if title has keywords requiring a list section
  const titleLower = blog.title.toLowerCase();
  const requiresToolsList = ["best", "top", "tools", "apps"].some(keyword => titleLower.includes(keyword));

  const blogPostingSchema = getBlogPostingSchema(blog);

  const nonce = (await headers()).get("x-nonce") ?? "";

  return (
    <main className="bg-slate-50 min-h-screen text-slate-800 font-sans selection:bg-blue-500/10 selection:text-blue-900 relative pb-0">
      <script type="application/ld+json" nonce={nonce} dangerouslySetInnerHTML={{ __html: JSON.stringify(blogPostingSchema) }} />

      {/* Background Gradients */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[0%] left-[50%] -translate-x-1/2 w-[800px] h-[500px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-500/5 via-purple-500/2 to-transparent rounded-b-[100%]" />
        <div className="absolute bottom-[20%] right-[0%] w-[500px] h-[500px] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-pink-500/2 via-purple-500/2 to-transparent rounded-full" />
      </div>

      <Navbar />

      <article className="container mx-auto px-6 relative z-10 pt-32 lg:pt-40 pb-20 max-w-4xl">
        <div className="mb-6">
          <Link href="/blog" className="group inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-lg transition-all duration-200 text-sm w-fit">
            <svg className="w-4 h-4 transition-transform group-hover:-translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="font-bold tracking-widest text-xs uppercase pt-0.5">Back to Blog</span>
          </Link>
        </div>

        {/* Top Section */}
        <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center text-sm font-medium text-slate-500 gap-2">
            <Link href="/" className="hover:text-slate-900 transition-colors">Home</Link>
            <span className="text-slate-350">/</span>
            <Link
              href="/blog"
              className="hover:text-slate-900 transition-colors"
            >
              Blog
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs font-bold text-blue-700 uppercase tracking-widest bg-blue-50 px-3 py-1.5 rounded-md border border-blue-200">
              {blog.category}
            </span>
            <span className="text-sm text-slate-500 font-medium whitespace-nowrap">By Skillyug</span>
            <span className="w-1.5 h-1.5 rounded-full bg-slate-300 hidden sm:block"></span>
            <span className="text-sm text-slate-500 font-mono flex items-center">
              <svg className="w-4 h-4 mr-1 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {blog.readTime}
            </span>
          </div>
        </div>

        {/* Header */}
        <header className="mb-12 text-center md:text-left">
          <h1 className="text-3xl md:text-5xl lg:text-5xl font-black text-slate-900 mb-8 leading-[1.2]">
            {blog.title}
          </h1>

          <div className="relative w-full h-64 md:h-96 rounded-[24px] overflow-hidden border border-slate-200 shadow-md mb-12">
            <Image
              src={blog.thumbnail}
              alt={blog.title}
              priority
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 1024px"
            />
          </div>
        </header>

        {/* Content Body */}
        <div className="prose prose-slate prose-lg max-w-none text-slate-700">
          
          {MdxContent ? (
            <MdxContent />
          ) : (
            <>
              <p className="text-xl md:text-2xl text-slate-800 leading-relaxed font-light mb-12 border-l-4 border-blue-500 pl-6 bg-blue-50 py-4 rounded-r-lg whitespace-pre-wrap">
                {blog.content.intro}
              </p>

              <h2 className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 mt-12 mb-6">
                {blog.content.whatIsTopicHeader || "What is the Topic"}
              </h2>
              <div className="mb-10 leading-relaxed whitespace-pre-wrap text-slate-650">
                {blog.content.whatIsTopic}
              </div>

              <h2 className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 mt-12 mb-6">
                {blog.content.whyItMattersHeader || "Why It Matters for Students"}
              </h2>
              <div className="mb-10 leading-relaxed whitespace-pre-wrap text-slate-655">
                {blog.content.whyItMatters}
              </div>

              {/* Dynamic Content: List or standard content */}
              {requiresToolsList && blog.content.tools ? (
                <>
                  <h2 className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 mt-12 mb-8">
                    Top AI Tools for Students
                  </h2>
                  <div className="space-y-6 mb-12">
                    {blog.content.tools.map((tool, idx) => (
                      <div key={idx} className="bg-slate-50 border border-slate-200 rounded-[16px] p-6 hover:bg-white transition-colors">
                        <h3 className="text-xl font-bold text-slate-900 mb-2 flex items-center">
                          <span className="w-8 h-8 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center text-sm mr-3 font-mono border border-blue-200">
                            {idx + 1}
                          </span>
                          {tool.name}
                        </h3>
                        <div className="pl-11">
                          <p className="text-sm font-semibold text-purple-700 mb-2 uppercase tracking-wide">
                            Best For: {tool.useCase}
                          </p>
                          <p className="text-slate-650 leading-relaxed text-base m-0 whitespace-pre-wrap">
                            {tool.explanation}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : blog.content.mainContent ? (
                <>
                  <h2 className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 mt-12 mb-6">
                    {blog.content.mainContentHeader || "Deep Dive Tutorial"}
                  </h2>
                  <div className="mb-10 leading-relaxed whitespace-pre-wrap text-slate-655">
                    {blog.content.mainContent}
                  </div>
                </>
              ) : null}

              <h2 className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 mt-12 mb-6">
                {blog.content.practicalUsageHeader || "Practical Usage"}
              </h2>
              <div className="mb-10 leading-relaxed whitespace-pre-wrap text-slate-655">
                {blog.content.practicalUsage}
              </div>

              <h2 className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 mt-12 mb-6">
                {blog.content.conclusionHeader || "Conclusion"}
              </h2>
              <div className="mb-12 leading-relaxed whitespace-pre-wrap text-slate-655">
                {blog.content.conclusion}
              </div>
            </>
          )}

          <div className="rounded-[1.75rem] border border-blue-200 bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6 md:p-8 shadow-sm">
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-blue-700">
              Continue With Skillyug
            </p>
            <h2 className="mt-4 text-2xl md:text-3xl font-black text-slate-900">
              Go from reading about AI to using it with real structure.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-slate-650">
              {blog.content.ctaParagraph ||
                "Reserve your bootcamp spot and start building with AI tools like ChatGPT, Canva AI, and more."}
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/book-slot"
                className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 text-sm font-bold text-white transition-all hover:-translate-y-0.5 hover:shadow-md"
              >
                Reserve Your Bootcamp Spot
              </Link>
            </div>
            <div className="mt-6 flex flex-wrap gap-3 text-sm">
              <Link href="/#curriculum" className="text-blue-600 font-semibold transition-colors hover:text-blue-850">
                Explore the bootcamp curriculum
              </Link>
              <span className="text-slate-350">|</span>
              <Link href="/blog" className="text-blue-600 font-semibold transition-colors hover:text-blue-850">
                Browse all AI learning guides
              </Link>
            </div>
          </div>

          {/* Reaction Bar */}
          <div className="mt-12 mb-8 py-8 border-t border-slate-200 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-lg font-bold text-slate-800">What did you think of this article?</div>
            <div className="flex flex-wrap items-center gap-3">
              <AnonymousReactionBar itemId={slug} />
              <ShareButton url={`/blog/${slug}`} title={blog.title} />
            </div>
          </div>

          {/* Comment Section */}
          <CommentSection blogSlug={slug} />

          {/* Related Articles */}
          {relatedBlogs.length > 0 && (
            <div className="mt-16 pt-12 border-t border-slate-200">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Suggested Articles</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {relatedBlogs.map(related => (
                  <Link href={`/blog/${related.slug}`} key={related.slug} className="group block p-5 rounded-xl bg-white border border-slate-200 hover:border-blue-300 hover:bg-slate-50/50 transition duration-300 shadow-sm">
                    <h3 className="text-[17px] font-semibold text-blue-750 group-hover:text-blue-800 mb-2 leading-tight line-clamp-2">{related.title}</h3>
                    <p className="text-sm text-slate-500 line-clamp-2 m-0">{related.shortDescription}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}

        </div>
      </article>

      {/* Mandatory CTA Section */}
      <section className="relative w-full py-20 mt-10 bg-white border-t border-slate-200">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-500/5 via-transparent to-transparent opacity-60" />

        <div className="container mx-auto px-6 relative z-10 text-center max-w-4xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-blue-200 mb-8 bg-blue-50">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            <span className="text-[11px] sm:text-xs font-bold text-blue-700 uppercase tracking-widest">Next Steps</span>
          </div>

          <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 mb-6">
            Join the Skillyug AI Bootcamp for Students (Classes 6–12)
          </h2>

          <p className="text-lg md:text-xl text-slate-600 font-light max-w-2xl mx-auto mb-12">
            Reserve your bootcamp seat and give your child the AI skills they
            need to stand out academically and creatively.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 w-full sm:w-auto">
            <Link
              href="/book-slot"
              className="px-8 py-4 rounded-full text-white font-bold text-lg hover:scale-105 transition-transform w-full sm:w-auto text-center bg-gradient-to-r from-blue-600 to-indigo-600 shadow-md block"
            >
              Reserve Your Bootcamp Spot
            </Link>
          </div>
        </div>
      </section>

      {/* Shared Footer */}
      <footer className="relative z-10 w-full bg-slate-50 border-t border-slate-200/80 pt-8 pb-20 flex flex-col items-center">
        <div className="bg-slate-100/50 p-6 md:p-16 px-10 md:px-48 rounded-[2rem] md:rounded-[2.5rem] mb-16 backdrop-blur-sm overflow-hidden group border border-slate-200/50">
          <Image src="/skillyug-optimized.svg" alt="Skillyug Logo" width={300} height={150} className="h-14 md:h-36 w-auto object-contain scale-[1.8] md:scale-[2.0] transition-transform group-hover:scale-[2.4] duration-500 transform-gpu brightness-0 opacity-85" />
        </div>

        <nav className="mb-6">
          <ul className="flex flex-wrap justify-center gap-6 text-sm font-semibold text-slate-500">
            <li><Link href="/" className="hover:text-blue-600 transition-colors">Home</Link></li>
            <li><Link href="/blog" className="hover:text-blue-600 transition-colors">Blog</Link></li>
          </ul>
        </nav>

        <div className="mb-8 flex gap-4 text-xs text-slate-400">
          <Link href="/refund-policy" className="hover:text-slate-600 transition-colors">Refund Policy</Link>
          <span>|</span>
          <Link href="/terms-and-conditions" className="hover:text-slate-600 transition-colors">Terms & Conditions</Link>
        </div>

        <p className="text-xs font-mono text-slate-400 tracking-widest text-center">
          © 2026 SKILLYUG<br />
          ALL RIGHTS RESERVED.
        </p>
      </footer>

    </main>
  );
}

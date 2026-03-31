import React from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import { blogs } from "@/lib/blogData";
import { notFound } from "next/navigation";
import { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const blog = blogs.find(b => b.slug === slug);
  if (!blog) return { title: "Blog Not Found" };

  return {
    title: `${blog.title} | Skillyug AI Blog`,
    description: blog.metaDescription,
    keywords: blog.keywords.join(", "),
    alternates: {
      canonical: `https://skillyugedu.com/blog/${slug}`,
    },
    openGraph: {
      title: `${blog.title} | Skillyug AI Blog`,
      description: blog.metaDescription,
      url: `https://skillyugedu.com/blog/${slug}`,
      siteName: 'Skillyug',
      images: [
        {
          url: blog.thumbnail,
          width: 1200,
          height: 630,
        },
      ],
      locale: 'en_IN',
      type: 'article',
    },
  };
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

  return (
    <main className="bg-[#020617] min-h-screen text-slate-50 font-sans selection:bg-purple-500/30 selection:text-white relative pb-0">
      
      {/* Background Gradients */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[0%] left-[50%] -translate-x-1/2 w-[800px] h-[500px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-purple-900/5 to-transparent rounded-b-[100%]" />
        <div className="absolute bottom-[20%] right-[0%] w-[500px] h-[500px] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-pink-900/10 via-purple-900/5 to-transparent rounded-full" />
      </div>

      <Navbar />

      <article className="container mx-auto px-6 relative z-10 pt-32 lg:pt-40 pb-20 max-w-4xl">
        
        {/* Top Section */}
        <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center text-sm font-medium text-slate-400 gap-2">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <span className="text-slate-600">/</span>
            <Link 
              href="/blog"
              className="hover:text-white transition-colors"
            >
              Blog
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs font-bold text-blue-400 uppercase tracking-widest bg-blue-500/10 px-3 py-1.5 rounded-md border border-blue-500/20">
              {blog.category}
            </span>
            <span className="text-sm text-slate-400 font-mono flex items-center">
              <svg className="w-4 h-4 mr-1 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {blog.readTime}
            </span>
          </div>
        </div>

        {/* Header */}
        <header className="mb-12 text-center md:text-left">
          <h1 className="text-3xl md:text-5xl lg:text-5xl font-black text-white mb-8 leading-[1.2] drop-shadow-sm">
            {blog.title}
          </h1>
          
          <div className="w-full h-64 md:h-96 rounded-[24px] overflow-hidden border border-white/10 shadow-[0_0_30px_rgba(0,0,0,0.5)] mb-12">
            <img 
              src={blog.thumbnail} 
              alt={blog.title}
              loading="lazy"
              className="w-full h-full object-cover"
            />
          </div>
        </header>

        {/* Content Body */}
        <div className="prose prose-invert prose-lg max-w-none text-slate-300">
          
          <p className="text-xl md:text-2xl text-slate-200 leading-relaxed font-light mb-12 border-l-4 border-blue-500 pl-6 bg-blue-500/5 py-4 rounded-r-lg whitespace-pre-wrap">
            {blog.content.intro}
          </p>

          <h2 className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mt-12 mb-6">
            {blog.content.whatIsTopicHeader || "What is the Topic"}
          </h2>
          <div className="mb-10 leading-relaxed whitespace-pre-wrap text-slate-300">
            {blog.content.whatIsTopic}
          </div>

          <h2 className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mt-12 mb-6">
            {blog.content.whyItMattersHeader || "Why It Matters for Students"}
          </h2>
          <div className="mb-10 leading-relaxed whitespace-pre-wrap text-slate-300">
            {blog.content.whyItMatters}
          </div>

          {/* Dynamic Content: List or standard content */}
          {requiresToolsList && blog.content.tools ? (
            <>
              <h2 className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mt-12 mb-8">
                Top AI Tools for Students
              </h2>
              <div className="space-y-6 mb-12">
                {blog.content.tools.map((tool, idx) => (
                  <div key={idx} className="bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] backdrop-blur-sm rounded-[16px] p-6 hover:bg-white/5 transition-colors">
                    <h3 className="text-xl font-bold text-white mb-2 flex items-center">
                      <span className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-sm mr-3 font-mono border border-blue-500/30">
                        {idx + 1}
                      </span>
                      {tool.name}
                    </h3>
                    <div className="pl-11">
                      <p className="text-sm font-semibold text-purple-400 mb-2 uppercase tracking-wide">
                        Best For: {tool.useCase}
                      </p>
                      <p className="text-slate-300 leading-relaxed text-base m-0 whitespace-pre-wrap">
                        {tool.explanation}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : blog.content.mainContent ? (
            <>
              <h2 className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mt-12 mb-6">
                {blog.content.mainContentHeader || "Deep Dive Tutorial"}
              </h2>
              <div className="mb-10 leading-relaxed whitespace-pre-wrap text-slate-300">
                {blog.content.mainContent}
              </div>
            </>
          ) : null}

          <h2 className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mt-12 mb-6">
            {blog.content.practicalUsageHeader || "Practical Usage"}
          </h2>
          <div className="mb-10 leading-relaxed whitespace-pre-wrap text-slate-300">
            {blog.content.practicalUsage}
          </div>

          <h2 className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mt-12 mb-6">
            {blog.content.conclusionHeader || "Conclusion"}
          </h2>
          <div className="mb-12 leading-relaxed whitespace-pre-wrap text-slate-300">
            {blog.content.conclusion}
          </div>
          
          {/* Related Articles */}
          {relatedBlogs.length > 0 && (
            <div className="mt-16 pt-12 border-t border-white/10">
              <h2 className="text-2xl font-bold text-white mb-6">Related Articles</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {relatedBlogs.map(related => (
                  <Link href={`/blog/${related.slug}`} key={related.slug} className="group block p-5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition duration-300">
                    <h3 className="text-[17px] font-semibold text-blue-300 group-hover:text-blue-400 mb-2 leading-tight line-clamp-2">{related.title}</h3>
                    <p className="text-sm text-slate-400 line-clamp-2 m-0">{related.shortDescription}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}
          
        </div>
      </article>

      {/* Mandatory CTA Section */}
      <section className="relative w-full py-20 mt-10 bg-[rgba(255,255,255,0.02)] border-t border-white/5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/10 via-transparent to-transparent opacity-60" />
        
        <div className="container mx-auto px-6 relative z-10 text-center max-w-4xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel border border-blue-500/30 mb-8 bg-blue-500/5">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
            <span className="text-[11px] sm:text-xs font-bold text-blue-200 uppercase tracking-widest">Next Steps</span>
          </div>

          <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 neon-text mb-6">
            Join the Skillyug AI Bootcamp for Students (Classes 6–12)
          </h2>
          
          <p className="text-lg md:text-xl text-slate-300 font-light max-w-2xl mx-auto mb-12">
            {blog.content.ctaParagraph || "Help your child learn AI tools the right way with structured guidance and real projects."} {!blog.content.ctaParagraph && <><Link href="/#curriculum" className="text-blue-400 hover:text-blue-300 underline underline-offset-4 decoration-blue-500/30">View our curriculum</Link> or check out <Link href="/#projects" className="text-purple-400 hover:text-purple-300 underline underline-offset-4 decoration-purple-500/30">student projects</Link> to see what they can build.</>}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 w-full sm:w-auto">
            <Link 
              href="/#curriculum"
              className="px-8 py-4 rounded-full text-white font-bold text-lg hover:bg-white/5 transition-colors border border-white/10 w-full sm:w-auto text-center"
            >
              Explore Bootcamp
            </Link>
            <Link 
              href="/#projects"
              className="px-8 py-4 rounded-full text-white font-bold text-lg hover:bg-white/5 transition-colors border border-white/10 w-full sm:w-auto text-center"
            >
              Student Projects
            </Link>
            <Link 
              href="/#demo"
              className="glow-button px-8 py-4 rounded-full text-white font-bold text-lg hover:scale-105 transition-transform w-full sm:w-auto text-center bg-gradient-to-r from-blue-600 to-purple-600 shadow-[0_0_15px_rgba(59,130,246,0.4)] hover:shadow-[0_0_25px_rgba(139,92,246,0.6)] block border border-white/10"
            >
              Book Free Demo Class
            </Link>
          </div>
        </div>
      </section>
      
      {/* Minimal Footer consistency */}
      <footer className="relative z-10 w-full bg-[#020617] border-t border-slate-900/80 py-12 flex flex-col items-center">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 shadow-[0_0_15px_rgba(59,130,246,0.5)] flex items-center justify-center opacity-70 mb-4 cyber-glow">
          <span className="text-white font-black text-xs">SY</span>
        </div>

        <nav className="mb-6">
          <ul className="flex flex-wrap justify-center gap-6 text-sm font-medium text-slate-400">
            <li><a href="/" className="hover:text-blue-400 transition-colors">Home</a></li>
            <li><a href="/blog" className="hover:text-blue-400 transition-colors">Blog</a></li>
            <li><a href="/#ask-ai" className="hover:text-blue-400 transition-colors">Interactive Demo</a></li>
            <li><a href="/#curriculum" className="hover:text-blue-400 transition-colors">Curriculum</a></li>
          </ul>
        </nav>

        <p className="text-sm font-mono text-slate-500 tracking-widest text-center">
          © 2026 SKILLYUG NEURAL SYSTEMS<br />
          ALL RIGHTS RESERVED.
        </p>
      </footer>

    </main>
  );
}

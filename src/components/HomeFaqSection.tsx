"use client"

import Link from "next/link"
import { homeFaqItems } from "@/lib/homeFaq"

export default function HomeFaqSection() {
  return (
    <div className="mt-10 rounded-[2rem] border border-slate-200 bg-white p-6 md:p-8 shadow-[0_8px_30px_rgba(0,0,0,0.02)]">
      <div className="mb-8 text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.22em] text-blue-700">
          Quick FAQ
        </span>
        <h3 className="mt-5 text-2xl md:text-3xl font-black text-slate-900">
          Answers Parents Usually Need Before Booking
        </h3>
        <p className="mt-3 text-sm md:text-base text-slate-600">
          Use the chat for instant questions, and use these stable answers for the basics.
        </p>
      </div>

      <div className="space-y-4">
        {homeFaqItems.map((item, index) => (
          <details
            key={item.question}
            className="group rounded-[1.4rem] border border-slate-200 bg-slate-50 p-5 transition-colors open:border-blue-500/20"
            open={index === 0}
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left text-base font-bold text-slate-800">
              <span>{item.question}</span>
              <span className="text-blue-600 transition-transform group-open:rotate-45">+</span>
            </summary>
            <div className="mt-4 border-t border-slate-200/80 pt-4 text-sm leading-relaxed text-slate-600">
              <p>{item.answer}</p>
              {item.href && item.linkLabel ? (
                <Link
                  href={item.href}
                  className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-blue-600 transition-colors hover:text-blue-750"
                >
                  {item.linkLabel}
                  <span aria-hidden="true">→</span>
                </Link>
              ) : null}
            </div>
          </details>
        ))}
      </div>

      <div className="mt-8 border-t border-slate-100 pt-6">
        <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-slate-400">
          Popular Guides
        </p>
        <div className="mt-4 flex flex-wrap justify-center gap-3">
          {[
            {
              href: "/blog/how-to-use-chatgpt-for-homework",
              label: "ChatGPT for Homework",
            },
            {
              href: "/blog/how-to-use-canva-ai-for-projects",
              label: "Canva AI for Projects",
            },
            {
              href: "/blog/best-ai-tools-for-presentations",
              label: "AI Tools for Presentations",
            },
            {
              href: "/blog/how-to-learn-ai-as-a-school-student",
              label: "How to Learn AI",
            },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 transition-colors hover:border-blue-400 hover:text-slate-900 shadow-sm"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

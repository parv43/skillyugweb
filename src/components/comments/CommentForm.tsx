"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import type { User } from "@supabase/supabase-js";

const MAX_CHARS = 1000;

interface CommentFormProps {
  blogSlug: string;
  user: User | null;
  onCommentPosted: (comment: CommentRow) => void;
}

export interface CommentRow {
  id: string;
  blog_slug: string;
  user_id: string;
  user_name: string;
  user_avatar: string | null;
  content: string;
  created_at: string;
}

export default function CommentForm({ blogSlug, user, onCommentPosted }: CommentFormProps) {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!user) {
      setError("Please sign in to post a comment.");
      return;
    }

    const trimmed = content.trim();
    if (trimmed.length < 3) {
      setError("Your comment is too short. Please write at least 3 characters.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: blogSlug, content: trimmed }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
      } else {
        setContent("");
        setSuccessMsg("Comment posted! 🎉");
        onCommentPosted(data.comment);
        setTimeout(() => setSuccessMsg(null), 4000);
      }
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  // ── Not signed in ─────────────────────────────────────────────────────────
  if (!user) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
        <div className="w-12 h-12 rounded-full bg-blue-500/15 flex items-center justify-center flex-shrink-0">
          <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <div className="flex-1">
          <p className="text-slate-800 dark:text-slate-200 font-medium text-sm mb-1">Sign in to join the discussion</p>
          <p className="text-slate-500 dark:text-slate-450 text-xs">Your comment will go live immediately after passing our content checks.</p>
        </div>
        <Link
          href="/login"
          className="flex-shrink-0 px-5 py-2.5 rounded-full text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 transition-all hover:scale-105 shadow-lg shadow-blue-900/30"
        >
          Sign In
        </Link>
      </div>
    );
  }

  // ── Signed-in form ────────────────────────────────────────────────────────
  const charCount = content.length;
  const isNearLimit = charCount > MAX_CHARS * 0.85;
  const isOverLimit = charCount > MAX_CHARS;

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {/* User info strip */}
      <div className="flex items-center gap-3 pb-3 border-b border-white/[0.06]">
        {user.user_metadata?.avatar_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={user.user_metadata.avatar_url}
            alt="Your avatar"
            className="w-8 h-8 rounded-full object-cover ring-1 ring-white/20"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold ring-1 ring-white/20">
            {(user.user_metadata?.full_name || user.email || "?")[0].toUpperCase()}
          </div>
        )}
        <span className="text-sm text-slate-800 dark:text-slate-200 font-medium">
          {user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split("@")[0] || "You"}
        </span>
        <span className="ml-auto text-[10px] font-mono text-slate-500 dark:text-slate-500 uppercase tracking-widest">
          Posting as yourself
        </span>
      </div>

      {/* Textarea */}
      <div className="relative">
        <textarea
          ref={textareaRef}
          id="comment-input"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Share your thoughts… (no links, please)"
          rows={4}
          maxLength={MAX_CHARS + 10}
          disabled={isSubmitting}
          className="w-full resize-none rounded-xl bg-white/[0.04] border border-white/10 focus:border-blue-500/60 focus:outline-none focus:ring-2 focus:ring-blue-500/20 px-4 py-3 text-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        />
        {/* Character counter */}
        <span
          className={`absolute bottom-3 right-3 text-[10px] font-mono transition-colors ${
            isOverLimit
              ? "text-red-400"
              : isNearLimit
              ? "text-amber-400"
              : "text-slate-700"
          }`}
        >
          {charCount}/{MAX_CHARS}
        </span>
      </div>


      {/* Content policy notice */}
      <p className="text-[11px] text-slate-600 leading-relaxed">
        🛡️ Comments are automatically filtered for inappropriate language and links. Be respectful — this is a space for students!
      </p>

      {/* Error */}
      {error && (
        <div
          role="alert"
          className="flex items-start gap-2.5 rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-800 dark:text-red-300"
        >
          <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          {error}
        </div>
      )}

      {/* Success */}
      {successMsg && (
        <div
          role="status"
          className="flex items-center gap-2.5 rounded-xl bg-green-500/10 border border-green-500/20 px-4 py-3 text-sm text-green-800 dark:text-green-300"
        >
          <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          {successMsg}
        </div>
      )}

      {/* Submit */}
      <div className="flex justify-end">
        <button
          type="submit"
          id="submit-comment-btn"
          disabled={isSubmitting || isOverLimit || charCount < 3}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:from-blue-600 disabled:hover:to-purple-600 transition-all hover:scale-105 shadow-lg shadow-blue-900/30"
        >
          {isSubmitting ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              Posting…
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
              Post Comment
            </>
          )}
        </button>
      </div>
    </form>
  );
}

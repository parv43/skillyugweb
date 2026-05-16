"use client";

import { useState, useCallback, useEffect } from "react";
import { createBrowserClient } from "@supabase/ssr";
import CommentForm, { type CommentRow } from "./CommentForm";
import CommentList from "./CommentList";
import type { User } from "@supabase/supabase-js";

interface CommentSectionProps {
  blogSlug: string;
}

export default function CommentSection({ blogSlug }: CommentSectionProps) {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [newComments, setNewComments] = useState<CommentRow[]>([]);
  const [commentCount, setCommentCount] = useState<number | null>(null);

  // ── Resolve current session on the client ─────────────────────────────────
  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user ?? null);
      setAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleCommentPosted = useCallback((comment: CommentRow) => {
    setNewComments((prev) => [comment, ...prev]);
    setCommentCount((prev) => (prev !== null ? prev + 1 : 1));
  }, []);

  const handleCountFetched = useCallback((count: number) => {
    setCommentCount((prev) => (prev !== null ? prev : count));
  }, []);

  return (
    <section
      id="comments"
      aria-label="Comments"
      className="mt-16 pt-10 border-t border-white/[0.07]"
    >
      {/* Section header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
          <svg
            className="w-4 h-4 text-blue-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-white">
          Discussion
          {commentCount !== null && commentCount > 0 && (
            <span className="ml-2 text-sm font-mono text-slate-500 font-normal">
              ({commentCount + newComments.length > commentCount
                ? newComments.length + (commentCount - newComments.length)
                : commentCount})
            </span>
          )}
        </h2>
        <div className="flex-1 h-px bg-gradient-to-r from-white/10 to-transparent" />
        {/* Shield badge */}
        <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          Safe for Students
        </div>
      </div>

      {/* Comment submission form */}
      <div className="mb-10 rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5 md:p-6">
        {authLoading ? (
          <div className="flex items-center gap-3 py-3">
            <div className="w-8 h-8 rounded-full bg-white/[0.06] animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-3 bg-white/[0.06] rounded animate-pulse w-32" />
              <div className="h-3 bg-white/[0.04] rounded animate-pulse w-64" />
            </div>
          </div>
        ) : (
          <CommentForm
            blogSlug={blogSlug}
            user={user}
            onCommentPosted={handleCommentPosted}
          />
        )}
      </div>

      {/* Comment list */}
      <CommentList
        blogSlug={blogSlug}
        newComments={newComments}
        onCountFetched={handleCountFetched}
      />
    </section>
  );
}

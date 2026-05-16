"use client";

import { useState, useEffect, useCallback } from "react";
import Avatar from "boring-avatars";
import type { CommentRow } from "./CommentForm";

function timeAgo(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(isoString).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

interface CommentListProps {
  blogSlug: string;
  /** Comments prepended optimistically after form submission */
  newComments: CommentRow[];
  /** Called with the fetched total count once the first page loads */
  onCountFetched?: (count: number) => void;
}

export default function CommentList({ blogSlug, newComments, onCountFetched }: CommentListProps) {
  const [comments, setComments] = useState<CommentRow[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // ── Initial fetch ──────────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setIsLoading(true);
      setFetchError(null);
      try {
        const res = await fetch(`/api/comments?slug=${encodeURIComponent(blogSlug)}`);
        if (!res.ok) throw new Error("Failed to load comments");
        const data = await res.json();
        if (!cancelled) {
          setComments(data.comments ?? []);
          setNextCursor(data.nextCursor);
          setHasMore(data.hasMore);
          onCountFetched?.(data.comments?.length ?? 0);
        }
      } catch {
        if (!cancelled) setFetchError("Could not load comments. Please refresh.");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [blogSlug, onCountFetched]);

  // ── Load more (cursor pagination) ─────────────────────────────────────────
  const loadMore = useCallback(async () => {
    if (!nextCursor || isLoadingMore) return;
    setIsLoadingMore(true);
    try {
      const res = await fetch(
        `/api/comments?slug=${encodeURIComponent(blogSlug)}&cursor=${encodeURIComponent(nextCursor)}`
      );
      if (!res.ok) throw new Error("Failed to fetch more");
      const data = await res.json();
      setComments((prev) => [...prev, ...(data.comments ?? [])]);
      setNextCursor(data.nextCursor);
      setHasMore(data.hasMore);
    } catch {
      setFetchError("Could not load more comments.");
    } finally {
      setIsLoadingMore(false);
    }
  }, [blogSlug, nextCursor, isLoadingMore]);

  // ── Deduplicate: don't show newly posted comments twice ───────────────────
  const newIds = new Set(newComments.map((c) => c.id));
  const filteredFetched = comments.filter((c) => !newIds.has(c.id));
  const allComments: CommentRow[] = [...newComments, ...filteredFetched];

  // ── Loading skeleton ───────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex gap-3">
            <div className="w-9 h-9 rounded-full bg-white/[0.06] flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-3 bg-white/[0.06] rounded w-24" />
              <div className="h-3 bg-white/[0.04] rounded w-full" />
              <div className="h-3 bg-white/[0.04] rounded w-3/4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // ── Error state ────────────────────────────────────────────────────────────
  if (fetchError && allComments.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-10 text-center">
        <svg className="w-8 h-8 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-sm text-slate-500">{fetchError}</p>
      </div>
    );
  }

  // ── Empty state ────────────────────────────────────────────────────────────
  if (allComments.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-12 text-center">
        <div className="w-14 h-14 rounded-full bg-blue-500/10 flex items-center justify-center">
          <svg className="w-7 h-7 text-blue-400/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
        <p className="text-slate-400 font-medium text-sm">No comments yet</p>
        <p className="text-slate-600 text-xs">Be the first to share your thoughts on this article!</p>
      </div>
    );
  }

  // ── Comment list ───────────────────────────────────────────────────────────
  return (
    <div className="space-y-1">
      {allComments.map((comment, idx) => (
        <CommentCard key={comment.id} comment={comment} isNew={newIds.has(comment.id)} index={idx} />
      ))}

      {/* Load more */}
      {hasMore && (
        <div className="pt-4 flex justify-center">
          <button
            onClick={loadMore}
            disabled={isLoadingMore}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-xs font-semibold text-slate-400 hover:text-white border border-white/10 hover:border-white/20 bg-white/[0.03] hover:bg-white/[0.06] transition-all disabled:opacity-40"
          >
            {isLoadingMore ? (
              <>
                <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Loading…
              </>
            ) : (
              <>
                Load more comments
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </>
            )}
          </button>
        </div>
      )}

      {fetchError && (
        <p className="text-center text-xs text-red-400 pt-2">{fetchError}</p>
      )}
    </div>
  );
}

// ── Individual comment card ───────────────────────────────────────────────────
function CommentCard({
  comment,
  isNew,
  index,
}: {
  comment: CommentRow;
  isNew: boolean;
  index: number;
}) {
  return (
    <article
      className={`group flex gap-3 py-4 border-b border-white/[0.05] last:border-0 transition-all ${
        isNew ? "animate-[fadeSlideIn_0.4s_ease_both]" : ""
      }`}
      style={{ animationDelay: isNew ? "0ms" : `${index * 30}ms` }}
    >
      {/* Avatar */}
      <div className="flex-shrink-0 w-9 h-9 rounded-full overflow-hidden ring-1 ring-white/10">
        {comment.user_avatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={comment.user_avatar}
            alt={`${comment.user_name}'s avatar`}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <Avatar
            size={36}
            name={comment.user_id}
            variant="marble"
            colors={["#3b82f6", "#8b5cf6", "#06b6d4", "#1e3a5f", "#0f172a"]}
          />
        )}
      </div>

      {/* Body */}
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2 mb-1.5 flex-wrap">
          <span className="text-sm font-semibold text-slate-200 truncate">{comment.user_name}</span>
          <time
            dateTime={comment.created_at}
            className="text-[11px] text-slate-600 font-mono flex-shrink-0"
          >
            {timeAgo(comment.created_at)}
          </time>
          {isNew && (
            <span className="text-[10px] font-bold text-green-400 bg-green-400/10 px-1.5 py-0.5 rounded">
              NEW
            </span>
          )}
        </div>
        <p className="text-sm text-slate-400 leading-relaxed break-words">{comment.content}</p>
      </div>
    </article>
  );
}

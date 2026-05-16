"use client";

import { useState, useEffect, useCallback } from "react";
import { createBrowserClient } from "@supabase/ssr";
import Avatar from "boring-avatars";
import type { CommentRow } from "@/components/comments/CommentForm";

function timeAgo(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(isoString).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

const PAGE_SIZE = 20;

export default function AdminCommentDashboard() {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [comments, setComments] = useState<CommentRow[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [filterSlug, setFilterSlug] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // ── Check if logged-in user is an admin ────────────────────────────────────
  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setIsAdmin(false); setIsLoading(false); return; }

      const { data } = await supabase
        .from("admins")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      setIsAdmin(!!data);
      if (!data) setIsLoading(false);
    })();
  }, []);

  // ── Fetch all comments (admin has full visibility via API) ─────────────────
  const fetchComments = useCallback(async (cursor?: string) => {
    const params = new URLSearchParams({ slug: filterSlug || "%" });
    if (cursor) params.set("cursor", cursor);
    // Use a special admin slug wildcard — we query all slugs via the API
    // (the GET handler filters by exact slug; for admin we load without filter)
    const url = filterSlug
      ? `/api/comments?${params}`
      : `/api/comments/all?limit=${PAGE_SIZE}${cursor ? `&cursor=${cursor}` : ""}`;

    const res = await fetch(url);
    if (!res.ok) throw new Error("Failed to load comments");
    return res.json();
  }, [filterSlug]);

  useEffect(() => {
    if (isAdmin === false || isAdmin === null) return;
    setIsLoading(true);
    setError(null);
    (async () => {
      try {
        const data = await fetchComments();
        setComments(data.comments ?? []);
        setNextCursor(data.nextCursor);
        setHasMore(data.hasMore);
      } catch {
        setError("Failed to load comments. Make sure you are an admin.");
      } finally {
        setIsLoading(false);
      }
    })();
  }, [isAdmin, fetchComments]);

  const loadMore = useCallback(async () => {
    if (!nextCursor || isLoadingMore) return;
    setIsLoadingMore(true);
    try {
      const data = await fetchComments(nextCursor);
      setComments((prev) => [...prev, ...(data.comments ?? [])]);
      setNextCursor(data.nextCursor);
      setHasMore(data.hasMore);
    } catch {
      setError("Failed to load more comments.");
    } finally {
      setIsLoadingMore(false);
    }
  }, [nextCursor, isLoadingMore, fetchComments]);

  // ── Delete a comment ───────────────────────────────────────────────────────
  const handleDelete = useCallback(async (id: string) => {
    if (!window.confirm("Permanently delete this comment? This cannot be undone.")) return;
    setDeletingIds((prev) => new Set(prev).add(id));
    try {
      const res = await fetch(`/api/comments/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error ?? "Delete failed");
      }
      setComments((prev) => prev.filter((c) => c.id !== id));
    } catch (err: unknown) {
      alert((err as Error).message);
    } finally {
      setDeletingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  }, []);

  // ── Client-side search filter ──────────────────────────────────────────────
  const visibleComments = searchQuery.trim()
    ? comments.filter(
        (c) =>
          c.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.user_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.blog_slug.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : comments;

  // ── States ─────────────────────────────────────────────────────────────────
  if (isAdmin === false) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-white mb-2">Access Denied</h1>
          <p className="text-slate-400 text-sm">You do not have admin privileges to view this dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] text-slate-50">
      {/* Top bar */}
      <header className="sticky top-0 z-20 bg-[#020617]/90 backdrop-blur-md border-b border-white/[0.06] px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4 flex-wrap">
          <div>
            <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-0.5">Skillyug Admin</p>
            <h1 className="text-lg font-black text-white">Comment Moderation</h1>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            {/* Slug filter */}
            <input
              type="text"
              placeholder="Filter by blog slug…"
              value={filterSlug}
              onChange={(e) => setFilterSlug(e.target.value)}
              className="h-9 px-3 rounded-lg bg-white/[0.04] border border-white/10 text-sm text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50 w-48"
            />
            {/* Search */}
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search content…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 pl-8 pr-3 rounded-lg bg-white/[0.04] border border-white/10 text-sm text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50 w-40"
              />
            </div>
            {/* Count badge */}
            <span className="text-xs font-mono text-slate-500 bg-white/[0.04] px-2.5 py-1 rounded-lg border border-white/[0.06]">
              {visibleComments.length} comment{visibleComments.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Error */}
        {error && (
          <div className="mb-6 rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-300 flex items-center gap-2">
            <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        )}

        {/* Loading skeleton */}
        {isLoading && (
          <div className="space-y-3 animate-pulse">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 flex gap-3">
                <div className="w-10 h-10 rounded-full bg-white/[0.06] flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-white/[0.06] rounded w-40" />
                  <div className="h-3 bg-white/[0.04] rounded w-full" />
                  <div className="h-3 bg-white/[0.04] rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && visibleComments.length === 0 && (
          <div className="flex flex-col items-center gap-3 py-20 text-center">
            <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center">
              <svg className="w-8 h-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-slate-400 font-medium">All clear!</p>
            <p className="text-slate-600 text-sm">No comments match your current filter.</p>
          </div>
        )}

        {/* Comment rows */}
        {!isLoading && (
          <div className="space-y-3">
            {visibleComments.map((comment) => (
              <AdminCommentRow
                key={comment.id}
                comment={comment}
                isDeleting={deletingIds.has(comment.id)}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}

        {/* Load more */}
        {hasMore && !isLoading && (
          <div className="mt-8 flex justify-center">
            <button
              onClick={loadMore}
              disabled={isLoadingMore}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-semibold text-slate-300 hover:text-white border border-white/10 hover:border-white/20 bg-white/[0.03] hover:bg-white/[0.06] transition-all disabled:opacity-40"
            >
              {isLoadingMore ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Loading…
                </>
              ) : (
                "Load more"
              )}
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

// ── Individual admin comment row ──────────────────────────────────────────────
function AdminCommentRow({
  comment,
  isDeleting,
  onDelete,
}: {
  comment: CommentRow;
  isDeleting: boolean;
  onDelete: (id: string) => void;
}) {
  return (
    <article
      className={`group rounded-xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.035] hover:border-white/10 p-4 flex gap-3 transition-all ${
        isDeleting ? "opacity-40 pointer-events-none" : ""
      }`}
    >
      {/* Avatar */}
      <div className="flex-shrink-0 w-10 h-10 rounded-full overflow-hidden ring-1 ring-white/10">
        {comment.user_avatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={comment.user_avatar} alt="" className="w-full h-full object-cover" loading="lazy" />
        ) : (
          <Avatar
            size={40}
            name={comment.user_id}
            variant="marble"
            colors={["#3b82f6", "#8b5cf6", "#06b6d4", "#1e3a5f", "#0f172a"]}
          />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 mb-1.5">
          <span className="text-sm font-semibold text-slate-200">{comment.user_name}</span>
          <span className="text-[10px] font-mono text-slate-600">
            {timeAgo(comment.created_at)}
          </span>
          <span className="text-[10px] text-slate-700 font-mono">
            /{comment.blog_slug}
          </span>
          <span className="text-[10px] font-mono text-slate-700 truncate max-w-[120px]">
            uid:{comment.user_id.slice(0, 8)}…
          </span>
        </div>
        <p className="text-sm text-slate-400 leading-relaxed break-words">{comment.content}</p>
      </div>

      {/* Delete button */}
      <div className="flex-shrink-0 flex items-start pt-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => onDelete(comment.id)}
          disabled={isDeleting}
          title="Delete comment"
          aria-label={`Delete comment by ${comment.user_name}`}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-600 hover:text-red-400 hover:bg-red-500/10 transition-all"
        >
          {isDeleting ? (
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          )}
        </button>
      </div>
    </article>
  );
}

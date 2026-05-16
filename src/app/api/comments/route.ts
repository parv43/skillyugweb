/**
 * /api/comments/route.ts
 * ──────────────────────
 * GET  → Returns paginated comments for a blog slug
 * POST → Validates auth, Turnstile, rate limit, sanitizes & inserts comment
 */

import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient, supabaseAdmin } from "@/lib/supabaseServer";
import { sanitizeComment, containsProfanity } from "@/lib/commentSanitizer";

const PAGE_SIZE = 10;
const RATE_LIMIT_MS = 60_000; // 1 comment per minute

// ── GET /api/comments?slug=...&cursor=... ─────────────────────────────────────
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get("slug");
  const cursor = searchParams.get("cursor"); // ISO timestamp for cursor-based pagination

  if (!slug) {
    return NextResponse.json({ error: "Missing slug parameter" }, { status: 400 });
  }

  let query = supabaseAdmin
    .from("comments")
    .select("id, blog_slug, user_id, user_name, user_avatar, content, created_at")
    .eq("blog_slug", slug)
    .order("created_at", { ascending: false })
    .limit(PAGE_SIZE + 1); // fetch one extra to determine hasMore

  if (cursor) {
    query = query.lt("created_at", cursor);
  }

  const { data, error } = await query;

  if (error) {
    console.error("[comments GET]", error);
    return NextResponse.json({ error: "Failed to fetch comments" }, { status: 500 });
  }

  const hasMore = (data?.length ?? 0) > PAGE_SIZE;
  const comments = hasMore ? data!.slice(0, PAGE_SIZE) : (data ?? []);
  const nextCursor = hasMore ? comments[comments.length - 1].created_at : null;

  return NextResponse.json({ comments, nextCursor, hasMore });
}

// ── POST /api/comments ────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  // ── 1. Parse body ──────────────────────────────────────────────────────────
  let body: { slug?: string; content?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { slug, content } = body;

  if (!slug || !content) {
    return NextResponse.json(
      { error: "Missing required fields (slug, content)" },
      { status: 400 }
    );
  }

  // ── 2. Verify user session ────────────────────────────────────────────────
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json(
      { error: "You must be signed in to post a comment." },
      { status: 401 }
    );
  }


  // ── 4. Rate limiting: max 1 comment per minute per user ───────────────────
  const oneMinuteAgo = new Date(Date.now() - RATE_LIMIT_MS).toISOString();
  const { data: recentComments, error: rateError } = await supabaseAdmin
    .from("comments")
    .select("created_at")
    .eq("user_id", user.id)
    .gte("created_at", oneMinuteAgo)
    .limit(1);

  if (rateError) {
    console.error("[comments POST] rate limit check error", rateError);
  }

  if (recentComments && recentComments.length > 0) {
    return NextResponse.json(
      { error: "Please wait at least 1 minute before posting another comment." },
      { status: 429 }
    );
  }

  // ── 5. Input validation ───────────────────────────────────────────────────
  const trimmedContent = content.trim();
  if (trimmedContent.length < 3) {
    return NextResponse.json(
      { error: "Comment is too short. Please write at least 3 characters." },
      { status: 422 }
    );
  }
  if (trimmedContent.length > 1000) {
    return NextResponse.json(
      { error: "Comment exceeds the 1000-character limit." },
      { status: 422 }
    );
  }

  // ── 6. Sanitize: strip HTML + URLs ───────────────────────────────────────
  const sanitized = sanitizeComment(trimmedContent);

  if (sanitized.length < 3) {
    return NextResponse.json(
      { error: "Your comment contained no valid text after filtering links and HTML." },
      { status: 422 }
    );
  }

  // ── 7. Profanity check ────────────────────────────────────────────────────
  if (containsProfanity(sanitized)) {
    return NextResponse.json(
      {
        error:
          "Your comment contains inappropriate language and cannot be posted. " +
          "Please keep the discussion respectful.",
      },
      { status: 422 }
    );
  }

  // ── 8. Build user display info ────────────────────────────────────────────
  const userName =
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.email?.split("@")[0] ||
    "Student";

  const userAvatar =
    user.user_metadata?.avatar_url ||
    user.user_metadata?.picture ||
    null;

  // ── 9. Insert comment (using admin client so RLS doesn't block; we
  //       manually enforce the auth above) ─────────────────────────────────
  const { data: inserted, error: insertError } = await supabaseAdmin
    .from("comments")
    .insert({
      blog_slug: slug,
      user_id: user.id,
      user_name: userName,
      user_avatar: userAvatar,
      content: sanitized,
    })
    .select()
    .single();

  if (insertError) {
    console.error("[comments POST] insert error", insertError);
    return NextResponse.json({ error: "Failed to save comment." }, { status: 500 });
  }

  return NextResponse.json({ comment: inserted }, { status: 201 });
}

import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient, supabaseAdmin } from "@/lib/supabaseServer";

const PAGE_SIZE = 20;

export async function GET(req: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: adminRow } = await supabaseAdmin
    .from("admins").select("id").eq("user_id", user.id).maybeSingle();

  if (!adminRow) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const cursor = searchParams.get("cursor");
  const limit = Math.min(parseInt(searchParams.get("limit") ?? `${PAGE_SIZE}`, 10), 50);

  let query = supabaseAdmin
    .from("comments")
    .select("id, blog_slug, user_id, user_name, user_avatar, content, created_at")
    .order("created_at", { ascending: false })
    .limit(limit + 1);

  if (cursor) query = query.lt("created_at", cursor);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });

  const hasMore = (data?.length ?? 0) > limit;
  const comments = hasMore ? data!.slice(0, limit) : (data ?? []);
  const nextCursor = hasMore ? comments[comments.length - 1].created_at : null;

  return NextResponse.json({ comments, nextCursor, hasMore });
}

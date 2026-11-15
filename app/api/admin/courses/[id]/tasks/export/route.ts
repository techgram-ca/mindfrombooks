import { NextResponse } from "next/server";
import { z } from "zod";
import { handle, jsonError } from "@/lib/api";
import { requireAdminApi } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

/** Download a course's tasks as JSON (the same shape the bulk import accepts). */
export const GET = handle(async (_request: Request, ctx: { params: Promise<{ id: string }> }) => {
  await requireAdminApi();
  const id = z
    .string()
    .uuid()
    .safeParse((await ctx.params).id);
  if (!id.success) return jsonError(400, "Unknown course.");
  const db = createAdminClient();
  const { data: course } = await db.from("courses").select("slug").eq("id", id.data).maybeSingle();
  if (!course) return jsonError(404, "Unknown course.");
  const { data: tasks } = await db
    .from("tasks")
    .select(
      "day_number, title, book_insight, book_reference, instructions, response_prompt, min_response_chars, is_sample",
    )
    .eq("course_id", id.data)
    .order("day_number");
  return new NextResponse(JSON.stringify(tasks ?? [], null, 2), {
    headers: {
      "content-type": "application/json",
      "content-disposition": `attachment; filename="${course.slug as string}-tasks.json"`,
    },
  });
});

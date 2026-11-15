import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { handle, jsonError } from "@/lib/api";
import { requireAdminApi } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

const TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};
const MAX_BYTES = 4 * 1024 * 1024;

/** Admin-only image upload (course covers, "inspired by" images) to Supabase Storage. */
export const POST = handle(async (request: Request) => {
  await requireAdminApi();
  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) return jsonError(400, "Choose an image to upload.");
  const ext = TYPES[file.type];
  if (!ext) return jsonError(400, "Use a JPG, PNG or WebP image.");
  if (file.size > MAX_BYTES) return jsonError(400, "Images must be under 4 MB.");

  const db = createAdminClient();
  const path = `${new Date().getFullYear()}/${randomUUID()}.${ext}`;
  const { error } = await db.storage
    .from("course-images")
    .upload(path, Buffer.from(await file.arrayBuffer()), {
      contentType: file.type,
      cacheControl: "31536000",
    });
  if (error) return jsonError(500, `Upload failed: ${error.message}`);
  const { data } = db.storage.from("course-images").getPublicUrl(path);
  return NextResponse.json({ url: data.publicUrl });
});

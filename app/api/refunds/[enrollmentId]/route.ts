import { NextResponse } from "next/server";
import { z } from "zod";
import { handle, jsonError } from "@/lib/api";
import { requireUserApi } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";
import { processRefund } from "@/lib/refund-service";

export const POST = handle(
  async (_request: Request, ctx: { params: Promise<{ enrollmentId: string }> }) => {
    const profile = await requireUserApi();
    const id = z
      .string()
      .uuid()
      .safeParse((await ctx.params).enrollmentId);
    if (!id.success) return jsonError(400, "Invalid enrollment.");
    if (!rateLimit(`refund:${profile.id}`, 5, 60_000)) {
      return jsonError(429, "Too many tries. Wait a minute and try again.");
    }
    const result = await processRefund({
      enrollmentId: id.data,
      type: "guarantee",
      actor: profile,
    });
    return NextResponse.json({ refunded: true, ...result });
  },
);

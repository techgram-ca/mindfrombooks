import { NextResponse } from "next/server";
import { isAuthorizedCron, runDailyDigest } from "@/lib/cron";

export const maxDuration = 300;

/** Hourly (see vercel.json). Sends each learner at most one daily email, at their reminder hour. */
export async function GET(request: Request) {
  if (!isAuthorizedCron(request))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    return NextResponse.json({ ok: true, ...(await runDailyDigest("missed_yesterday")) });
  } catch (err) {
    console.error("[cron missed-yesterday]", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

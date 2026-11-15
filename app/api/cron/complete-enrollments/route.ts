import { NextResponse } from "next/server";
import { isAuthorizedCron, runCompletions } from "@/lib/cron";

export const maxDuration = 300;

/**
 * Hourly rather than daily, so a course is closed (and the certificate and
 * completion email sent) soon after midnight in each learner's own timezone.
 */
export async function GET(request: Request) {
  if (!isAuthorizedCron(request))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    return NextResponse.json({ ok: true, ...(await runCompletions()) });
  } catch (err) {
    console.error("[cron complete-enrollments]", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

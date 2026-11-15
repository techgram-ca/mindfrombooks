import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types";

export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

/** The signed-in user's profile, or null. Verified against Supabase Auth. */
export const getSessionProfile = cache(async (): Promise<Profile | null> => {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return null;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
  return (data as Profile | null) ?? null;
});

/** For pages: redirect to login when signed out. */
export async function requireUser(next = "/dashboard"): Promise<Profile> {
  const profile = await getSessionProfile();
  if (!profile) redirect(`/login?next=${encodeURIComponent(next)}`);
  return profile;
}

/** For admin pages and server actions. */
export async function requireAdmin(): Promise<Profile> {
  const profile = await getSessionProfile();
  if (!profile) redirect("/login?next=/admin");
  if (profile.role !== "admin") redirect("/dashboard");
  return profile;
}

/** For route handlers: throw instead of redirecting. */
export async function requireUserApi(): Promise<Profile> {
  const profile = await getSessionProfile();
  if (!profile) throw new HttpError(401, "Please log in to continue.");
  return profile;
}

export async function requireAdminApi(): Promise<Profile> {
  const profile = await requireUserApi();
  if (profile.role !== "admin") throw new HttpError(403, "Admins only.");
  return profile;
}

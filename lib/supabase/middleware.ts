import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { ATTR_COOKIE, ATTR_MAX_AGE, attributionFromUrl } from "@/lib/attribution";
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from "@/lib/supabase/env";

/**
 * Runs on every page request (see proxy.ts):
 *  1. refreshes the Supabase session cookie
 *  2. gates /dashboard (signed in) and /admin (admin role)
 *  3. sets the first-touch attribution cookie
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  const { pathname } = request.nextUrl;
  const needsUser = pathname.startsWith("/dashboard") || pathname.startsWith("/admin");

  const url = SUPABASE_URL;
  const anon = SUPABASE_PUBLISHABLE_KEY;

  if (url && anon) {
    const supabase = createServerClient(url, anon, {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (toSet) => {
          toSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          toSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    });

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (needsUser && !user) {
      const login = request.nextUrl.clone();
      login.pathname = "/login";
      login.search = `?next=${encodeURIComponent(pathname + request.nextUrl.search)}`;
      return NextResponse.redirect(login);
    }

    if (user && pathname.startsWith("/admin")) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();
      if (profile?.role !== "admin") {
        const home = request.nextUrl.clone();
        home.pathname = "/dashboard";
        home.search = "";
        return NextResponse.redirect(home);
      }
    }
  } else if (needsUser) {
    const login = request.nextUrl.clone();
    login.pathname = "/login";
    login.search = "";
    return NextResponse.redirect(login);
  }

  if (!request.cookies.get(ATTR_COOKIE)) {
    const attr = attributionFromUrl(request.nextUrl, request.headers.get("referer"));
    if (attr) {
      response.cookies.set(ATTR_COOKIE, JSON.stringify(attr), {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: ATTR_MAX_AGE,
        path: "/",
      });
    }
  }

  return response;
}

/**
 * fetch for server-side Supabase clients.
 *
 * Next.js memoizes identical GET fetches during one render, so a read that
 * follows a write in the same page render (for example "issue the certificate,
 * then show it") would otherwise get the earlier, stale answer. Passing a fresh
 * AbortController signal opts each request out of memoization only. Caching is
 * left alone, so public pages can still be prerendered and revalidated.
 */
export const freshFetch: typeof fetch = (input, init) =>
  fetch(input, {
    ...init,
    signal: init?.signal ?? new AbortController().signal,
  });

import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

describe("dev sample testimonials", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("are never shown on the production deployment", async () => {
    vi.stubEnv("VERCEL_ENV", "production");
    const { showDevSamples } = await import("@/lib/queries/catalog");
    expect(showDevSamples()).toBe(false);
  });

  it("are shown on preview (staging) and locally", async () => {
    const { showDevSamples } = await import("@/lib/queries/catalog");
    vi.stubEnv("VERCEL_ENV", "preview");
    expect(showDevSamples()).toBe(true);
    vi.stubEnv("VERCEL_ENV", "");
    expect(showDevSamples()).toBe(true);
  });
});

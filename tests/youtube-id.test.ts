import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

describe("parseYouTubeId", () => {
  it("accepts every common YouTube link and a bare id", async () => {
    const { parseYouTubeId } = await import("@/lib/queries/workshop");
    const id = "dQw4w9WgXcQ";
    for (const v of [
      id,
      `https://www.youtube.com/watch?v=${id}`,
      `https://youtube.com/watch?v=${id}&t=30s`,
      `https://youtu.be/${id}`,
      `https://youtu.be/${id}?si=abc`,
      `https://www.youtube.com/embed/${id}`,
      `https://www.youtube-nocookie.com/embed/${id}?rel=0`,
      `https://youtube.com/shorts/${id}`,
      `https://m.youtube.com/watch?v=${id}`,
    ]) {
      expect(parseYouTubeId(v), v).toBe(id);
    }
  });
  it("rejects anything else", async () => {
    const { parseYouTubeId } = await import("@/lib/queries/workshop");
    for (const v of [
      "",
      "hello",
      "https://vimeo.com/123",
      "https://example.com/watch?v=dQw4w9WgXcQ",
      "dQw4w9WgXc",
    ]) {
      expect(parseYouTubeId(v), v).toBeNull();
    }
  });
});

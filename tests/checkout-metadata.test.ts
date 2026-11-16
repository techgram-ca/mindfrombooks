import { describe, expect, it } from "vitest";
import { checkoutSchema, sessionMetadataSchema } from "@/lib/validators/checkout";

const COURSE = "3dd35700-943e-5264-ad06-a44982ca9cc3";

describe("checkout session metadata", () => {
  it("accepts a logged-in purchase", () => {
    const m = sessionMetadataSchema.parse({
      userId: "6c303f92-cc27-4fc7-90e4-d9f7ddc77522",
      courseId: COURSE,
      priceCents: "999",
    });
    expect(m.priceCents).toBe(999);
  });

  it("accepts a guest purchase with no user id", () => {
    const m = sessionMetadataSchema.parse({
      userId: "",
      courseId: COURSE,
      bundleId: "",
      couponId: "",
      timezone: "Asia/Kolkata",
      attrSource: "instagram",
      attrMedium: "",
      attrLanding: "/courses/fix-your-money",
      attrReferrer: "",
      utmCampaign: "reel-12",
      priceCents: "999",
    });
    expect(m.userId).toBe("");
    expect(m.timezone).toBe("Asia/Kolkata");
  });

  it("rejects a malformed user id", () => {
    expect(sessionMetadataSchema.safeParse({ userId: "not-a-uuid", priceCents: "1" }).success).toBe(
      false,
    );
  });
});

describe("checkout request", () => {
  it("takes the visitor's timezone", () => {
    expect(checkoutSchema.parse({ courseId: COURSE, timezone: "America/Toronto" }).timezone).toBe(
      "America/Toronto",
    );
  });
  it("still needs exactly one product", () => {
    expect(checkoutSchema.safeParse({ timezone: "UTC" }).success).toBe(false);
  });
});

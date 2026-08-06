import { describe, expect, it } from "vitest";
import { generateSeedMeetings } from "../src/core/seed.js";

describe("seed meetings generator", () => {
  it("generates array of valid seed meetings", () => {
    const seeds = generateSeedMeetings("2026-08-06T00:00:00.000Z");
    expect(seeds.length).toBeGreaterThan(5);
    expect(seeds[0].id).toBe("seed-1");
  });
});

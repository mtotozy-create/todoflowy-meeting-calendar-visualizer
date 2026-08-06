import { describe, expect, it } from "vitest";
import {
  DEFAULT_TAGS,
  getNextAvailableColor,
  getTagColor,
  TAG_COLOR_PALETTE,
} from "../src/core/tags.js";

describe("visual tags core", () => {
  it("returns default tag color if tag ID found, fallback to palette[0] otherwise", () => {
    expect(getTagColor("tag-standup", DEFAULT_TAGS)).toBe(DEFAULT_TAGS[0].color);
    expect(getTagColor("non-existent-tag", DEFAULT_TAGS)).toBe(TAG_COLOR_PALETTE[0]);
  });

  it("finds next available color from palette that is not used", () => {
    const existing = [
      { id: "1", name: "A", color: TAG_COLOR_PALETTE[0] },
      { id: "2", name: "B", color: TAG_COLOR_PALETTE[1] },
    ];
    const next = getNextAvailableColor(existing);
    expect(next).toBe(TAG_COLOR_PALETTE[2]);
  });
});

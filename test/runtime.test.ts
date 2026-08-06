import { describe, expect, it, vi } from "vitest";

describe("runtime entry module", () => {
  it("exports activate and deactivate lifecycle hooks", async () => {
    const runtime = await import("../src/runtime.js");
    expect(typeof runtime.activate).toBe("function");
    expect(typeof runtime.deactivate).toBe("function");
  });
});

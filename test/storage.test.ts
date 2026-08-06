import { describe, expect, it } from "vitest";
import {
  DEFAULT_SETTINGS,
  loadCalendarStorage,
  saveCalendarStorage,
} from "../src/storage.js";
import { MemoryStorage } from "./helpers.js";

describe("storage gateway and serialization", () => {
  it("initializes default storage if empty or invalid", async () => {
    const memory = new MemoryStorage();
    const data = await loadCalendarStorage(memory, "2026-08-06T00:00:00.000Z");

    expect(data.version).toBe(1);
    expect(data.filter.viewMode).toBe("week");
    expect(data.filter.selectedDate).toBe("2026-08-06");
    expect(data.settings).toEqual(DEFAULT_SETTINGS);
  });

  it("saves and loads updated storage correctly", async () => {
    const memory = new MemoryStorage();
    const initial = await loadCalendarStorage(memory);

    const updated = {
      ...initial,
      filter: { ...initial.filter, viewMode: "month" as const },
      lastUpdated: "2026-08-06T12:00:00.000Z",
    };

    await saveCalendarStorage(memory, updated);
    const reloaded = await loadCalendarStorage(memory);
    expect(reloaded.filter.viewMode).toBe("month");
    expect(reloaded.lastUpdated).toBe("2026-08-06T12:00:00.000Z");
  });
});

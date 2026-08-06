import { describe, expect, it } from "vitest";
import {
  computeDailyHeatmap,
  computeHeatmapLevel,
  detectConflicts,
  extractAllTeams,
  filterMeetings,
  getMonthGrid,
  getWeekRange,
  mapDisplayStatus,
} from "../src/core/calendar.js";
import type { CalendarFilter } from "../src/core/types.js";
import { createTestMeeting } from "./helpers.js";

describe("calendar core algorithms", () => {
  it("maps 9 SDK PluginMeetingStatus to 3 display statuses", () => {
    expect(mapDisplayStatus("uploading")).toBe("draft");
    expect(mapDisplayStatus("validating")).toBe("draft");
    expect(mapDisplayStatus("queued")).toBe("draft");
    expect(mapDisplayStatus("transcribing")).toBe("draft");
    expect(mapDisplayStatus("summarizing")).toBe("draft");
    expect(mapDisplayStatus("ready")).toBe("confirmed");
    expect(mapDisplayStatus("retryable_failed")).toBe("archived");
    expect(mapDisplayStatus("failed")).toBe("archived");
    expect(mapDisplayStatus("cancelled")).toBe("archived");
  });

  it("detects overlapping conflicts between ready meetings", () => {
    const baseTime = "2026-08-06T10:00:00.000Z";
    const m1 = createTestMeeting({
      id: "m1",
      createdAt: baseTime,
      durationSeconds: 3600, // 10:00 - 11:00
      status: "ready",
    });
    const m2 = createTestMeeting({
      id: "m2",
      createdAt: "2026-08-06T10:30:00.000Z",
      durationSeconds: 3600, // 10:30 - 11:30 (conflict with m1)
      status: "ready",
    });
    const m3 = createTestMeeting({
      id: "m3",
      createdAt: "2026-08-06T14:00:00.000Z",
      durationSeconds: 1800, // 14:00 - 14:30 (no conflict)
      status: "ready",
    });

    const conflicts = detectConflicts([m1, m2, m3]);
    expect(conflicts.has("m1")).toBe(true);
    expect(conflicts.has("m2")).toBe(true);
    expect(conflicts.has("m3")).toBe(false);
  });

  it("ignores non-ready or zero-duration meetings during conflict detection", () => {
    const m1 = createTestMeeting({
      id: "m1",
      createdAt: "2026-08-06T10:00:00.000Z",
      durationSeconds: 3600,
      status: "queued",
    });
    const m2 = createTestMeeting({
      id: "m2",
      createdAt: "2026-08-06T10:30:00.000Z",
      durationSeconds: 3600,
      status: "ready",
    });
    const conflicts = detectConflicts([m1, m2]);
    expect(conflicts.size).toBe(0);
  });

  it("computes heatmap levels correctly based on thresholds", () => {
    const thresholds: [number, number, number] = [60, 240, 360];
    expect(computeHeatmapLevel(0, thresholds)).toBe(0);
    expect(computeHeatmapLevel(59, thresholds)).toBe(0);
    expect(computeHeatmapLevel(60, thresholds)).toBe(1);
    expect(computeHeatmapLevel(239, thresholds)).toBe(1);
    expect(computeHeatmapLevel(240, thresholds)).toBe(2);
    expect(computeHeatmapLevel(359, thresholds)).toBe(2);
    expect(computeHeatmapLevel(360, thresholds)).toBe(3);
    expect(computeHeatmapLevel(500, thresholds)).toBe(3);
  });

  it("computes daily heatmap aggregated by date", () => {
    const m1 = createTestMeeting({
      id: "m1",
      createdAt: "2026-08-06T09:00:00.000Z",
      durationSeconds: 3600, // 60 mins
    });
    const m2 = createTestMeeting({
      id: "m2",
      createdAt: "2026-08-06T14:00:00.000Z",
      durationSeconds: 7200, // 120 mins (total 180 mins)
    });
    const map = computeDailyHeatmap([m1, m2], [60, 240, 360]);
    const dayData = map.get("2026-08-06");
    expect(dayData).toBeDefined();
    expect(dayData?.totalMinutes).toBe(180);
    expect(dayData?.meetingCount).toBe(2);
    expect(dayData?.level).toBe(1);
  });

  it("filters meetings multi-dimensionally", () => {
    const m1 = createTestMeeting({
      id: "m1",
      scope: "personal",
      status: "ready",
      team: null,
      tagIds: ["t1"],
    });
    const m2 = createTestMeeting({
      id: "m2",
      scope: "team",
      status: "ready",
      team: { id: "t-fe", name: "Frontend" },
      tagIds: ["t2"],
    });

    const baseFilter: CalendarFilter = {
      viewMode: "week",
      selectedDate: "2026-08-06",
      scopeFilter: "all",
      statusFilter: "all",
      teamFilter: "all",
      selectedTagIds: [],
    };

    expect(filterMeetings([m1, m2], baseFilter)).toHaveLength(2);
    expect(
      filterMeetings([m1, m2], { ...baseFilter, scopeFilter: "personal" }),
    ).toEqual([m1]);
    expect(
      filterMeetings([m1, m2], { ...baseFilter, teamFilter: "Frontend" }),
    ).toEqual([m2]);
    expect(
      filterMeetings([m1, m2], { ...baseFilter, selectedTagIds: ["t1"] }),
    ).toEqual([m1]);
  });

  it("extracts sorted unique team names", () => {
    const m1 = createTestMeeting({
      id: "m1",
      team: { id: "t1", name: "Frontend" },
    });
    const m2 = createTestMeeting({
      id: "m2",
      team: { id: "t2", name: "Backend" },
    });
    const m3 = createTestMeeting({
      id: "m3",
      team: { id: "t1", name: "Frontend" },
    });
    const m4 = createTestMeeting({ id: "m4", team: null });

    const teams = extractAllTeams([m1, m2, m3, m4]);
    expect(teams).toEqual(["Backend", "Frontend"]);
  });

  it("computes week range and month grid date arrays correctly", () => {
    const week = getWeekRange("2026-08-06", 1); // 2026-08-06 is Thursday
    expect(week).toHaveLength(7);
    expect(week[0]).toBe("2026-08-03"); // Monday

    const grid = getMonthGrid(2026, 7, 1); // August 2026
    expect(grid).toHaveLength(42);
    expect(grid.includes("2026-08-01")).toBe(true);
  });
});

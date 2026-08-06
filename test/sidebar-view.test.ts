import { describe, expect, it, vi } from "vitest";
import { mountSidebarView } from "../src/sidebar-view.js";
import { MemoryStorage, MockMeetingGateway, createTestMeeting } from "./helpers.js";

describe("sidebar view component mounting and interaction", () => {
  it("mounts DOM elements, switches views (week/month/gantt), handles filters and unmounts", async () => {
    const root = document.createElement("div");
    document.body.appendChild(root);

    const m1 = createTestMeeting({
      id: "m1",
      title: "Test Standup",
      scope: "personal",
      status: "ready",
      createdAt: "2026-08-06T09:00:00.000Z",
    });
    const m2 = createTestMeeting({
      id: "m2",
      title: "Team Review",
      scope: "team",
      team: { id: "t1", name: "Engineering" },
      status: "ready",
      createdAt: "2026-08-06T10:00:00.000Z",
    });

    const gateway = new MockMeetingGateway([m1, m2]);
    const storage = new MemoryStorage();
    const saveStorageSpy = vi.fn();

    const cleanup = await mountSidebarView(root, {
      meetingGateway: gateway,
      getTheme: async () => "dark",
      getLocale: async () => "en-US",
      now: () => new Date("2026-08-06T10:00:00.000Z"),
      on: () => () => {},
      storage,
      loadStorage: async (nowIso) => ({
        version: 1,
        filter: {
          viewMode: "week",
          selectedDate: "2026-08-06",
          scopeFilter: "all",
          statusFilter: "all",
          teamFilter: "all",
          selectedTagIds: [],
        },
        customTags: [],
        settings: {
          version: 1,
          weekStartDay: 1,
          workHourStart: 8,
          workHourEnd: 20,
          heatmapThresholds: [60, 240, 360],
        },
        lastUpdated: nowIso ?? "2026-08-06T10:00:00.000Z",
      }),
      saveStorage: saveStorageSpy,
      toast: async () => {},
    });

    // 验证初始 Week View 渲染
    expect(root.querySelector(".mcv-app")).not.toBeNull();
    expect(root.querySelector(".mcv-header-title")?.textContent).toBe("Meeting Calendar");
    expect(root.textContent).toContain("Test Standup");

    // 点击 Month View 按钮
    const tabBtns = root.querySelectorAll(".mcv-tab-btn");
    const monthTab = Array.from(tabBtns).find((b) => b.textContent === "Month View" || b.textContent === "月视图");
    expect(monthTab).toBeDefined();
    (monthTab as HTMLButtonElement).click();
    expect(root.querySelector(".mcv-month-grid")).not.toBeNull();

    // 点击 Gantt View 按钮
    const ganttTab = Array.from(tabBtns).find((b) => b.textContent === "Gantt Chart" || b.textContent === "甘特图");
    expect(ganttTab).toBeDefined();
    (ganttTab as HTMLButtonElement).click();
    expect(root.querySelector(".mcv-gantt-container")).not.toBeNull();

    // 测试下拉筛选框 change 事件
    const selects = root.querySelectorAll(".mcv-select");
    expect(selects.length).toBeGreaterThanOrEqual(3);

    // 触发 scope select 切换
    const scopeSelect = selects[0] as HTMLSelectElement;
    scopeSelect.value = "personal";
    scopeSelect.dispatchEvent(new Event("change"));

    // 清理
    cleanup();
    expect(root.children.length).toBe(0);
  });
});

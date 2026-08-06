import { defineView, plugin } from "@todoflowy/plugin-sdk";
import type { PluginMeeting } from "@todoflowy/plugin-contracts";

import {
  computeDailyHeatmap,
  detectConflicts,
  extractAllTeams,
  filterMeetings,
  formatLocalDate,
  getMonthGrid,
  getWeekRange,
  mapDisplayStatus,
} from "./core/calendar.js";
import { DEFAULT_TAGS, getTagColor } from "./core/tags.js";
import type { CalendarFilter, CalendarStorageData, ViewMode, VisualTag } from "./core/types.js";
import { button, element } from "./dom.js";
import { getTranslation, normalizeLocale } from "./i18n.js";
import { createSdkMeetingGateway, fetchAllMeetings, type MeetingGateway } from "./meetings.js";
import { SIDEBAR_VIEW_CSS } from "./sidebar-view.css.js";
import { loadCalendarStorage, saveCalendarStorage, type StorageGateway } from "./storage.js";

type EventType = "theme.changed" | "locale.changed";

export interface SidebarViewDependencies {
  readonly meetingGateway: MeetingGateway;
  readonly getTheme: () => Promise<"dark" | "light">;
  readonly getLocale: () => Promise<string>;
  readonly now: () => Date;
  readonly on: (type: EventType, listener: (payload: unknown) => void) => () => void;
  readonly storage: StorageGateway;
  readonly loadStorage: (nowIso?: string) => Promise<CalendarStorageData>;
  readonly saveStorage: (data: CalendarStorageData) => Promise<void>;
  readonly toast: (message: string) => Promise<void>;
}

export async function mountSidebarView(
  root: HTMLElement,
  deps: SidebarViewDependencies,
): Promise<() => void> {
  let active = true;

  // 1. 读取语言与偏好
  let currentLocale = await deps.getLocale();
  let t = getTranslation(currentLocale);

  let storageData = await deps.loadStorage();

  // 2. 拉取个人与团队会议（合并去重）
  let rawMeetings: readonly PluginMeeting[] = [];
  try {
    rawMeetings = await fetchAllMeetings(deps.meetingGateway);
  } catch {
    rawMeetings = [];
  }

  if (!active) return () => {};

  let filter: CalendarFilter = { ...storageData.filter };
  let customTags: readonly VisualTag[] = storageData.customTags;

  // 冲突检测
  let conflicts = detectConflicts(rawMeetings);

  // 创建 DOM 根节点与样式表
  const app = element("div", { className: "mcv-app" });
  const styleEl = element("style", { text: SIDEBAR_VIEW_CSS });
  app.append(styleEl);

  const theme = await deps.getTheme();
  app.dataset.theme = theme;

  // DOM 布局区域
  const header = element("div", { className: "mcv-header" });
  const controls = element("div", { className: "mcv-controls" });
  const content = element("div", { className: "mcv-content" });
  const footer = element("div", { className: "mcv-footer" });

  app.append(header, controls, content, footer);

  // 持久化保存偏好
  const persist = async () => {
    storageData = {
      ...storageData,
      filter: { ...filter },
      lastUpdated: deps.now().toISOString(),
    };
    await deps.saveStorage(storageData);
  };

  // 渲染 Header
  const renderHeader = () => {
    header.replaceChildren();
    const leftGroup = element("div", { className: "mcv-header-left" });
    const title = element("h2", {
      className: "mcv-header-title",
      text: t.appTitle,
    });
    const subtitle = element("span", {
      className: "mcv-header-subtitle",
      text: t.appSubtitle,
    });
    leftGroup.append(title, subtitle);

    const rightGroup = element("div", { className: "mcv-header-right" });
    const refreshBtn = button("↻", async () => {
      try {
        rawMeetings = await fetchAllMeetings(deps.meetingGateway);
        conflicts = detectConflicts(rawMeetings);
        render();
        void deps.toast(t.refreshSuccess);
      } catch {
        void deps.toast(t.refreshError);
      }
    }, "mcv-icon-btn");
    refreshBtn.title = t.refreshTooltip;
    rightGroup.append(refreshBtn);

    header.append(leftGroup, rightGroup);
  };

  // 渲染 Controls (Tabs, Nav, Filter)
  const renderControls = () => {
    controls.replaceChildren();

    // 1. View Switcher Tabs
    const tabRow = element("div", { className: "mcv-tab-row" });
    const modes: Array<{ id: ViewMode; label: string }> = [
      { id: "week", label: t.viewWeek },
      { id: "month", label: t.viewMonth },
      { id: "gantt", label: t.viewGantt },
    ];
    for (const m of modes) {
      const tabBtn = button(m.label, () => {
        filter = { ...filter, viewMode: m.id };
        void persist();
        render();
      }, `mcv-tab-btn ${filter.viewMode === m.id ? "active" : ""}`);
      tabRow.append(tabBtn);
    }

    // 2. Date Navigation Row
    const navRow = element("div", { className: "mcv-nav-row" });
    const navLabel = element("span", {
      className: "mcv-nav-label",
      text: formatNavLabel(filter.selectedDate, filter.viewMode, currentLocale),
    });

    const navActions = element("div", { className: "mcv-nav-actions" });
    const prevBtn = button("<", () => {
      filter = {
        ...filter,
        selectedDate: shiftDate(filter.selectedDate, filter.viewMode, -1),
      };
      void persist();
      render();
    }, "mcv-btn-sm");

    const todayBtn = button(t.today, () => {
      filter = {
        ...filter,
        selectedDate: deps.now().toISOString().slice(0, 10),
      };
      void persist();
      render();
    }, "mcv-btn-sm");

    const nextBtn = button(">", () => {
      filter = {
        ...filter,
        selectedDate: shiftDate(filter.selectedDate, filter.viewMode, 1),
      };
      void persist();
      render();
    }, "mcv-btn-sm");

    navActions.append(prevBtn, todayBtn, nextBtn);
    navRow.append(navLabel, navActions);

    // 3. Filters Row (Scope / Status / Team)
    const filterRow = element("div", { className: "mcv-filter-row" });

    // Scope Select
    const scopeSelect = element("select", { className: "mcv-select" });
    const scopeOptions = [
      { value: "all", label: t.scopeAll },
      { value: "personal", label: t.scopePersonal },
      { value: "team", label: t.scopeTeam },
    ];
    for (const opt of scopeOptions) {
      const op = element("option", { text: opt.label });
      op.value = opt.value;
      if (filter.scopeFilter === opt.value) op.selected = true;
      scopeSelect.append(op);
    }
    scopeSelect.addEventListener("change", () => {
      filter = { ...filter, scopeFilter: scopeSelect.value as never };
      void persist();
      render();
    });

    // Status Select
    const statusSelect = element("select", { className: "mcv-select" });
    const statusOptions = [
      { value: "all", label: t.statusAll },
      { value: "confirmed", label: t.statusConfirmed },
      { value: "draft", label: t.statusDraft },
      { value: "archived", label: t.statusArchived },
    ];
    for (const opt of statusOptions) {
      const op = element("option", { text: opt.label });
      op.value = opt.value;
      if (filter.statusFilter === opt.value) op.selected = true;
      statusSelect.append(op);
    }
    statusSelect.addEventListener("change", () => {
      filter = { ...filter, statusFilter: statusSelect.value as never };
      void persist();
      render();
    });

    // Team Select
    const teamSelect = element("select", { className: "mcv-select" });
    const availableTeams = extractAllTeams(rawMeetings);
    const defaultTeamOp = element("option", { text: t.teamAll });
    defaultTeamOp.value = "all";
    teamSelect.append(defaultTeamOp);
    for (const teamName of availableTeams) {
      const op = element("option", { text: teamName });
      op.value = teamName;
      if (filter.teamFilter === teamName) op.selected = true;
      teamSelect.append(op);
    }
    teamSelect.addEventListener("change", () => {
      filter = { ...filter, teamFilter: teamSelect.value };
      void persist();
      render();
    });

    filterRow.append(scopeSelect, statusSelect, teamSelect);
    controls.append(tabRow, navRow, filterRow);
  };

  // 渲染 Content 区域 (Week / Month / Gantt)
  const renderContent = () => {
    content.replaceChildren();
    const filtered = filterMeetings(rawMeetings, filter);

    if (filter.viewMode === "week") {
      renderWeekView(content, filtered, filter, conflicts, deps.now(), t);
    } else if (filter.viewMode === "month") {
      renderMonthView(content, filtered, filter, conflicts, deps.now(), t);
    } else if (filter.viewMode === "gantt") {
      renderGanttView(content, filtered, filter, conflicts, deps.now(), t);
    }
  };

  // 渲染 Footer 区域
  const renderFooter = () => {
    footer.replaceChildren();
    const filtered = filterMeetings(rawMeetings, filter);
    const infoText = element("span", {
      text: t.showingMeetings(
        filtered.length,
        extractAllTeams(rawMeetings).length,
        conflicts.size,
      ),
    });

    const legend = element("div", { className: "mcv-legend" });
    const confirmedDot = element("span", {
      className: "mcv-legend-item",
      text: t.legendConfirmed,
    });
    confirmedDot.style.color = "var(--mcv-sage-signal)";
    const teamDot = element("span", {
      className: "mcv-legend-item",
      text: t.legendTeam,
    });
    teamDot.style.color = "var(--mcv-team-context)";

    const conflictDot = element("span", {
      className: "mcv-legend-item",
      text: t.legendConflict,
    });
    conflictDot.style.color = "var(--mcv-error-ink)";

    legend.append(confirmedDot, teamDot, conflictDot);
    footer.append(infoText, legend);
  };

  const render = () => {
    renderHeader();
    renderControls();
    renderContent();
    renderFooter();
  };

  // 初次渲染
  render();
  root.replaceChildren(app);

  // 主题与语言变更监听
  const unsubscribers = [
    deps.on("theme.changed", (payload) => {
      if (payload && typeof payload === "object" && "theme" in payload) {
        app.dataset.theme = (payload as { theme: string }).theme;
      }
    }),
    deps.on("locale.changed", (payload) => {
      if (payload && typeof payload === "object" && "locale" in payload) {
        currentLocale = (payload as { locale: string }).locale;
        t = getTranslation(currentLocale);
        render();
      }
    }),
  ];

  return () => {
    if (!active) return;
    active = false;
    for (const unsub of unsubscribers) unsub();
    root.replaceChildren();
  };
}

// ─── 视图渲染子函数 (多语言版) ──────────────────────────────────────────

function renderWeekView(
  container: HTMLElement,
  meetings: readonly PluginMeeting[],
  filter: CalendarFilter,
  conflicts: Set<string>,
  now: Date,
  t: ReturnType<typeof getTranslation>,
) {
  const weekDays = getWeekRange(filter.selectedDate, 1);
  const todayStr = formatLocalDate(now);

  const grid = element("div", { className: "mcv-week-grid" });

  // 1. Column Header (Time + 7 Days)
  const headerRow = element("div", { className: "mcv-week-header" });
  headerRow.append(element("div", { className: "mcv-week-col-head", text: t.timeCol }));

  const dayNames = t.dayNames;
  for (let i = 0; i < 7; i++) {
    const dayStr = weekDays[i];
    const isToday = dayStr === todayStr;
    const dayHead = element("div", {
      className: `mcv-week-col-head ${isToday ? "today" : ""}`,
      text: `${dayNames[i]} ${dayStr.slice(5)}`,
    });
    headerRow.append(dayHead);
  }
  grid.append(headerRow);

  // 2. Body Grid (8:00 - 20:00)
  const bodyRow = element("div", { className: "mcv-week-body" });

  const timeCol = element("div");
  for (let h = 8; h <= 20; h++) {
    timeCol.append(
      element("div", {
        className: "mcv-time-slot",
        text: `${h.toString().padStart(2, "0")}:00`,
      }),
    );
  }
  bodyRow.append(timeCol);

  for (let d = 0; d < 7; d++) {
    const dayStr = weekDays[d];
    const dayCol = element("div", { className: "mcv-day-col" });

    for (let h = 8; h <= 20; h++) {
      dayCol.append(element("div", { className: "mcv-grid-cell" }));
    }

    const dayMeetings = meetings.filter((m) => m.createdAt.startsWith(dayStr));
    for (const m of dayMeetings) {
      const card = createMeetingCard(m, conflicts.has(m.id));
      dayCol.append(card);
    }

    bodyRow.append(dayCol);
  }

  grid.append(bodyRow);
  container.append(grid);
}

function renderMonthView(
  container: HTMLElement,
  meetings: readonly PluginMeeting[],
  filter: CalendarFilter,
  conflicts: Set<string>,
  now: Date,
  t: ReturnType<typeof getTranslation>,
) {
  const [y, m] = filter.selectedDate.split("-").map(Number);
  const monthGrid = getMonthGrid(y, m - 1, 1);
  const heatmap = computeDailyHeatmap(meetings, [60, 240, 360]);
  const todayStr = formatLocalDate(now);

  const containerEl = element("div", { className: "mcv-month-container" });
  const grid = element("div", { className: "mcv-month-grid" });

  for (const name of t.dayNames) {
    grid.append(element("div", { className: "mcv-month-col-head", text: name }));
  }

  for (const dateStr of monthGrid) {
    const dayHeat = heatmap.get(dateStr);
    const heatLevel = dayHeat?.level ?? 0;
    const isToday = dateStr === todayStr;
    const isCurrentMonth = dateStr.slice(5, 7) === filter.selectedDate.slice(5, 7);

    const cell = element("div", {
      className: `mcv-month-cell heat-${heatLevel} ${isToday ? "today" : ""} ${
        isCurrentMonth ? "" : "other-month"
      }`,
    });

    const top = element("div", { className: "mcv-month-cell-top" });
    const dateNum = element("span", {
      className: "mcv-month-date",
      text: parseInt(dateStr.slice(8), 10).toString(),
    });
    top.append(dateNum);

    if (dayHeat && dayHeat.meetingCount > 0) {
      top.append(
        element("span", {
          className: "mcv-month-badge",
          text: `${dayHeat.meetingCount} ${t.meetingsCount}`,
        }),
      );
    }
    cell.append(top);

    const dayMeetings = meetings.filter((m) => m.createdAt.startsWith(dateStr));
    const displayLimit = 3;
    for (let i = 0; i < Math.min(displayLimit, dayMeetings.length); i++) {
      const meeting = dayMeetings[i];
      const isConflict = conflicts.has(meeting.id);
      const isTeam = meeting.scope === "team";
      const pill = element("div", {
        className: `mcv-month-pill ${isTeam ? "team" : ""} ${
          isConflict ? "conflict" : ""
        }`,
        text: `${meeting.createdAt.slice(11, 16)} ${meeting.title}`,
        title: meeting.title,
      });
      cell.append(pill);
    }

    if (dayMeetings.length > displayLimit) {
      cell.append(
        element("div", {
          className: "mcv-month-more",
          text: `+${dayMeetings.length - displayLimit} more`,
        }),
      );
    }

    cell.addEventListener("click", () => {
      filter = { ...filter, selectedDate: dateStr };
      container.replaceChildren();
      renderMonthView(container, meetings, filter, conflicts, now, t);
    });

    grid.append(cell);
  }

  containerEl.append(grid);
  container.append(containerEl);
}

function renderGanttView(
  container: HTMLElement,
  meetings: readonly PluginMeeting[],
  filter: CalendarFilter,
  conflicts: Set<string>,
  now: Date,
  t: ReturnType<typeof getTranslation>,
) {
  const gantt = element("div", { className: "mcv-gantt-container" });

  const ganttHeader = element("div", { className: "mcv-gantt-header" });
  ganttHeader.append(
    element("div", { className: "mcv-gantt-header-label", text: t.ganttScopeHeader }),
  );
  const headerTrack = element("div", { className: "mcv-gantt-header-track" });
  for (let h = 8; h <= 20; h++) {
    headerTrack.append(
      element("div", {
        className: "mcv-gantt-hour-cell",
        text: `${h.toString().padStart(2, "0")}:00`,
      }),
    );
  }
  ganttHeader.append(headerTrack);
  gantt.append(ganttHeader);

  const teams = extractAllTeams(meetings);
  const rows = ["Personal", ...teams];

  for (const rowName of rows) {
    const row = element("div", { className: "mcv-gantt-row" });
    const labelText = rowName === "Personal" ? t.scopePersonal : rowName;
    const label = element("div", { className: "mcv-gantt-label", text: labelText });
    const track = element("div", { className: "mcv-gantt-track" });

    const rowMeetings = meetings.filter((m) => {
      if (rowName === "Personal") return m.scope === "personal";
      return m.team?.name === rowName;
    });

    for (const m of rowMeetings) {
      const card = createMeetingCard(m, conflicts.has(m.id));
      track.append(card);
    }

    row.append(label, track);
    gantt.append(row);
  }

  container.append(gantt);
}

function createMeetingCard(
  meeting: PluginMeeting,
  hasConflict: boolean,
): HTMLElement {
  const isTeam = meeting.scope === "team";

  let className = "mcv-event-card";
  if (isTeam) className += " team";
  if (hasConflict) className += " conflict";

  const card = element("div", { className });

  const startDate = new Date(meeting.createdAt);
  const startHour = startDate.getHours() + startDate.getMinutes() / 60;
  const durationHours = (meeting.durationSeconds ?? 1800) / 3600;

  const topPx = Math.max(0, (startHour - 8) * 48);
  const heightPx = Math.max(26, durationHours * 48);

  card.style.top = `${topPx}px`;
  card.style.height = `${heightPx}px`;

  const headerLine = element("div", { className: "mcv-event-header-line" });
  const title = element("div", {
    className: "mcv-event-title",
    text: meeting.title,
  });

  const badgeText = meeting.team ? meeting.team.name : "Personal";
  const badge = element("span", {
    className: "mcv-event-badge",
    text: badgeText,
  });

  headerLine.append(title, badge);

  const time = element("div", {
    className: "mcv-event-time",
    text: `${startDate.getHours().toString().padStart(2, "0")}:${startDate
      .getMinutes()
      .toString()
      .padStart(2, "0")} (${Math.round((meeting.durationSeconds ?? 1800) / 60)}m)`,
  });

  card.append(headerLine, time);
  return card;
}

// ─── 辅助函数 ──────────────────────────────────────────────────

function formatNavLabel(dateStr: string, mode: ViewMode, localeStr?: string): string {
  const [y, m] = dateStr.split("-").map(Number);
  const lang = normalizeLocale(localeStr);
  const loc = lang === "zh" ? "zh-CN" : "en-US";

  if (mode === "month") {
    const d = new Date(y, m - 1, 1);
    return d.toLocaleDateString(loc, { month: "long", year: "numeric" });
  }
  if (mode === "week") {
    const range = getWeekRange(dateStr, 1);
    return `${range[0].slice(5)} ~ ${range[6].slice(5)}`;
  }
  return dateStr;
}

function shiftDate(dateStr: string, mode: ViewMode, delta: number): string {
  const [y, m, dayNum] = dateStr.split("-").map(Number);
  const d = new Date(y, m - 1, dayNum);
  if (mode === "month") {
    d.setMonth(d.getMonth() + delta);
  } else if (mode === "week") {
    d.setDate(d.getDate() + delta * 7);
  } else {
    d.setDate(d.getDate() + delta);
  }
  return formatLocalDate(d);
}

/* v8 ignore start -- production SDK lifecycle wiring */
let viewCleanup: (() => void) | undefined;
export const { mount } = defineView({
  mount: async (root) => {
    viewCleanup = await mountSidebarView(root, {
      meetingGateway: createSdkMeetingGateway(plugin.meetings),
      getTheme: () => plugin.theme.get(),
      getLocale: () => plugin.context.getLocale(),
      now: () => new Date(),
      on: (type, listener) => plugin.events.on(type as never, listener as never),
      storage: plugin.storage,
      toast: (msg) => plugin.ui.toast({ message: msg, variant: "info" }),
      loadStorage: (nowIso?: string) => loadCalendarStorage(plugin.storage, nowIso),
      saveStorage: (data: CalendarStorageData) => saveCalendarStorage(plugin.storage, data),
    });
    return () => viewCleanup?.();
  },
});
/* v8 ignore stop */

import type { PluginMeeting, PluginMeetingStatus } from "@todoflowy/plugin-contracts";
import type {
  CalendarFilter,
  DayHeatmapData,
  HeatmapLevel,
  MeetingDisplayStatus,
} from "./types.js";

/**
 * 将 SDK 的 9 种 PluginMeetingStatus 映射为 3 种 UI 显示状态
 * - draft: 处理中/排队中阶段 (uploading, validating, queued, transcribing, summarizing)
 * - confirmed: 就绪阶段 (ready)
 * - archived: 终态/失败 (retryable_failed, failed, cancelled)
 */
export function mapDisplayStatus(
  status: PluginMeetingStatus,
): MeetingDisplayStatus {
  switch (status) {
    case "uploading":
    case "validating":
    case "queued":
    case "transcribing":
    case "summarizing":
      return "draft";
    case "ready":
      return "confirmed";
    case "retryable_failed":
    case "failed":
    case "cancelled":
      return "archived";
  }
}

/**
 * 检测时间重叠冲突
 * NOTE: 仅检测 ready 且 durationSeconds > 0 的会议
 */
export function detectConflicts(
  meetings: readonly PluginMeeting[],
): Set<string> {
  const active = meetings.filter(
    (m) =>
      m.status === "ready" &&
      m.durationSeconds !== null &&
      m.durationSeconds > 0,
  );
  const conflicts = new Set<string>();

  for (let i = 0; i < active.length; i++) {
    for (let j = i + 1; j < active.length; j++) {
      const a = active[i];
      const b = active[j];
      const startA = new Date(a.createdAt).getTime();
      const endA = startA + (a.durationSeconds ?? 0) * 1000;
      const startB = new Date(b.createdAt).getTime();
      const endB = startB + (b.durationSeconds ?? 0) * 1000;

      // 区间重叠判定: max(startA, startB) < min(endA, endB)
      if (Math.max(startA, startB) < Math.min(endA, endB)) {
        conflicts.add(a.id);
        conflicts.add(b.id);
      }
    }
  }

  return conflicts;
}

/**
 * 计算日忙碌度热力等级
 */
export function computeHeatmapLevel(
  totalMinutes: number,
  thresholds: readonly [number, number, number] = [60, 240, 360],
): HeatmapLevel {
  if (totalMinutes >= thresholds[2]) return 3;
  if (totalMinutes >= thresholds[1]) return 2;
  if (totalMinutes >= thresholds[0]) return 1;
  return 0;
}

/**
 * 按日聚合热力数据
 */
export function computeDailyHeatmap(
  meetings: readonly PluginMeeting[],
  thresholds: readonly [number, number, number],
): Map<string, DayHeatmapData> {
  const map = new Map<string, { minutes: number; count: number }>();

  for (const meeting of meetings) {
    if (mapDisplayStatus(meeting.status) === "archived") continue;
    const dateKey = meeting.createdAt.slice(0, 10);
    const durationMinutes = (meeting.durationSeconds ?? 0) / 60;
    const existing = map.get(dateKey) ?? { minutes: 0, count: 0 };
    map.set(dateKey, {
      minutes: existing.minutes + durationMinutes,
      count: existing.count + 1,
    });
  }

  const result = new Map<string, DayHeatmapData>();
  for (const [date, data] of map) {
    result.set(date, {
      date,
      totalMinutes: Math.round(data.minutes),
      meetingCount: data.count,
      level: computeHeatmapLevel(data.minutes, thresholds),
    });
  }
  return result;
}

/**
 * 多维组合筛选
 */
export function filterMeetings(
  meetings: readonly PluginMeeting[],
  filter: CalendarFilter,
): readonly PluginMeeting[] {
  return meetings.filter((m) => {
    // 1. Scope 筛选
    if (filter.scopeFilter !== "all" && m.scope !== filter.scopeFilter) {
      return false;
    }
    // 2. 显示状态筛选
    if (
      filter.statusFilter !== "all" &&
      mapDisplayStatus(m.status) !== filter.statusFilter
    ) {
      return false;
    }
    // 3. 团队筛选
    if (filter.teamFilter !== "all") {
      if (!m.team || m.team.name !== filter.teamFilter) return false;
    }
    // 4. 标签筛选
    if (
      filter.selectedTagIds.length > 0 &&
      !filter.selectedTagIds.some((tagId) => m.tagIds.includes(tagId))
    ) {
      return false;
    }
    return true;
  });
}

/**
 * 提取去重并排序的团队名称列表
 */
export function extractAllTeams(
  meetings: readonly PluginMeeting[],
): readonly string[] {
  const teams = new Set<string>();
  for (const m of meetings) {
    if (m.team?.name) {
      teams.add(m.team.name);
    }
  }
  return [...teams].sort();
}

export function formatLocalDate(d: Date): string {
  const year = d.getFullYear();
  const month = (d.getMonth() + 1).toString().padStart(2, "0");
  const date = d.getDate().toString().padStart(2, "0");
  return `${year}-${month}-${date}`;
}

/**
 * 获取周视图 7 天 ISO 日期数组 (YYYY-MM-DD)
 */
export function getWeekRange(
  anchorDate: string,
  weekStartDay: 0 | 1,
): readonly string[] {
  const [y, m, dayNum] = anchorDate.split("-").map(Number);
  const d = new Date(y, m - 1, dayNum);
  const dayOfWeek = d.getDay();
  const diff = (dayOfWeek - weekStartDay + 7) % 7;
  const startDate = new Date(d);
  startDate.setDate(d.getDate() - diff);

  const days: string[] = [];
  for (let i = 0; i < 7; i++) {
    const day = new Date(startDate);
    day.setDate(startDate.getDate() + i);
    days.push(formatLocalDate(day));
  }
  return days;
}

/**
 * 获取月视图 6×7 (42天) ISO 日期数组
 */
export function getMonthGrid(
  year: number,
  month: number,
  weekStartDay: 0 | 1,
): readonly string[] {
  const firstDay = new Date(year, month, 1);
  const dayOfWeek = firstDay.getDay();
  const startOffset = (dayOfWeek - weekStartDay + 7) % 7;

  const grid: string[] = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(year, month, 1 - startOffset + i);
    grid.push(formatLocalDate(d));
  }
  return grid;
}

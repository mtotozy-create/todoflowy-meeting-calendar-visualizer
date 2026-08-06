/**
 * 从 SDK / Contracts 重导出的类型
 */
export type {
  PluginMeeting,
  PluginMeetingCaptureSource,
  PluginMeetingContent,
  PluginMeetingContentQuery,
  PluginMeetingContentSection,
  PluginMeetingList,
  PluginMeetingListQuery,
  PluginMeetingResolution,
  PluginMeetingResolutionPage,
  PluginMeetingScope,
  PluginMeetingStatus,
  PluginMeetingSummary,
  PluginMeetingTranscriptItem,
  PluginMeetingTranscriptPage,
} from "@todoflowy/plugin-contracts";

/** 视图模式 */
export type ViewMode = "week" | "month" | "gantt";

/**
 * 会议显示状态（插件视觉分类，映射自 SDK 的 9 种 PluginMeetingStatus）
 * - draft: 尚在处理中 (uploading, validating, queued, transcribing, summarizing)
 * - confirmed: 已就绪 (ready)
 * - archived: 终态 (retryable_failed, failed, cancelled)
 */
export type MeetingDisplayStatus = "draft" | "confirmed" | "archived";

/** 会议视觉标签（插件自带的可编辑色板标签） */
export interface VisualTag {
  readonly id: string;
  readonly name: string;
  readonly color: string;
}

/** 多维筛选器状态 */
export interface CalendarFilter {
  readonly viewMode: ViewMode;
  readonly selectedDate: string; // YYYY-MM-DD
  readonly scopeFilter: "personal" | "team" | "all";
  readonly statusFilter: MeetingDisplayStatus | "all";
  readonly teamFilter: string | "all";
  readonly selectedTagIds: readonly string[];
}

/** 日热力数据 */
export interface DayHeatmapData {
  readonly date: string;
  readonly totalMinutes: number;
  readonly meetingCount: number;
  readonly level: HeatmapLevel;
}

export type HeatmapLevel = 0 | 1 | 2 | 3;

/** 插件持久化设置 */
export interface CalendarSettings {
  readonly version: 1;
  readonly weekStartDay: 0 | 1;
  readonly workHourStart: number;
  readonly workHourEnd: number;
  readonly heatmapThresholds: readonly [number, number, number];
}

/** 插件持久化数据 (存储偏好与标签设置) */
export interface CalendarStorageData {
  readonly version: 1;
  readonly filter: CalendarFilter;
  readonly customTags: readonly VisualTag[];
  readonly settings: CalendarSettings;
  readonly lastUpdated: string;
}

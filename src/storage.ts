import { DEFAULT_TAGS } from "./core/tags.js";
import type {
  CalendarFilter,
  CalendarSettings,
  CalendarStorageData,
  VisualTag,
} from "./core/types.js";

export interface StorageGateway {
  get(key: string): Promise<unknown>;
  set(key: string, value: unknown): Promise<void>;
}

const STORAGE_KEY = "meeting_calendar_data_v1";

export const DEFAULT_SETTINGS: CalendarSettings = {
  version: 1,
  weekStartDay: 1, // 默认为周一
  workHourStart: 8,
  workHourEnd: 20,
  heatmapThresholds: [60, 240, 360],
};

export const DEFAULT_FILTER: CalendarFilter = {
  viewMode: "week",
  selectedDate: new Date().toISOString().slice(0, 10),
  scopeFilter: "all",
  statusFilter: "all",
  teamFilter: "all",
  selectedTagIds: [],
};

export async function loadCalendarStorage(
  storage: StorageGateway,
  nowIso: string = new Date().toISOString(),
): Promise<CalendarStorageData> {
  try {
    const raw = await storage.get(STORAGE_KEY);
    if (!raw || typeof raw !== "object") {
      return createInitialStorage(nowIso);
    }

    const obj = raw as Record<string, unknown>;
    if (obj.version !== 1) {
      return createInitialStorage(nowIso);
    }

    return {
      version: 1,
      filter: validateFilter(obj.filter, nowIso),
      customTags: Array.isArray(obj.customTags)
        ? validateTags(obj.customTags)
        : [...DEFAULT_TAGS],
      settings: validateSettings(obj.settings),
      lastUpdated:
        typeof obj.lastUpdated === "string" ? obj.lastUpdated : nowIso,
    };
  } catch {
    return createInitialStorage(nowIso);
  }
}

export async function saveCalendarStorage(
  storage: StorageGateway,
  data: CalendarStorageData,
): Promise<void> {
  await storage.set(STORAGE_KEY, data);
}

function createInitialStorage(nowIso: string): CalendarStorageData {
  return {
    version: 1,
    filter: {
      ...DEFAULT_FILTER,
      selectedDate: nowIso.slice(0, 10),
    },
    customTags: [...DEFAULT_TAGS],
    settings: DEFAULT_SETTINGS,
    lastUpdated: nowIso,
  };
}

function validateFilter(raw: unknown, nowIso: string): CalendarFilter {
  if (!raw || typeof raw !== "object") {
    return { ...DEFAULT_FILTER, selectedDate: nowIso.slice(0, 10) };
  }
  const obj = raw as Record<string, unknown>;
  const viewMode =
    obj.viewMode === "week" || obj.viewMode === "month" || obj.viewMode === "gantt"
      ? obj.viewMode
      : "week";
  const scopeFilter =
    obj.scopeFilter === "personal" || obj.scopeFilter === "team"
      ? obj.scopeFilter
      : "all";
  const statusFilter =
    obj.statusFilter === "draft" ||
    obj.statusFilter === "confirmed" ||
    obj.statusFilter === "archived"
      ? obj.statusFilter
      : "all";

  return {
    viewMode,
    selectedDate:
      typeof obj.selectedDate === "string"
        ? obj.selectedDate
        : nowIso.slice(0, 10),
    scopeFilter,
    statusFilter,
    teamFilter: typeof obj.teamFilter === "string" ? obj.teamFilter : "all",
    selectedTagIds: Array.isArray(obj.selectedTagIds)
      ? obj.selectedTagIds.filter((x): x is string => typeof x === "string")
      : [],
  };
}

function validateTags(raw: readonly unknown[]): VisualTag[] {
  return raw.filter((item): item is VisualTag => {
    if (!item || typeof item !== "object") return false;
    const obj = item as Record<string, unknown>;
    return (
      typeof obj.id === "string" &&
      typeof obj.name === "string" &&
      typeof obj.color === "string"
    );
  }) as VisualTag[];
}

function validateSettings(raw: unknown): CalendarSettings {
  if (!raw || typeof raw !== "object") return DEFAULT_SETTINGS;
  const obj = raw as Record<string, unknown>;
  return {
    version: 1,
    weekStartDay:
      obj.weekStartDay === 0 || obj.weekStartDay === 1
        ? obj.weekStartDay
        : DEFAULT_SETTINGS.weekStartDay,
    workHourStart:
      typeof obj.workHourStart === "number"
        ? obj.workHourStart
        : DEFAULT_SETTINGS.workHourStart,
    workHourEnd:
      typeof obj.workHourEnd === "number"
        ? obj.workHourEnd
        : DEFAULT_SETTINGS.workHourEnd,
    heatmapThresholds:
      Array.isArray(obj.heatmapThresholds) &&
      obj.heatmapThresholds.length === 3
        ? (obj.heatmapThresholds as [number, number, number])
        : DEFAULT_SETTINGS.heatmapThresholds,
  };
}

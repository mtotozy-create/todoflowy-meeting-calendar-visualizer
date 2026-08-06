export type SupportedLocale = "zh" | "en";

export function normalizeLocale(rawLocale?: string): SupportedLocale {
  if (!rawLocale) return "en";
  const lower = rawLocale.toLowerCase();
  if (lower.startsWith("zh")) return "zh";
  return "en";
}

export const translations = {
  zh: {
    appTitle: "会议日历",
    appSubtitle: "个人与团队工作台",
    refreshTooltip: "刷新会议数据",
    refreshSuccess: "📅 会议日历已刷新",
    refreshError: "刷新会议数据失败",
    
    // 视图模式
    viewWeek: "周视图",
    viewMonth: "月视图",
    viewGantt: "甘特图",
    
    // 导航
    today: "今天",
    timeCol: "时间",
    dayNames: ["周一", "周二", "周三", "周四", "周五", "周六", "周日"],
    
    // 筛选器
    scopeAll: "所有作用域 [个人与团队]",
    scopePersonal: "个人会议",
    scopeTeam: "团队会议",
    
    statusAll: "所有状态",
    statusConfirmed: "已确认 (就绪)",
    statusDraft: "草稿 (处理中)",
    statusArchived: "已归档 (终止/失败)",
    
    teamAll: "所有团队",
    
    // 视图明细
    meetingsCount: "场会议",
    noMeetings: "该日期暂无排期会议",
    ganttScopeHeader: "作用域 / 团队",
    nowLine: "当前时刻",
    
    // 底部状态与图例
    showingMeetings: (count: number, teams: number, conflicts: number) =>
      `共显示 ${count} 场会议 · 覆盖 ${teams} 个团队 · 检测到 ${conflicts} 处冲突`,
    legendConfirmed: "● 已确认",
    legendTeam: "● 团队",
    legendConflict: "--- 冲突",
  },
  en: {
    appTitle: "Meeting Calendar",
    appSubtitle: "Personal & Team Workbench",
    refreshTooltip: "Refresh Meetings",
    refreshSuccess: "📅 Calendar refreshed",
    refreshError: "Failed to refresh meetings",
    
    // 视图模式
    viewWeek: "Week View",
    viewMonth: "Month View",
    viewGantt: "Gantt Chart",
    
    // 导航
    today: "Today",
    timeCol: "Time",
    dayNames: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    
    // 筛选器
    scopeAll: "All Scopes [Personal & Team]",
    scopePersonal: "Personal Meetings",
    scopeTeam: "Team Meetings",
    
    statusAll: "All Statuses",
    statusConfirmed: "Confirmed (Ready)",
    statusDraft: "Draft (Processing)",
    statusArchived: "Archived (Ended/Failed)",
    
    teamAll: "All Teams",
    
    // 视图明细
    meetingsCount: "meetings",
    noMeetings: "No meetings scheduled for this date.",
    ganttScopeHeader: "Scope / Teams",
    nowLine: "NOW",
    
    // 底部状态与图例
    showingMeetings: (count: number, teams: number, conflicts: number) =>
      `Showing ${count} meetings across ${teams} teams · ${conflicts} conflict detected`,
    legendConfirmed: "● Confirmed",
    legendTeam: "● Team Scope",
    legendConflict: "--- Conflict",
  },
} as const;

export function getTranslation(localeStr?: string) {
  const lang = normalizeLocale(localeStr);
  return translations[lang];
}

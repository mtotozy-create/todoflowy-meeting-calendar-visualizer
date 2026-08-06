import type { PluginMeeting } from "@todoflowy/plugin-contracts";

/**
 * 生成符合 PluginMeeting 精确 Schema 的丰富种子数据
 * 用于离线测试/开发展示
 */
export function generateSeedMeetings(nowIso: string): readonly PluginMeeting[] {
  const today = nowIso.slice(0, 10);

  const makeTime = (dayOffset: number, hour: number, minute = 0): string => {
    const d = new Date(today + "T00:00:00");
    d.setDate(d.getDate() + dayOffset);
    d.setHours(hour, minute, 0, 0);
    return d.toISOString();
  };

  return [
    // 今天的会议 (含时间冲突)
    {
      id: "seed-1",
      scope: "personal",
      team: null,
      title: "Daily Standup",
      captureSource: "recording",
      status: "ready",
      durationSeconds: 1800, // 30 mins
      detectedLanguage: "zh",
      tagIds: ["tag-standup"],
      revision: 1,
      createdAt: makeTime(0, 9, 0),
      updatedAt: makeTime(0, 9, 0),
    },
    {
      id: "seed-2",
      scope: "team",
      team: { id: "team-frontend", name: "Frontend" },
      title: "Sprint Planning",
      captureSource: "recording",
      status: "ready",
      durationSeconds: 7200, // 2 hours
      detectedLanguage: "zh",
      tagIds: ["tag-planning"],
      revision: 1,
      createdAt: makeTime(0, 10, 0),
      updatedAt: makeTime(0, 10, 0),
    },
    {
      id: "seed-3",
      scope: "team",
      team: { id: "team-design", name: "Design" },
      title: "Design Review",
      captureSource: "recording",
      status: "ready",
      durationSeconds: 3600, // 1 hour (冲突于 11:00-12:00!)
      detectedLanguage: "en",
      tagIds: ["tag-review"],
      revision: 1,
      createdAt: makeTime(0, 11, 0),
      updatedAt: makeTime(0, 11, 0),
    },
    {
      id: "seed-4",
      scope: "personal",
      team: null,
      title: "1:1 with Manager",
      captureSource: "recording",
      status: "ready",
      durationSeconds: 2700, // 45 mins
      detectedLanguage: "zh",
      tagIds: ["tag-one-on-one"],
      revision: 1,
      createdAt: makeTime(0, 14, 0),
      updatedAt: makeTime(0, 14, 0),
    },

    // 明天
    {
      id: "seed-5",
      scope: "team",
      team: { id: "team-frontend", name: "Frontend" },
      title: "Tech Sharing: WebAssembly",
      captureSource: "upload",
      status: "ready",
      durationSeconds: 5400, // 1.5 hours
      detectedLanguage: "en",
      tagIds: ["tag-demo"],
      revision: 1,
      createdAt: makeTime(1, 15, 0),
      updatedAt: makeTime(1, 15, 0),
    },
    {
      id: "seed-6",
      scope: "team",
      team: { id: "team-backend", name: "Backend" },
      title: "API Architecture Review",
      captureSource: "recording",
      status: "transcribing", // 处理中 (draft 阶段)
      durationSeconds: 3600,
      detectedLanguage: "zh",
      tagIds: ["tag-review"],
      revision: 1,
      createdAt: makeTime(1, 10, 0),
      updatedAt: makeTime(1, 10, 0),
    },

    // 后天
    {
      id: "seed-7",
      scope: "team",
      team: { id: "team-qa", name: "QA" },
      title: "Sprint 11 Team Retro",
      captureSource: "recording",
      status: "ready",
      durationSeconds: 5400,
      detectedLanguage: "zh",
      tagIds: ["tag-retro"],
      revision: 1,
      createdAt: makeTime(2, 14, 0),
      updatedAt: makeTime(2, 14, 0),
    },

    // 更多分布
    {
      id: "seed-8",
      scope: "team",
      team: { id: "team-product", name: "Product" },
      title: "Product Roadmap Brainstorm",
      captureSource: "upload",
      status: "queued", // 处理中
      durationSeconds: 7200,
      detectedLanguage: "zh",
      tagIds: ["tag-brainstorm"],
      revision: 1,
      createdAt: makeTime(3, 10, 0),
      updatedAt: makeTime(3, 10, 0),
    },
    {
      id: "seed-9",
      scope: "team",
      team: { id: "team-backend", name: "Backend" },
      title: "Urgent Bug Triage",
      captureSource: "recording",
      status: "ready",
      durationSeconds: 3600,
      detectedLanguage: "zh",
      tagIds: ["tag-urgent"],
      revision: 1,
      createdAt: makeTime(3, 16, 0),
      updatedAt: makeTime(3, 16, 0),
    },
    {
      id: "seed-10",
      scope: "team",
      team: { id: "team-product", name: "Product" },
      title: "Executive Stakeholder Demo",
      captureSource: "upload",
      status: "summarizing", // 处理中
      durationSeconds: 5400,
      detectedLanguage: "en",
      tagIds: ["tag-demo"],
      revision: 1,
      createdAt: makeTime(5, 10, 0),
      updatedAt: makeTime(5, 10, 0),
    },

    // 失败/已归档会议
    {
      id: "seed-11",
      scope: "personal",
      team: null,
      title: "Cancelled Vendor Sync",
      captureSource: "recording",
      status: "cancelled", // 终态/归档
      durationSeconds: 1800,
      detectedLanguage: null,
      tagIds: ["tag-one-on-one"],
      revision: 1,
      createdAt: makeTime(-2, 10, 0),
      updatedAt: makeTime(-2, 10, 0),
    },
    {
      id: "seed-12",
      scope: "team",
      team: { id: "team-frontend", name: "Frontend" },
      title: "Failed Recording Sync",
      captureSource: "upload",
      status: "failed", // 终态/归档
      durationSeconds: null,
      detectedLanguage: null,
      tagIds: ["tag-urgent"],
      revision: 1,
      createdAt: makeTime(-1, 16, 0),
      updatedAt: makeTime(-1, 16, 0),
    },
  ];
}

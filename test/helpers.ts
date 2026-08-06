import type { PluginMeeting, PluginMeetingScope } from "@todoflowy/plugin-contracts";
import type { MeetingGateway } from "../src/meetings.js";
import type { StorageGateway } from "../src/storage.js";

export class MemoryStorage implements StorageGateway {
  private data = new Map<string, unknown>();

  async get(key: string): Promise<unknown> {
    return this.data.get(key) ?? null;
  }

  async set(key: string, value: unknown): Promise<void> {
    this.data.set(key, JSON.parse(JSON.stringify(value)));
  }
}

export class MockMeetingGateway implements MeetingGateway {
  constructor(public meetings: PluginMeeting[] = []) {}

  async listAll(scope: PluginMeetingScope): Promise<readonly PluginMeeting[]> {
    if (scope === "personal") {
      return this.meetings.filter((m) => m.scope === "personal");
    }
    return this.meetings.filter((m) => m.scope === "team");
  }

  async get(id: string): Promise<PluginMeeting | null> {
    return this.meetings.find((m) => m.id === id) ?? null;
  }
}

export function createTestMeeting(
  overrides: Partial<PluginMeeting> & { id: string },
): PluginMeeting {
  return {
    scope: "personal",
    team: null,
    title: "Test Meeting",
    captureSource: "recording",
    status: "ready",
    durationSeconds: 3600,
    detectedLanguage: "zh",
    tagIds: [],
    revision: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

import type {
  PluginMeeting,
  PluginMeetingList,
  PluginMeetingScope,
} from "@todoflowy/plugin-contracts";
import { PluginApiError } from "@todoflowy/plugin-sdk";
import { MeetingOperationError } from "./errors.js";

export interface MeetingGateway {
  listAll(scope: PluginMeetingScope): Promise<readonly PluginMeeting[]>;
  get(id: string, scope: PluginMeetingScope): Promise<PluginMeeting | null>;
}

export interface PluginMeetingsApi {
  list(input: {
    scope: PluginMeetingScope;
    cursor?: string;
    limit?: number;
  }): Promise<PluginMeetingList>;
  get(id: string, scope?: PluginMeetingScope): Promise<PluginMeeting>;
}

/**
 * 基于 plugin.meetings SDK API 的 Gateway 实现
 * 严格遵循 meeting-read.md 规范：
 * - list 显式传 scope
 * - 游标分页 limit 1-100，以 nextCursor 是否为 null 判断完成
 * - NOT_FOUND 不尝试另一 scope
 */
export function createSdkMeetingGateway(
  meetingsApi: PluginMeetingsApi,
): MeetingGateway {
  return {
    async listAll(scope) {
      const all: PluginMeeting[] = [];
      let cursor: string | undefined;
      const seenCursors = new Set<string>();

      do {
        if (cursor !== undefined) {
          if (seenCursors.has(cursor)) {
            throw new MeetingOperationError(
              "Meeting pagination returned a repeated cursor.",
            );
          }
          seenCursors.add(cursor);
        }
        const page = await meetingsApi.list({
          scope,
          limit: 100,
          ...(cursor === undefined ? {} : { cursor }),
        });
        all.push(...page.items);
        cursor = page.nextCursor ?? undefined;
      } while (cursor !== undefined);

      return all;
    },

    async get(id, scope) {
      try {
        return await meetingsApi.get(id, scope);
      } catch (error) {
        if (error instanceof PluginApiError && error.code === "NOT_FOUND") {
          return null;
        }
        throw error;
      }
    },
  };
}

/**
 * 同时拉取个人与团队会议并进行合并去重
 * 使用 Promise.allSettled 确保单 scope 失败时仍可展示已知数据
 */
export async function fetchAllMeetings(
  gateway: MeetingGateway,
): Promise<readonly PluginMeeting[]> {
  const results = await Promise.allSettled([
    gateway.listAll("personal"),
    gateway.listAll("team"),
  ]);

  const personal = results[0].status === "fulfilled" ? results[0].value : [];
  const team = results[1].status === "fulfilled" ? results[1].value : [];

  const map = new Map<string, PluginMeeting>();
  for (const meeting of personal) {
    map.set(meeting.id, meeting);
  }
  for (const meeting of team) {
    // team scope 优先 (team 对象信息更完整)
    map.set(meeting.id, meeting);
  }

  return [...map.values()].sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

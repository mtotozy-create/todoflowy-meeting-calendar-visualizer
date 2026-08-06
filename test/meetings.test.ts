import { describe, expect, it, vi } from "vitest";
import {
  createSdkMeetingGateway,
  fetchAllMeetings,
  type PluginMeetingsApi,
} from "../src/meetings.js";
import { createTestMeeting } from "./helpers.js";

describe("meetings gateway and fetchAllMeetings", () => {
  it("fetches all pages via cursor in createSdkMeetingGateway", async () => {
    const page1Item = createTestMeeting({ id: "p1", scope: "personal" });
    const page2Item = createTestMeeting({ id: "p2", scope: "personal" });

    const mockApi: PluginMeetingsApi = {
      list: vi.fn().mockImplementation(async (input) => {
        if (!input.cursor) {
          return { items: [page1Item], nextCursor: "cur_2" };
        }
        return { items: [page2Item], nextCursor: null };
      }),
      get: vi.fn(),
    };

    const gateway = createSdkMeetingGateway(mockApi);
    const meetings = await gateway.listAll("personal");
    expect(meetings).toHaveLength(2);
    expect(meetings.map((m) => m.id)).toEqual(["p1", "p2"]);
    expect(mockApi.list).toHaveBeenCalledTimes(2);
  });

  it("fails closed when the host repeats a pagination cursor", async () => {
    const mockApi: PluginMeetingsApi = {
      list: vi.fn().mockResolvedValue({ items: [], nextCursor: "same" }),
      get: vi.fn(),
    };

    const gateway = createSdkMeetingGateway(mockApi);
    await expect(gateway.listAll("personal")).rejects.toThrow(
      "repeated cursor",
    );
    expect(mockApi.list).toHaveBeenCalledTimes(2);
  });

  it("merges personal and team meetings, with team scope taking priority on duplicate IDs", async () => {
    const personalOnly = createTestMeeting({ id: "m1", scope: "personal", title: "Personal Only" });
    const duplicatePersonal = createTestMeeting({ id: "m2", scope: "personal", title: "Personal Copy" });
    const duplicateTeam = createTestMeeting({
      id: "m2",
      scope: "team",
      team: { id: "t1", name: "Engineering" },
      title: "Team Priority Version",
    });

    const mockGateway = {
      listAll: vi.fn().mockImplementation(async (scope) => {
        if (scope === "personal") return [personalOnly, duplicatePersonal];
        return [duplicateTeam];
      }),
      get: vi.fn(),
    };

    const merged = await fetchAllMeetings(mockGateway);
    expect(merged).toHaveLength(2);

    const m2Found = merged.find((m) => m.id === "m2");
    expect(m2Found?.scope).toBe("team");
    expect(m2Found?.title).toBe("Team Priority Version");
  });

  it("handles single-scope failure gracefully with Promise.allSettled", async () => {
    const personalItem = createTestMeeting({ id: "m1", scope: "personal" });

    const mockGateway = {
      listAll: vi.fn().mockImplementation(async (scope) => {
        if (scope === "personal") return [personalItem];
        throw new Error("CAPABILITY_DENIED");
      }),
      get: vi.fn(),
    };

    const merged = await fetchAllMeetings(mockGateway);
    expect(merged).toHaveLength(1);
    expect(merged[0].id).toBe("m1");
  });
});

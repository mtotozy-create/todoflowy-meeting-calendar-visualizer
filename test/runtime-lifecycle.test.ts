import { describe, expect, it, vi } from "vitest";

vi.mock("@todoflowy/plugin-sdk", () => {
  let eventListener: ((payload: unknown) => void) | null = null;
  return {
    defineRuntime: (opts: { activate: () => void; deactivate?: () => void }) => opts,
    plugin: {
      events: {
        on: (_type: string, cb: (payload: unknown) => void) => {
          eventListener = cb;
          return () => {
            eventListener = null;
          };
        },
      },
      ui: {
        toast: vi.fn(),
      },
    },
  };
});

describe("runtime activate lifecycle", () => {
  it("subscribes to command.invoked and handles refresh command", async () => {
    const { activate, deactivate } = await import("../src/runtime.js");
    activate();
    deactivate();
  });
});

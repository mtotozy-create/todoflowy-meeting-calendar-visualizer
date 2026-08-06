import { defineRuntime, plugin } from "@todoflowy/plugin-sdk";

let cleanup: (() => void) | undefined;

export const { activate, deactivate } = defineRuntime({
  activate() {
    const unsubscribe = plugin.events.on("command.invoked", (payload) => {
      if (
        payload !== null &&
        typeof payload === "object" &&
        "command" in payload &&
        (payload as Record<string, unknown>).command ===
          "meeting-calendar-visualizer.refresh"
      ) {
        void plugin.ui.toast({
          message: "📅 Meeting Calendar refreshed",
          variant: "info",
        });
      }
    });

    cleanup = () => {
      unsubscribe();
    };
  },
  deactivate() {
    cleanup?.();
  },
});

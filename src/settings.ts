import { defineView, plugin } from "@todoflowy/plugin-sdk";
import { element } from "./dom.js";
import { loadCalendarStorage, saveCalendarStorage } from "./storage.js";

export const { mount } = defineView({
  mount: async (root) => {
    const data = await loadCalendarStorage(plugin.storage);

    const container = element("div", {
      className: "mcv-settings-panel",
      attributes: {
        style:
          "padding: 16px; font-family: Inter, sans-serif; font-size: 13px;",
      },
    });

    const title = element("h3", {
      text: "Meeting Calendar Settings",
      attributes: { style: "margin-top: 0; font-size: 16px;" },
    });

    const info = element("p", {
      text: `Version: ${data.version} | Last Updated: ${new Date(
        data.lastUpdated,
      ).toLocaleString()}`,
      attributes: { style: "color: #858c89; font-size: 12px;" },
    });

    const workHoursLabel = element("label", {
      text: "Work Hours Range: 08:00 - 20:00",
      attributes: { style: "display: block; margin-top: 12px;" },
    });

    container.append(title, info, workHoursLabel);
    root.replaceChildren(container);

    return () => {
      root.replaceChildren();
    };
  },
});

import { describe, expect, it } from "vitest";
import { getTranslation, normalizeLocale } from "../src/i18n.js";

describe("i18n helper and dictionary", () => {
  it("normalizes locale strings to supported languages", () => {
    expect(normalizeLocale("zh-CN")).toBe("zh");
    expect(normalizeLocale("zh-TW")).toBe("zh");
    expect(normalizeLocale("en-US")).toBe("en");
    expect(normalizeLocale("fr-FR")).toBe("en");
  });

  it("returns translations for Chinese and English", () => {
    const zh = getTranslation("zh-CN");
    expect(zh.appTitle).toBe("会议日历");
    expect(zh.viewWeek).toBe("周视图");

    const en = getTranslation("en-US");
    expect(en.appTitle).toBe("Meeting Calendar");
    expect(en.viewWeek).toBe("Week View");
  });
});

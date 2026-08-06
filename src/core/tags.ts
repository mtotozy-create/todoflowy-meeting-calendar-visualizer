import type { VisualTag } from "./types.js";

/**
 * 遵循 TodoFlowy DESIGN.md 的克制色板
 * Sage Signal, Team Context Blue, Error Ink, 以及相调和的静调色
 */
export const TAG_COLOR_PALETTE: readonly string[] = [
  "#9ed0ad", // Sage Signal (强调/常规)
  "#8bb6dd", // Team Context Blue (团队/项目)
  "#d2a8a2", // Error Ink (紧急/高优)
  "#b0a8d2", // Muted Lavender (头脑风暴)
  "#d2c4a8", // Warm Sand (评审/讨论)
  "#9ed0ca", // Soft Teal (1:1/沟通)
  "#d2a8c8", // Soft Rose (演示/分享)
  "#a8c8d2", // Ice Blue (规划/复盘)
];

/**
 * 默认视觉标签库
 */
export const DEFAULT_TAGS: readonly VisualTag[] = [
  { id: "tag-standup", name: "Standup", color: TAG_COLOR_PALETTE[0] },
  { id: "tag-planning", name: "Planning", color: TAG_COLOR_PALETTE[1] },
  { id: "tag-review", name: "Review", color: TAG_COLOR_PALETTE[4] },
  { id: "tag-brainstorm", name: "Brainstorm", color: TAG_COLOR_PALETTE[3] },
  { id: "tag-one-on-one", name: "1:1", color: TAG_COLOR_PALETTE[5] },
  { id: "tag-demo", name: "Demo", color: TAG_COLOR_PALETTE[6] },
  { id: "tag-retro", name: "Retro", color: TAG_COLOR_PALETTE[7] },
  { id: "tag-urgent", name: "Urgent", color: TAG_COLOR_PALETTE[2] },
];

export function getTagColor(
  tagId: string,
  tags: readonly VisualTag[],
): string {
  const found = tags.find((t) => t.id === tagId);
  return found?.color ?? TAG_COLOR_PALETTE[0];
}

export function getNextAvailableColor(
  existingTags: readonly VisualTag[],
): string {
  const usedColors = new Set(existingTags.map((t) => t.color));
  for (const color of TAG_COLOR_PALETTE) {
    if (!usedColors.has(color)) return color;
  }
  return TAG_COLOR_PALETTE[existingTags.length % TAG_COLOR_PALETTE.length];
}

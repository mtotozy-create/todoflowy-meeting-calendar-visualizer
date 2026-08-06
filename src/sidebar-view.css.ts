/**
 * 会议日历桌面全屏铺满 CSS Design System 常量
 * 严格遵照 DESIGN.md "Quiet Workbench" 桌面版设计规范:
 * - 铺满 100% 宽度与高度（主工作区/全屏桌面面板）
 * - 纯色调分层 + 1px 细边框线
 * - Sage Signal (#9ed0ad / #477c59) 单一功能强调色
 * - Team Context (#8bb6dd / #3f6f98) 团队标识色
 * - Error Ink (#d2a8a2) 冲突提示
 * - 无阴影、无渐变、无毛玻璃，工业级高密度桌面工具
 */
export const SIDEBAR_VIEW_CSS = `
:host, .mcv-app {
  --mcv-bg-root: #111413;
  --mcv-bg-surface: #171a19;
  --mcv-bg-hover: #202523;
  --mcv-bg-selected: #29332e;
  --mcv-border: #2a2f2d;
  
  --mcv-ink-clear: #f2f4f3;
  --mcv-ink-body: #e7e9e8;
  --mcv-ink-muted: #858c89;
  
  --mcv-sage-signal: #9ed0ad;
  --mcv-sage-field: #21382a;
  
  --mcv-team-context: #8bb6dd;
  --mcv-team-field: #18222a;
  
  --mcv-error-ink: #d2a8a2;
  --mcv-error-field: #281b19;

  font-family: Inter, ui-sans-serif, system-ui, -apple-system, sans-serif;
  font-size: 13px;
  line-height: 1.5;
  color: var(--mcv-ink-body);
  background-color: var(--mcv-bg-root);
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  overflow: hidden;
}

.mcv-app[data-theme="light"] {
  --mcv-bg-root: #f5f7f6;
  --mcv-bg-surface: #eef2ef;
  --mcv-bg-hover: #e4eae6;
  --mcv-bg-selected: #dbe7df;
  --mcv-border: #d5ddd8;
  
  --mcv-ink-clear: #111614;
  --mcv-ink-body: #202522;
  --mcv-ink-muted: #56615b;
  
  --mcv-sage-signal: #477c59;
  --mcv-sage-field: #dcebe1;
  
  --mcv-team-context: #3f6f98;
  --mcv-team-field: #e3edf5;
  
  --mcv-error-ink: #b85c52;
  --mcv-error-field: #fbebe9;
}

/* --- Top Workbench Header Band --- */
.mcv-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  height: 48px;
  border-bottom: 1px solid var(--mcv-border);
  background-color: var(--mcv-bg-surface);
  flex-shrink: 0;
}

.mcv-header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.mcv-header-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--mcv-ink-clear);
  margin: 0;
}

.mcv-header-subtitle {
  font-size: 12px;
  color: var(--mcv-ink-muted);
}

.mcv-header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.mcv-icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 6px;
  border: 1px solid var(--mcv-border);
  background-color: var(--mcv-bg-root);
  color: var(--mcv-ink-body);
  cursor: pointer;
  padding: 0;
  transition: background-color 0.15s ease;
}

.mcv-icon-btn:hover {
  background-color: var(--mcv-bg-hover);
  color: var(--mcv-ink-clear);
}

/* --- Control & Filter Toolbar --- */
.mcv-controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 8px 20px;
  border-bottom: 1px solid var(--mcv-border);
  background-color: var(--mcv-bg-surface);
  flex-shrink: 0;
}

.mcv-tab-row {
  display: flex;
  background-color: var(--mcv-bg-root);
  padding: 2px;
  border-radius: 6px;
  border: 1px solid var(--mcv-border);
}

.mcv-tab-btn {
  padding: 0 16px;
  height: 30px;
  font-size: 12px;
  font-weight: 500;
  border: none;
  border-radius: 4px;
  background: transparent;
  color: var(--mcv-ink-muted);
  cursor: pointer;
  transition: all 0.15s ease;
}

.mcv-tab-btn:hover {
  color: var(--mcv-ink-body);
}

.mcv-tab-btn.active {
  background-color: var(--mcv-sage-field);
  color: var(--mcv-sage-signal);
  font-weight: 600;
}

.mcv-nav-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.mcv-nav-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--mcv-ink-clear);
  min-width: 140px;
  text-align: center;
}

.mcv-nav-actions {
  display: flex;
  align-items: center;
  gap: 4px;
}

.mcv-btn-sm {
  height: 28px;
  padding: 0 12px;
  font-size: 12px;
  border-radius: 4px;
  border: 1px solid var(--mcv-border);
  background-color: var(--mcv-bg-root);
  color: var(--mcv-ink-body);
  cursor: pointer;
}

.mcv-btn-sm:hover {
  background-color: var(--mcv-bg-hover);
  color: var(--mcv-ink-clear);
}

.mcv-filter-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.mcv-select {
  height: 28px;
  font-size: 12px;
  border-radius: 4px;
  border: 1px solid var(--mcv-border);
  background-color: var(--mcv-bg-root);
  color: var(--mcv-ink-body);
  padding: 0 8px;
  cursor: pointer;
}

.mcv-select:focus {
  outline: 2px solid var(--mcv-sage-signal);
}

/* --- Main Content Area (Full Desktop Width) --- */
.mcv-content {
  flex: 1;
  overflow: auto;
  position: relative;
  width: 100%;
}

/* --- Widescreen Week View Grid --- */
.mcv-week-grid {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  min-width: 800px;
}

.mcv-week-header {
  display: grid;
  grid-template-columns: 60px repeat(7, 1fr);
  border-bottom: 1px solid var(--mcv-border);
  background-color: var(--mcv-bg-surface);
  position: sticky;
  top: 0;
  z-index: 10;
}

.mcv-week-col-head {
  padding: 10px 4px;
  text-align: center;
  font-size: 12px;
  color: var(--mcv-ink-muted);
  border-left: 1px solid var(--mcv-border);
}

.mcv-week-col-head.today {
  color: var(--mcv-sage-signal);
  font-weight: 600;
  background-color: var(--mcv-sage-field);
}

.mcv-week-body {
  display: grid;
  grid-template-columns: 60px repeat(7, 1fr);
  position: relative;
  flex: 1;
}

.mcv-time-slot {
  height: 48px;
  font-size: 11px;
  color: var(--mcv-ink-muted);
  text-align: right;
  padding-right: 8px;
  border-bottom: 1px solid var(--mcv-border);
  box-sizing: border-box;
}

.mcv-day-col {
  position: relative;
  border-left: 1px solid var(--mcv-border);
}

.mcv-grid-cell {
  height: 48px;
  border-bottom: 1px solid var(--mcv-border);
  box-sizing: border-box;
}

/* Meeting Card on Desktop Grid */
.mcv-event-card {
  position: absolute;
  left: 4px;
  right: 4px;
  border-radius: 4px;
  padding: 6px 8px;
  font-size: 12px;
  background-color: var(--mcv-bg-hover);
  border-left: 3px solid var(--mcv-sage-signal);
  color: var(--mcv-ink-clear);
  overflow: hidden;
  box-sizing: border-box;
  cursor: pointer;
  transition: transform 0.1s ease, z-index 0.1s ease;
  z-index: 2;
  border: 1px solid var(--mcv-border);
  border-left-width: 3.5px;
}

.mcv-event-card:hover {
  transform: scale(1.01);
  z-index: 5;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.mcv-event-card.team {
  border-left-color: var(--mcv-team-context);
  background-color: var(--mcv-team-field);
}

.mcv-event-card.conflict {
  border: 1.5px dashed var(--mcv-error-ink);
  border-left: 3.5px solid var(--mcv-error-ink);
  animation: conflictPulse 2s infinite;
}

@keyframes conflictPulse {
  0% { box-shadow: 0 0 0 0 rgba(210, 168, 162, 0.4); }
  70% { box-shadow: 0 0 0 4px rgba(210, 168, 162, 0); }
  100% { box-shadow: 0 0 0 0 rgba(210, 168, 162, 0); }
}

.mcv-event-header-line {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 4px;
  margin-bottom: 2px;
}

.mcv-event-title {
  font-weight: 600;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
}

.mcv-event-badge {
  font-size: 10px;
  padding: 1px 4px;
  border-radius: 3px;
  background-color: var(--mcv-bg-selected);
  color: var(--mcv-ink-clear);
}

.mcv-event-time {
  font-size: 11px;
  color: var(--mcv-ink-muted);
}

/* --- Desktop Month View (Large Grid Cells) --- */
.mcv-month-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
}

.mcv-month-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px;
  background-color: var(--mcv-border);
  flex: 1;
}

.mcv-month-col-head {
  background-color: var(--mcv-bg-surface);
  text-align: center;
  padding: 8px 0;
  font-size: 12px;
  color: var(--mcv-ink-muted);
  font-weight: 600;
}

.mcv-month-cell {
  background-color: var(--mcv-bg-surface);
  min-height: 90px;
  padding: 6px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  cursor: pointer;
  transition: background-color 0.15s ease;
  overflow: hidden;
}

.mcv-month-cell:hover {
  background-color: var(--mcv-bg-hover);
}

.mcv-month-cell.heat-1 { background-color: rgba(158, 208, 173, 0.06); }
.mcv-month-cell.heat-2 { background-color: rgba(158, 208, 173, 0.14); }
.mcv-month-cell.heat-3 { background-color: rgba(158, 208, 173, 0.26); }

.mcv-month-cell-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.mcv-month-date {
  font-size: 12px;
  color: var(--mcv-ink-body);
  font-weight: 500;
}

.mcv-month-cell.other-month .mcv-month-date {
  color: var(--mcv-ink-muted);
  opacity: 0.4;
}

.mcv-month-cell.today .mcv-month-date {
  color: var(--mcv-sage-signal);
  font-weight: 700;
}

/* Month Cell Desktop Pill Rows */
.mcv-month-pill {
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 3px;
  background-color: var(--mcv-bg-selected);
  color: var(--mcv-ink-clear);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  border-left: 2.5px solid var(--mcv-sage-signal);
}

.mcv-month-pill.team {
  border-left-color: var(--mcv-team-context);
  background-color: var(--mcv-team-field);
}

.mcv-month-pill.conflict {
  border: 1px dashed var(--mcv-error-ink);
  border-left: 2.5px solid var(--mcv-error-ink);
}

.mcv-month-more {
  font-size: 10px;
  color: var(--mcv-ink-muted);
  padding-left: 4px;
}

/* --- Desktop Gantt View --- */
.mcv-gantt-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  min-width: 900px;
}

.mcv-gantt-header {
  display: flex;
  height: 36px;
  border-bottom: 1px solid var(--mcv-border);
  background-color: var(--mcv-bg-surface);
  position: sticky;
  top: 0;
  z-index: 10;
}

.mcv-gantt-header-label {
  width: 150px;
  padding: 8px 16px;
  font-size: 12px;
  font-weight: 600;
  color: var(--mcv-ink-muted);
  border-right: 1px solid var(--mcv-border);
}

.mcv-gantt-header-track {
  flex: 1;
  display: flex;
}

.mcv-gantt-hour-cell {
  flex: 1;
  text-align: center;
  font-size: 11px;
  color: var(--mcv-ink-muted);
  padding-top: 8px;
  border-right: 1px solid var(--mcv-border);
}

.mcv-gantt-row {
  display: flex;
  height: 52px;
  border-bottom: 1px solid var(--mcv-border);
  align-items: center;
}

.mcv-gantt-label {
  width: 150px;
  padding: 0 16px;
  font-size: 13px;
  font-weight: 500;
  color: var(--mcv-ink-clear);
  border-right: 1px solid var(--mcv-border);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex-shrink: 0;
}

.mcv-gantt-track {
  flex: 1;
  position: relative;
  height: 100%;
}

.mcv-now-line {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 2px;
  background-color: var(--mcv-sage-signal);
  z-index: 8;
}

/* --- Status Footer Bar --- */
.mcv-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  height: 28px;
  border-top: 1px solid var(--mcv-border);
  background-color: var(--mcv-bg-surface);
  font-size: 12px;
  color: var(--mcv-ink-muted);
  flex-shrink: 0;
}

.mcv-legend {
  display: flex;
  align-items: center;
  gap: 16px;
}

.mcv-legend-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

/* Empty State */
.mcv-empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: var(--mcv-ink-muted);
  text-align: center;
}
`;

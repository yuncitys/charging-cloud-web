/** Panel / sidebar / composer size constants for OpsAgentChat. */

export const SIZE_PRESETS = {
  compact: { panelWidth: 380, panelHeight: 480 },
  default: { panelWidth: 420, panelHeight: 560 },
  large: { panelWidth: 520, panelHeight: 680 }
}

export const DEFAULT_UI = {
  panelWidth: 420,
  panelHeight: 560,
  sidebarOpen: true,
  sidebarWidth: 176
}

export const PANEL_MIN_W = 360
export const PANEL_MIN_H = 400
export const PANEL_MAX_W = 900
export const PANEL_MAX_H = 900
export const VIEWPORT_GUTTER = 48

export const SIDEBAR_MIN = 120
export const SIDEBAR_MAX = 320

export const COMPOSER_MIN_H = 36
export const COMPOSER_MAX_H = 120

export const SESSION_LIST_INITIAL = 15
export const SESSION_LIST_MORE = 5

export function suggestPanelSize() {
  const vw = typeof window !== 'undefined' ? window.innerWidth : 1280
  const vh = typeof window !== 'undefined' ? window.innerHeight : 800
  const w = Math.min(PANEL_MAX_W, Math.max(PANEL_MIN_W, Math.floor(vw * 0.32)))
  const h = Math.min(PANEL_MAX_H, Math.max(PANEL_MIN_H, Math.floor(vh * 0.72)))
  return { panelWidth: w, panelHeight: h }
}

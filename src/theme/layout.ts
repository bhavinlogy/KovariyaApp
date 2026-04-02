/**
 * Bottom padding for scroll content when using the floating tab bar.
 * Tune if the tab bar visual height changes.
 */
export const FLOATING_TAB_BAR_VISUAL_HEIGHT = 76;

/** LinearGradient `end` for primary screen headers — 60° from horizontal (cos60°, sin60°). */
export const GRADIENT_60_END = { x: 0.5, y: 0.8660254037844386 } as const;

export function getFloatingTabBarBottomPadding(safeAreaBottom: number): number {
  return FLOATING_TAB_BAR_VISUAL_HEIGHT + safeAreaBottom + 12;
}

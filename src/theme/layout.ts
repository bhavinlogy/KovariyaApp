/**
 * Bottom padding for scroll content when using the floating tab bar.
 * Tune if the tab bar visual height changes.
 */
export const FLOATING_TAB_BAR_VISUAL_HEIGHT = 68;

export function getFloatingTabBarBottomPadding(safeAreaBottom: number): number {
  return FLOATING_TAB_BAR_VISUAL_HEIGHT + safeAreaBottom + 12;
}

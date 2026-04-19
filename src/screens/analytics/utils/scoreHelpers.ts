/**
 * Colour-rule helpers used across all analytics components.
 * Centralised here so every gauge / card / chip uses the same thresholds.
 */

/* ─── Score → colour ─── */
export function scoreColor(pct: number): string {
	if (pct >= 85) return '#2E8B57'; // Dark Green — Excellent
	if (pct >= 70) return '#5CB85C'; // Light Green — Consistent
	if (pct >= 50) return '#E8A04A'; // Amber — Average
	return '#E85D5D'; // Red — Needs Effort
}

export function scoreBg(pct: number): string {
	if (pct >= 85) return 'rgba(46, 139, 87, 0.10)';
	if (pct >= 70) return 'rgba(92, 184, 92, 0.10)';
	if (pct >= 50) return 'rgba(232, 160, 74, 0.10)';
	return 'rgba(232, 93, 93, 0.10)';
}

export function scoreLabel(pct: number): string {
	if (pct >= 85) return 'Excellent';
	if (pct >= 70) return 'Consistent';
	if (pct >= 50) return 'Average';
	return 'Needs Effort';
}

/* ─── Heatmap cell colour ─── */
export function heatmapColor(score: number | null): string {
	if (score === null) return 'rgba(0,0,0,0.04)'; // neutral empty
	if (score >= 85) return '#2E8B57';
	if (score >= 70) return '#7BCF7B';
	if (score >= 50) return '#F5C142';
	return '#E87070';
}

/**
 * Dim background tint based on score colour — used as card background
 * to give a gentle colour wash without being loud.
 */
export function scoreTint(pct: number): string {
	if (pct >= 85) return 'rgb(198, 221, 205)';  // green wash
	if (pct >= 70) return 'rgb(205, 252, 205)';  // light green wash
	if (pct >= 50) return 'rgba(232, 160, 74)';  // amber wash
	return 'rgba(232, 93, 93)';                   // red wash
}

/**
 * Subtle border colour that echoes the score fill — keeps cards
 * visually cohesive with the tint background.
 */
export function scoreBorder(pct: number): string {
	if (pct >= 85) return 'rgba(46, 139, 87, 0.18)';
	if (pct >= 70) return 'rgba(92, 184, 92, 0.18)';
	if (pct >= 50) return 'rgba(232, 160, 74, 0.18)';
	return 'rgba(232, 93, 93, 0.18)';
}


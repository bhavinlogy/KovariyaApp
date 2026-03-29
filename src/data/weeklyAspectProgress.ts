import { DASHBOARD_RATING_ASPECTS } from './aspectRating';

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

/** Deterministic jitter so each child sees a distinct but stable curve. */
function mix(childId: string, aspectId: string, dayIndex: number): number {
  let h = 0;
  const s = `${childId}:${aspectId}:${dayIndex}`;
  for (let i = 0; i < s.length; i++) {
    h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h) % 19;
}

/** Short labels aligned with Mon → Sun (same order as dashboard week strip). */
export const WEEKLY_PROGRESS_DAYS = [
  { id: 'mon', label: 'Mon' },
  { id: 'tue', label: 'Tue' },
  { id: 'wed', label: 'Wed' },
  { id: 'thu', label: 'Thu' },
  { id: 'fri', label: 'Fri' },
  { id: 'sat', label: 'Sat' },
  { id: 'sun', label: 'Sun' },
] as const;

export type WeeklyAspectSeriesRow = {
  aspectId: string;
  /** Seven values (0–100), one per day in `WEEKLY_PROGRESS_DAYS` order. */
  values: number[];
};

/**
 * Mock weekly progress per aspect for the selected child.
 * Replace with API payload when available.
 */
export function getWeeklyAspectProgressSeries(childId: string): WeeklyAspectSeriesRow[] {
  return DASHBOARD_RATING_ASPECTS.map((aspect) => {
    const base = aspect.progressPercent;
    const values = WEEKLY_PROGRESS_DAYS.map((_, dayIndex) => {
      const jitter = mix(childId, aspect.id, dayIndex) - 9;
      const slope = (dayIndex - 3) * 1.4;
      return clamp(Math.round(base + jitter + slope), 0, 100);
    });
    return { aspectId: aspect.id, values };
  });
}

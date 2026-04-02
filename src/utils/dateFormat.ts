/**
 * Single locale for user-visible dates across the app (cards, detail, profile).
 */
export const APP_DATE_LOCALE = 'en-GB';

/**
 * Formats a calendar date for display. Accepts `YYYY-MM-DD` or full ISO strings.
 * Uses noon local time for date-only strings to avoid off-by-one from UTC midnight.
 */
export function formatAppDate(isoDate: string): string {
  const normalized = isoDate.trim();
  if (!normalized) {
    return '';
  }
  const parseInput =
    normalized.length === 10 && normalized[4] === '-' && normalized[7] === '-'
      ? `${normalized}T12:00:00`
      : normalized;
  const t = Date.parse(parseInput);
  if (Number.isNaN(t)) {
    return isoDate;
  }
  return new Intl.DateTimeFormat(APP_DATE_LOCALE, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(t));
}

/**
 * Month and year (e.g. membership / "member since" lines).
 */
export function formatAppMonthYear(isoOrDate: string | Date): string {
  const d = typeof isoOrDate === 'string' ? new Date(isoOrDate) : isoOrDate;
  if (Number.isNaN(d.getTime())) {
    return '';
  }
  return new Intl.DateTimeFormat(APP_DATE_LOCALE, {
    month: 'short',
    year: 'numeric',
  }).format(d);
}

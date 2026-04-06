/** Age in full years from a calendar date string `YYYY-MM-DD` (local noon). */
export function ageFromIsoDate(iso: string): number {
  const t = Date.parse(`${iso.trim()}T12:00:00`);
  if (Number.isNaN(t)) {
    return 0;
  }
  const birth = new Date(t);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age -= 1;
  }
  return Math.max(0, age);
}

export function toIsoDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

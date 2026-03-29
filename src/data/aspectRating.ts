/** Behaviour aspects — main parent rating action on Home. */
export type RatingAspectDefinition = {
  id: string;
  name: string;
  /** MaterialIcons glyph name */
  iconName: string;
  softBg: string;
  borderColor: string;
  accent: string;
  iconTint: string;
  /** 0–100 mock progress; replace with API. */
  progressPercent: number;
  /** Change vs last week (percentage points), e.g. +4 or -2. */
  weekDeltaPercent: number;
};

export const DASHBOARD_RATING_ASPECTS: RatingAspectDefinition[] = [
  {
    id: 'respect',
    name: 'Respect',
    iconName: 'volunteer-activism',
    softBg: '#F3F0FF',
    borderColor: 'rgba(124, 106, 232, 0.35)',
    accent: '#7C6AE8',
    iconTint: '#5E4FD4',
    progressPercent: 78,
    weekDeltaPercent: 5,
  },
  {
    id: 'responsibility',
    name: 'Responsibility',
    iconName: 'assignment-turned-in',
    softBg: '#EEF4FF',
    borderColor: 'rgba(91, 141, 239, 0.35)',
    accent: '#5B8DEF',
    iconTint: '#3B6FD9',
    progressPercent: 64,
    weekDeltaPercent: -3,
  },
  {
    id: 'kindness',
    name: 'Kindness',
    iconName: 'favorite',
    softBg: '#FFF0F6',
    borderColor: 'rgba(232, 121, 168, 0.35)',
    accent: '#E879A8',
    iconTint: '#D45A8F',
    progressPercent: 86,
    weekDeltaPercent: 8,
  },
  {
    id: 'discipline',
    name: 'Discipline',
    iconName: 'self-improvement',
    softBg: '#FFF4E8',
    borderColor: 'rgba(232, 149, 80, 0.38)',
    accent: '#E89550',
    iconTint: '#D9782E',
    progressPercent: 71,
    weekDeltaPercent: 2,
  },
  {
    id: 'civic',
    name: 'Civic Sense',
    iconName: 'public',
    softBg: '#E8FAF8',
    borderColor: 'rgba(63, 175, 168, 0.35)',
    accent: '#3FAFA8',
    iconTint: '#2D8B85',
    progressPercent: 69,
    weekDeltaPercent: -1,
  },
];

export type ScaleTier = 'negative' | 'positive';

export type ScaleOption = {
  label: string;
  value: number;
  tier: ScaleTier;
};

/** Exact order required by product. */
export const RATING_SCALE_OPTIONS: ScaleOption[] = [
  { label: 'Needs Attention', value: -4, tier: 'negative' },
  { label: 'Below Expectations', value: -2, tier: 'negative' },
  { label: 'Inconsistent', value: -1, tier: 'negative' },
  { label: 'Improving', value: 1, tier: 'positive' },
  { label: 'Strong', value: 2, tier: 'positive' },
  { label: 'Excellent', value: 4, tier: 'positive' },
];

export type ReasonChipDef = { id: string; label: string; kind: 'positive' | 'negative' };

export const REASON_CHIPS_POSITIVE: ReasonChipDef[] = [
  { id: 'p0', label: 'Listened well', kind: 'positive' },
  { id: 'p1', label: 'Showed empathy', kind: 'positive' },
  { id: 'p2', label: 'Took responsibility', kind: 'positive' },
  { id: 'p3', label: 'Helpful at home', kind: 'positive' },
  { id: 'p4', label: 'Polite tone', kind: 'positive' },
  { id: 'p5', label: 'Finished tasks', kind: 'positive' },
  { id: 'p6', label: 'Positive attitude', kind: 'positive' },
];

export const REASON_CHIPS_NEGATIVE: ReasonChipDef[] = [
  { id: 'n0', label: 'Dismissive', kind: 'negative' },
  { id: 'n1', label: 'Interrupting', kind: 'negative' },
  { id: 'n2', label: 'Avoiding chores', kind: 'negative' },
  { id: 'n3', label: 'Raised voice', kind: 'negative' },
  { id: 'n4', label: 'Defensive', kind: 'negative' },
  { id: 'n5', label: 'Rushed / careless', kind: 'negative' },
  { id: 'n6', label: 'Withdrawn', kind: 'negative' },
];

export const MAX_REASON_CHIPS = 2;

export type AspectRatingPayload = {
  aspectId: string;
  scale: number;
  reasonIds: string[];
  note: string;
};

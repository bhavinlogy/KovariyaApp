import { colors } from '../theme';
import { DASHBOARD_RATING_ASPECTS, type RatingAspectDefinition } from './aspectRating';

/* ─── Helper ─── */
function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

/* ─── SDS score ─── */
export type SdsAnalytics = {
  percent: number;
  trend: number;
  weekHistory: number[]; // 4 weeks rolling (oldest → newest)
};

const SDS_BY_CHILD: Record<string, SdsAnalytics> = {
  '1': { percent: 78, trend: 5, weekHistory: [68, 71, 73, 78] },
  '2': { percent: 61, trend: -4, weekHistory: [72, 68, 65, 61] },
  '3': { percent: 89, trend: 8, weekHistory: [74, 79, 81, 89] },
};

export function getSdsAnalytics(childId: string): SdsAnalytics {
  return SDS_BY_CHILD[childId] ?? SDS_BY_CHILD['1'];
}

/* ─── Family Score (FS) ─── */
export type FamilyScoreData = {
  score: number;
  trend: number;
};

const FS_BY_CHILD: Record<string, FamilyScoreData> = {
  '1': { score: 84, trend: 3 },
  '2': { score: 72, trend: -2 },
  '3': { score: 91, trend: 6 },
};

export function getFamilyScore(childId: string): FamilyScoreData {
  return FS_BY_CHILD[childId] ?? FS_BY_CHILD['1'];
}

/* ─── Trust Meter ─── */
export type TrustMeterData = {
  level: number; // 0-100
  label: string;
  trend: number;
};

const TRUST_BY_CHILD: Record<string, TrustMeterData> = {
  '1': { level: 72, label: 'Reliable', trend: 4 },
  '2': { level: 54, label: 'Building', trend: -3 },
  '3': { level: 88, label: 'Trusted', trend: 7 },
};

export function getTrustMeter(childId: string): TrustMeterData {
  return TRUST_BY_CHILD[childId] ?? TRUST_BY_CHILD['1'];
}

/* ─── Aspect Scores ─── */
export type AspectScoreRow = {
  id: string;
  name: string;
  iconName: string;
  accent: string;
  softBg: string;
  borderColor: string;
  score: number; // 0-100
  change: number; // week-over-week
  strength: boolean; // true => strength, false => weak area
};

export function getAspectScores(childId: string): AspectScoreRow[] {
  return DASHBOARD_RATING_ASPECTS.map((a) => {
    const h = hash(`${childId}:${a.id}`);
    const base = a.progressPercent;
    const jitter = (h % 15) - 7;
    const score = clamp(base + jitter, 20, 98);
    const change = ((h % 21) - 10);
    return {
      id: a.id,
      name: a.name,
      iconName: a.iconName,
      accent: a.accent,
      softBg: a.softBg,
      borderColor: a.borderColor,
      score: Math.round(score),
      change,
      strength: score >= 70,
    };
  });
}

/* ─── Weekly graph data ─── */
export const WEEK_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;

export type WeeklyGraphRow = {
  day: string;
  positive: number; // 0-10
  needsWork: number; // 0-10
};

export function getWeeklyGraph(childId: string): WeeklyGraphRow[] {
  return WEEK_DAYS.map((day, i) => {
    const h = hash(`${childId}:week:${i}`);
    const pos = clamp(5 + ((h % 11) - 5) * 0.5, 3, 9.5);
    const neg = clamp(10 - pos + ((h % 7) - 3) * 0.3, 0.5, 4);
    return {
      day,
      positive: Math.round(pos * 10) / 10,
      needsWork: Math.round(neg * 10) / 10,
    };
  });
}

/* ─── Monthly graph data ─── */
export const MONTH_WEEKS = ['Week 1', 'Week 2', 'Week 3', 'Week 4'] as const;

export type MonthlyGraphRow = {
  week: string;
  sds: number;
  fs: number;
  trust: number;
};

export function getMonthlyGraph(childId: string): MonthlyGraphRow[] {
  const sds = getSdsAnalytics(childId);
  const fs = getFamilyScore(childId);
  const trust = getTrustMeter(childId);
  return MONTH_WEEKS.map((week, i) => {
    const h = hash(`${childId}:month:${i}`);
    const jitter = (h % 9) - 4;
    return {
      week,
      sds: clamp(sds.weekHistory[i] ?? sds.percent + jitter, 20, 100),
      fs: clamp(fs.score + jitter - (3 - i) * 2, 20, 100),
      trust: clamp(trust.level + jitter - (3 - i) * 3, 20, 100),
    };
  });
}

/* ─── AI Guidance ─── */
export type GuidanceItem = {
  id: string;
  type: 'tip' | 'warning' | 'suggestion';
  title: string;
  message: string;
};

const GUIDANCE_BY_CHILD: Record<string, GuidanceItem[]> = {
  '1': [
    {
      id: 'g1',
      type: 'tip',
      title: 'Strong in Kindness',
      message: 'Keep praising empathetic behaviour — consistency builds lasting values.',
    },
    {
      id: 'g2',
      type: 'warning',
      title: 'Discipline dip',
      message: 'Two low days this week. Try a 10-minute focused homework block before play.',
    },
    {
      id: 'g3',
      type: 'suggestion',
      title: 'Try gratitude journaling',
      message: 'A bedtime gratitude moment can boost Respect and Kindness scores.',
    },
  ],
  '2': [
    {
      id: 'g1',
      type: 'suggestion',
      title: 'Responsibility building',
      message: 'Pair chores with a clear checklist and celebrate completion.',
    },
    {
      id: 'g2',
      type: 'warning',
      title: 'Screen time pattern',
      message: 'Screen time before homework correlates with lower Discipline ratings.',
    },
  ],
  '3': [
    {
      id: 'g1',
      type: 'tip',
      title: 'Excellent trajectory',
      message: 'SDS is up 8% this week — celebrate this momentum together.',
    },
    {
      id: 'g2',
      type: 'suggestion',
      title: 'Community engagement',
      message: 'Civic Sense had one dip — a family community project could help.',
    },
  ],
};

export function getGuidance(childId: string): GuidanceItem[] {
  return GUIDANCE_BY_CHILD[childId] ?? GUIDANCE_BY_CHILD['1'];
}

/* ─── Badges ─── */
export type BadgeItem = {
  id: string;
  iconName: string;
  label: string;
  description: string;
  earned: boolean;
  color: string;
};

const BADGES_BY_CHILD: Record<string, BadgeItem[]> = {
  '1': [
    { id: 'b1', iconName: 'emoji-events', label: '7-Day Streak', description: 'Logged behaviour 7 days in a row', earned: true, color: colors.peach },
    { id: 'b2', iconName: 'star', label: 'Kindness Star', description: 'Kindness score above 80% for a week', earned: true, color: colors.lavender },
    { id: 'b3', iconName: 'military-tech', label: 'Top Performer', description: 'SDS above 90% for a week', earned: false, color: colors.mint },
    { id: 'b4', iconName: 'workspace-premium', label: 'Trust Builder', description: 'Trust meter reached Reliable level', earned: true, color: colors.sky },
  ],
  '2': [
    { id: 'b1', iconName: 'emoji-events', label: '3-Day Streak', description: 'Logged behaviour 3 days in a row', earned: true, color: colors.peach },
    { id: 'b2', iconName: 'star', label: 'Kindness Star', description: 'Kindness score above 80% for a week', earned: false, color: colors.lavender },
    { id: 'b3', iconName: 'trending-up', label: 'Improver', description: 'Any aspect improved 15%+ in a week', earned: true, color: colors.mint },
  ],
  '3': [
    { id: 'b1', iconName: 'emoji-events', label: '14-Day Streak', description: 'Logged behaviour 14 days in a row', earned: true, color: colors.peach },
    { id: 'b2', iconName: 'star', label: 'Kindness Star', description: 'Kindness score above 80% for a week', earned: true, color: colors.lavender },
    { id: 'b3', iconName: 'military-tech', label: 'Top Performer', description: 'SDS above 90% for a week', earned: true, color: colors.mint },
    { id: 'b4', iconName: 'workspace-premium', label: 'Trust Builder', description: 'Trust meter reached Trusted level', earned: true, color: colors.sky },
    { id: 'b5', iconName: 'verified', label: 'All-Rounder', description: 'All aspects above 70%', earned: true, color: '#F0C6E8' },
  ],
};

export function getBadges(childId: string): BadgeItem[] {
  return BADGES_BY_CHILD[childId] ?? BADGES_BY_CHILD['1'];
}

/* ─── Strengths / Weak areas helper ─── */
export type StrengthWeakness = {
  strengths: AspectScoreRow[];
  weakAreas: AspectScoreRow[];
  strengthSummary: string;
  weakSummary: string;
};

export function getStrengthsWeaknesses(childId: string): StrengthWeakness {
  const scores = getAspectScores(childId);
  const sorted = [...scores].sort((a, b) => b.score - a.score);
  const strengths = sorted.filter(s => s.strength);
  const weakAreas = sorted.filter(s => !s.strength);

  const topNames = strengths.slice(0, 2).map(s => s.name).join(' and ');
  const weakNames = weakAreas.slice(0, 2).map(s => s.name).join(' and ');

  return {
    strengths,
    weakAreas,
    strengthSummary: strengths.length > 0
      ? `Showing consistent growth in ${topNames}. These scores have been solid all week.`
      : 'All areas need attention — small daily improvements can make a big difference.',
    weakSummary: weakAreas.length > 0
      ? `${weakNames} ${weakAreas.length === 1 ? 'needs' : 'need'} more focus. Small resets and structured time will help.`
      : 'No weak areas — every aspect is in the green zone!',
  };
}

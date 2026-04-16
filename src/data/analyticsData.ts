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

/* ─── BSI (Behaviour Score Index) — renamed from SDS ─── */
export type SdsAnalytics = {
  percent: number;
  trend: number;
  weekHistory: number[]; // 4 weeks rolling (oldest → newest)
  label: string; // Needs Effort / Average / Consistent / Excellent
};

function bsiLabel(pct: number): string {
  if (pct >= 85) return 'Excellent';
  if (pct >= 70) return 'Consistent';
  if (pct >= 50) return 'Average';
  return 'Needs Effort';
}

const SDS_BY_CHILD: Record<string, SdsAnalytics> = {
  '1': { percent: 78, trend: 5, weekHistory: [68, 71, 73, 78], label: bsiLabel(78) },
  '2': { percent: 61, trend: -4, weekHistory: [72, 68, 65, 61], label: bsiLabel(61) },
  '3': { percent: 89, trend: 8, weekHistory: [74, 79, 81, 89], label: bsiLabel(89) },
};

export function getSdsAnalytics(childId: string): SdsAnalytics {
  return SDS_BY_CHILD[childId] ?? SDS_BY_CHILD['1'];
}

/* ─── Family Score (FS) ─── */
export type FamilyScoreData = {
  score: number;
  trend: number;
  subtitle: string;
};

const FS_BY_CHILD: Record<string, FamilyScoreData> = {
  '1': { score: 84, trend: 4, subtitle: 'Parental Involvement' },
  '2': { score: 72, trend: -2, subtitle: 'Parental Involvement' },
  '3': { score: 91, trend: 6, subtitle: 'Parental Involvement' },
};

export function getFamilyScore(childId: string): FamilyScoreData {
  return FS_BY_CHILD[childId] ?? FS_BY_CHILD['1'];
}

/* ─── Trust Meter ─── */
export type TrustMeterData = {
  level: number; // 0-100
  label: string;
  trend: number;
  subtitle: string;
};

const TRUST_BY_CHILD: Record<string, TrustMeterData> = {
  '1': { level: 72, label: 'Reliable', trend: 0, subtitle: 'Trustworthy Behavior' },
  '2': { level: 54, label: 'Building', trend: -3, subtitle: 'Trustworthy Behavior' },
  '3': { level: 88, label: 'Trusted', trend: 7, subtitle: 'Trustworthy Behavior' },
};

export function getTrustMeter(childId: string): TrustMeterData {
  return TRUST_BY_CHILD[childId] ?? TRUST_BY_CHILD['1'];
}

/* ─── Parent Consistency Score ─── */
export type ParentConsistencyData = {
  score: number;
  trend: number;
  subtitle: string;
};

const PC_BY_CHILD: Record<string, ParentConsistencyData> = {
  '1': { score: 85, trend: 3, subtitle: 'Tracking Accuracy' },
  '2': { score: 68, trend: -5, subtitle: 'Tracking Accuracy' },
  '3': { score: 92, trend: 4, subtitle: 'Tracking Accuracy' },
};

export function getParentConsistency(childId: string): ParentConsistencyData {
  return PC_BY_CHILD[childId] ?? PC_BY_CHILD['1'];
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

/* ─── Dual Trend Data (BSI + Parent Consistency lines) ─── */
export type DualTrendRow = {
  label: string;
  bsi: number;
  parentConsistency: number;
};

export function getDualTrendData(childId: string): DualTrendRow[] {
  const bsi = getSdsAnalytics(childId);
  const pc = getParentConsistency(childId);
  return WEEK_DAYS.map((day, i) => {
    const h = hash(`${childId}:dual:${i}`);
    const jitter = (h % 9) - 4;
    return {
      label: day,
      bsi: clamp(bsi.percent + jitter - (6 - i) * 1.5, 30, 100),
      parentConsistency: clamp(pc.score + jitter - (6 - i) * 1.2, 30, 100),
    };
  });
}

/* ─── Daily Behaviour Score (DBS) heatmap data ─── */
export type DailyBehaviourScore = {
  date: string; // YYYY-MM-DD
  score: number | null; // null = no data
};

export function getDailyBehaviourScores(childId: string, year: number, month: number): DailyBehaviourScore[] {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();
  const result: DailyBehaviourScore[] = [];

  for (let d = 1; d <= daysInMonth; d++) {
    const dateObj = new Date(year, month, d);
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

    // Future dates have no data
    if (dateObj > today) {
      result.push({ date: dateStr, score: null });
      continue;
    }

    const h = hash(`${childId}:dbs:${dateStr}`);
    // ~15% chance of no data
    if (h % 7 === 0) {
      result.push({ date: dateStr, score: null });
    } else {
      const score = clamp(40 + (h % 61), 20, 100);
      result.push({ date: dateStr, score });
    }
  }
  return result;
}

/* ─── Summary Counters ─── */
export type SummaryCounters = {
  totalLogs: number;
  activeDays: number;
  totalEntries: number;
  streak: number;
};

const COUNTERS_BY_CHILD: Record<string, SummaryCounters> = {
  '1': { totalLogs: 88, activeDays: 14, totalEntries: 30, streak: 8 },
  '2': { totalLogs: 42, activeDays: 8, totalEntries: 18, streak: 3 },
  '3': { totalLogs: 124, activeDays: 21, totalEntries: 45, streak: 14 },
};

export function getSummaryCounters(childId: string): SummaryCounters {
  return COUNTERS_BY_CHILD[childId] ?? COUNTERS_BY_CHILD['1'];
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

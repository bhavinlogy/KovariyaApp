import type { AIInsightsPayload } from '../types';

/**
 * Mock AI Insights per child — replace with API that aggregates ratings + report text.
 * Positive block uses encouragement-style headings; attention block flags improvement areas.
 */
export function getAIInsightsForChild(childId: string): AIInsightsPayload {
  const byChild: Record<string, AIInsightsPayload> = {
    '1': {
      title: 'AI Insights',
      subtitle: 'Short summaries from what you log each day.',
      sourceLabel: 'Based on daily ratings & reports · last 7 days',
      positive: {
        heading: 'Keep it up!',
        subheading: 'These patterns are working well right now.',
        iconName: 'emoji-events',
        lines: [
          {
            id: 'p1',
            text: 'Kindness and Respect scores stayed strong — your notes mention empathy and calm tone at home.',
          },
          {
            id: 'p2',
            text: 'Yesterday’s report snapshot flagged “finished tasks on time” — that’s a clear win to repeat.',
          },
          {
            id: 'p3',
            text: 'Weekly average for positive reasons is up vs last week; consistency is showing.',
          },
        ],
      },
      attention: {
        heading: 'Needs attention',
        subheading: 'Small shifts here can lift the whole week.',
        iconName: 'report-problem',
        lines: [
          {
            id: 'a1',
            text: 'Discipline dipped on two days — ratings noted rushed homework; try one short “focus block” before dinner.',
          },
          {
            id: 'a2',
            text: 'One voice note flagged interrupting during family chat — a gentle cue before speaking may help.',
          },
        ],
      },
    },
    '2': {
      title: 'AI Insights',
      subtitle: 'Short summaries from what you log each day.',
      sourceLabel: 'Based on daily ratings & reports · last 7 days',
      positive: {
        heading: 'Nice momentum!',
        subheading: 'You’re capturing the wins — keep naming them.',
        iconName: 'emoji-events',
        lines: [
          {
            id: 'p1',
            text: 'Responsibility ratings improved Thu–Sat; your reports mention independent planning for school tasks.',
          },
          {
            id: 'p2',
            text: 'Civic Sense held steady with positive notes on courtesy outside home.',
          },
        ],
      },
      attention: {
        heading: 'Needs attention',
        subheading: 'Prioritize these next — they show up across ratings.',
        iconName: 'priority-high',
        lines: [
          {
            id: 'a1',
            text: 'Kindness had one low day with “raised voice” reasons — consider a reset ritual after school.',
          },
          {
            id: 'a2',
            text: 'Report summary asked for follow-up on screen time before homework; try a fixed start time.',
          },
          {
            id: 'a3',
            text: 'Two “avoiding chores” chips this week — pair chores with a clear checklist and one reward.',
          },
        ],
      },
    },
    '3': {
      title: 'AI Insights',
      subtitle: 'Short summaries from what you log each day.',
      sourceLabel: 'Based on daily ratings & reports · last 7 days',
      positive: {
        heading: 'You’re on a roll!',
        subheading: 'Lots of green flags in recent entries.',
        iconName: 'verified',
        lines: [
          {
            id: 'p1',
            text: 'Ratings show Excellent / Strong on most days; notes highlight polite tone and listening.',
          },
          {
            id: 'p2',
            text: 'Teacher-style report lines align with your Kindness & Discipline scores — great alignment.',
          },
        ],
      },
      attention: {
        heading: 'Needs attention',
        subheading: 'One area to watch — early action helps.',
        iconName: 'warning',
        lines: [
          {
            id: 'a1',
            text: 'Civic Sense had a single dip — one note mentioned litter awareness; a quick chat on community care could help.',
          },
        ],
      },
    },
  };

  return byChild[childId] ?? byChild['1'];
}

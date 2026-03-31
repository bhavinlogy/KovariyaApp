export type MentorMissionType = 'daily-habit' | 'activity-based';
export type MentorMissionStatus = 'in-progress' | 'completed' | 'missed' | 'not-started';

export type MentorMissionHistoryEntry = {
  date: string;
  status: 'done' | 'missed';
  note?: string;
};

export type MentorMissionTimelineEntry = {
  label: string;
  dateTime: string;
};

export type MentorMission = {
  id: string;
  title: string;
  description: string;
  missionType: MentorMissionType;
  startDate: string;
  endDate: string;
  progressPercent: number;
  status: MentorMissionStatus;
  timeline: MentorMissionTimelineEntry[];
  completionHistory: MentorMissionHistoryEntry[];
};

export const MENTOR_ASSIGNED_MISSIONS: MentorMission[] = [
  {
    id: 'm1',
    title: 'Respectful Morning Start',
    description: 'Start the day with one calm greeting and complete routine steps on time.',
    missionType: 'daily-habit',
    startDate: '2026-03-28',
    endDate: '2026-04-10',
    progressPercent: 64,
    status: 'in-progress',
    timeline: [
      { label: 'Mentor assigned mission', dateTime: '2026-03-28 08:30' },
      { label: 'Parent reviewed expectations', dateTime: '2026-03-28 19:10' },
      { label: 'Daily check-ins active this week', dateTime: '2026-03-30 07:45' },
      { label: 'Final review due on end date', dateTime: '2026-04-10 18:00' },
    ],
    completionHistory: [
      { date: '2026-03-28', status: 'done' },
      { date: '2026-03-29', status: 'missed' },
      { date: '2026-03-30', status: 'done' },
      { date: '2026-03-31', status: 'done' },
    ],
  },
  {
    id: 'm2',
    title: 'Homework Focus Sprint',
    description: 'Complete a 20-minute focused study block and capture one work sample.',
    missionType: 'activity-based',
    startDate: '2026-03-27',
    endDate: '2026-04-07',
    progressPercent: 46,
    status: 'missed',
    timeline: [
      { label: 'Mission started', dateTime: '2026-03-27 16:20' },
      { label: 'Tutor notes shared with parent', dateTime: '2026-03-28 20:05' },
      { label: 'Evidence upload required every two days', dateTime: '2026-03-29 18:30' },
      { label: 'Checkpoint with mentor pending', dateTime: '2026-04-01 17:00' },
    ],
    completionHistory: [
      { date: '2026-03-27', status: 'done', note: 'Worksheet uploaded' },
      { date: '2026-03-28', status: 'missed' },
      { date: '2026-03-29', status: 'done', note: 'Reading summary uploaded' },
      { date: '2026-03-30', status: 'missed' },
    ],
  },
  {
    id: 'm3',
    title: 'Kind Action Journal',
    description: 'Log one kind action daily and discuss reflection notes during dinner.',
    missionType: 'daily-habit',
    startDate: '2026-03-30',
    endDate: '2026-04-15',
    progressPercent: 22,
    status: 'not-started',
    timeline: [
      { label: 'Mission assigned', dateTime: '2026-03-30 09:15' },
      { label: 'Parent orientation complete', dateTime: '2026-03-30 20:40' },
      { label: 'Journal phase in progress', dateTime: '2026-03-31 07:30' },
      { label: 'Mentor review in week 2', dateTime: '2026-04-08 18:15' },
    ],
    completionHistory: [
      { date: '2026-03-30', status: 'missed' },
      { date: '2026-03-31', status: 'done', note: 'Helped younger sibling with puzzle' },
    ],
  },
];

export function formatMissionTypeLabel(type: MentorMissionType): string {
  return type === 'daily-habit' ? 'Daily Habit' : 'Activity-Based';
}

export function formatMissionStatusLabel(status: MentorMissionStatus): string {
  switch (status) {
    case 'completed':
      return 'Completed';
    case 'missed':
      return 'Missed';
    case 'in-progress':
      return 'In Progress';
    default:
      return 'Not Started';
  }
}

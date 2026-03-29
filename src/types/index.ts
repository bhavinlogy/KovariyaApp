export interface Child {
  id: string;
  name: string;
  age: number;
  avatar?: string;
  dailyScore?: number;
  trustMeter?: number;
  confidenceIndicator?: number;
}

export interface BehaviourAspect {
  id: string;
  name: string;
  description: string;
  rating: number;
  reasons?: string[];
  note?: string;
}

export interface Goal {
  id: string;
  title: string;
  description: string;
  progress: number;
  target: number;
  deadline: string;
  reward: string;
  isActive: boolean;
}

export type MissionSubmissionStatus = 'pending' | 'submitted' | 'approved';

export interface Mission {
  id: string;
  title: string;
  description: string;
  type: 'photo' | 'voice' | 'text';
  points: number;
  /** Workflow status shown on cards and drives mentor review. */
  submissionStatus: MissionSubmissionStatus;
  evidenceTypes: Array<'photo' | 'voice' | 'text'>;
  assignedBy: 'Mentor' | 'School';
  submission?: {
    media?: string;
    text?: string;
    timestamp: string;
  };
}

export interface Quiz {
  id: string;
  title: string;
  questions: number;
  completed: boolean;
  score?: number;
  time?: string;
  /** Shown on quiz cards (e.g. "~8 min"). */
  estimatedMinutes?: number;
  category?: string;
}

export interface Announcement {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high';
}

export interface AnalyticsData {
  weeklyTrends: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      color: string;
    }[];
  };
  behaviourBreakdown: {
    aspect: string;
    score: number;
    change: number;
  }[];
  scoreComparison: {
    current: number;
    previous: number;
    average: number;
  };
  goalProgress: {
    completed: number;
    total: number;
    onTrack: boolean;
  };
}

export interface AIGuidance {
  id: string;
  title: string;
  message: string;
  type: 'tip' | 'warning' | 'suggestion';
  priority: 'low' | 'medium' | 'high';
}

/** Summaries derived from parent daily ratings + generated reports (dashboard AI Insights). */
export interface AIInsightLine {
  id: string;
  text: string;
}

export interface AIInsightsHighlight {
  heading: string;
  subheading: string;
  /** MaterialIcons glyph name */
  iconName: string;
  lines: AIInsightLine[];
}

export interface AIInsightsPayload {
  title: string;
  subtitle: string;
  sourceLabel: string;
  positive: AIInsightsHighlight;
  attention: AIInsightsHighlight;
}

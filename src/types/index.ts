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

export interface Mission {
  id: string;
  title: string;
  description: string;
  type: 'photo' | 'voice' | 'text';
  points: number;
  isCompleted: boolean;
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

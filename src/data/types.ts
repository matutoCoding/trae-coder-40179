export interface CallRecord {
  callId: string;
  agentId: string;
  agentName: string;
  agentGroup: string;
  businessType: string;
  callReason: string;
  startTime: string;
  durationSec: number;
  customerScore: number;
  anomalyTags: string[];
  interruptionCount: number;
  silenceDurationMs: number;
  escalated: boolean;
  escalationReason?: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  summary: string;
  highLightPhrases: string[];
}

export interface Utterance {
  utteranceId: string;
  callId: string;
  speaker: 'agent' | 'customer';
  text: string;
  startTimeMs: number;
  endTimeMs: number;
  anomalyType?: string;
  emotionScore?: number;
}

export interface DailyMetric {
  date: string;
  totalCalls: number;
  complaintRate: number;
  avgInterruptions: number;
  silenceAnomalyRate: number;
  escalationRate: number;
  avgScore: number;
}

export interface WordCloudItem {
  text: string;
  value: number;
  category: 'complaint' | 'praise' | 'neutral';
}

export interface WeeklyInsight {
  id: string;
  category: 'problem' | 'violation' | 'praise';
  title: string;
  content: string;
  frequency: number;
  relatedCalls: string[];
  agentName?: string;
  score?: number;
  selected?: boolean;
}

export interface HeatmapCell {
  businessType: string;
  agentGroup: string;
  value: number;
}

export interface AlertItem {
  id: string;
  callId: string;
  agentName: string;
  type: 'complaint' | 'interruption' | 'silence' | 'escalation';
  severity: 'high' | 'medium' | 'low';
  message: string;
  timestamp: string;
}

export type AnomalyType =
  | 'interruption'
  | 'long_silence'
  | 'negative_sentiment'
  | 'escalation'
  | 'complaint_word'
  | 'rude_language'
  | 'script_deviation';

export type PageType = 'dashboard' | 'drilldown' | 'weekly';
export type TimeRange = 'today' | 'week' | '30d';

export interface DrillDownPayload {
  anomalyType: AnomalyType | 'all';
  callId?: string;
  sourcePage: 'dashboard' | 'drilldown';
  timestamp: number;
}

export interface CombinationCell {
  businessType: string;
  agentGroup: string;
  callReason: string;
  totalCalls: number;
  anomalyCount: number;
  anomalyRate: number;
  avgScore: number;
  topIssue: string;
  sampleCallIds: string[];
}

export interface FilterState {
  dateRange: TimeRange;
  agentGroup: string;
  businessType: string;
  anomalyType: AnomalyType | 'all';
  callReason: string;
  minScore: number;
  keyword: string;
}

export interface ReportData {
  period: string;
  startDate: string;
  endDate: string;
  totalCalls: number;
  avgScore: number;
  complaintRate: number;
  problems: WeeklyInsight[];
  violations: WeeklyInsight[];
  praises: WeeklyInsight[];
  representativeCalls: CallRecord[];
}

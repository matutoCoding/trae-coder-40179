import { create } from 'zustand';
import type { WeeklyInsight, TimeRange, FilterState, DrillDownPayload } from '@/data/types';
import { WEEKLY_INSIGHTS } from '@/data/mockData';

interface AppState {
  currentTimeRange: TimeRange;
  drillDownPayload: DrillDownPayload | null;
  drillDownFilters: FilterState;
  weeklyInsights: WeeklyInsight[];
  selectedInsightIds: Set<string>;
  setCurrentTimeRange: (range: TimeRange) => void;
  setDrillDownPayload: (payload: DrillDownPayload | null) => void;
  setDrillDownFilters: (filters: Partial<FilterState>) => void;
  resetDrillDownFilters: () => void;
  toggleInsightSelection: (id: string) => void;
  selectAllInsightsByCategory: (category: 'problem' | 'violation' | 'praise', selected: boolean) => void;
  clearAllSelections: () => void;
}

const defaultFilters: FilterState = {
  dateRange: 'today',
  agentGroup: 'all',
  businessType: 'all',
  anomalyType: 'all',
  callReason: 'all',
  minScore: 0,
  keyword: '',
};

export const useAppStore = create<AppState>((set, get) => ({
  currentTimeRange: 'week',
  drillDownPayload: null,
  drillDownFilters: { ...defaultFilters },
  weeklyInsights: WEEKLY_INSIGHTS,
  selectedInsightIds: new Set(WEEKLY_INSIGHTS.filter((i) => i.selected).map((i) => i.id)),

  setCurrentTimeRange: (range) => {
    set({ currentTimeRange: range });
    const filters = get().drillDownFilters;
    if (filters.dateRange !== range) {
      set({
        drillDownFilters: { ...filters, dateRange: range },
      });
    }
  },

  setDrillDownPayload: (payload) => set({ drillDownPayload: payload }),

  setDrillDownFilters: (filters) => {
    const current = get().drillDownFilters;
    set({ drillDownFilters: { ...current, ...filters } });
  },

  resetDrillDownFilters: () => set({ drillDownFilters: { ...defaultFilters, dateRange: get().currentTimeRange } }),

  toggleInsightSelection: (id) => {
    const current = get().selectedInsightIds;
    const next = new Set(current);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    set({ selectedInsightIds: next });
  },

  selectAllInsightsByCategory: (category, selected) => {
    const current = get().selectedInsightIds;
    const next = new Set(current);
    const categoryInsights = get().weeklyInsights.filter((i) => i.category === category);
    categoryInsights.forEach((i) => {
      if (selected) {
        next.add(i.id);
      } else {
        next.delete(i.id);
      }
    });
    set({ selectedInsightIds: next });
  },

  clearAllSelections: () => set({ selectedInsightIds: new Set() }),
}));

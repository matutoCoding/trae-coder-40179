import { create } from 'zustand';
import type { WeeklyInsight, AnomalyType } from '@/data/types';
import { WEEKLY_INSIGHTS } from '@/data/mockData';

interface AppState {
  currentPage: 'dashboard' | 'drilldown' | 'weekly';
  selectedCallId: string | null;
  selectedFilterType: AnomalyType | 'all';
  weeklyInsights: WeeklyInsight[];
  selectedInsightIds: Set<string>;
  currentTimeRange: '7d' | '30d';
  setCurrentPage: (page: 'dashboard' | 'drilldown' | 'weekly') => void;
  setSelectedCallId: (id: string | null) => void;
  setSelectedFilterType: (type: AnomalyType | 'all') => void;
  toggleInsightSelection: (id: string) => void;
  selectAllInsightsByCategory: (category: 'problem' | 'violation' | 'praise', selected: boolean) => void;
  clearAllSelections: () => void;
  setCurrentTimeRange: (range: '7d' | '30d') => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  currentPage: 'dashboard',
  selectedCallId: null,
  selectedFilterType: 'all',
  weeklyInsights: WEEKLY_INSIGHTS,
  selectedInsightIds: new Set(WEEKLY_INSIGHTS.filter((i) => i.selected).map((i) => i.id)),
  currentTimeRange: '7d',
  setCurrentPage: (page) => set({ currentPage: page }),
  setSelectedCallId: (id) => set({ selectedCallId: id }),
  setSelectedFilterType: (type) => set({ selectedFilterType: type }),
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
  setCurrentTimeRange: (range) => set({ currentTimeRange: range }),
}));

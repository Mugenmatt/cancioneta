import { create } from 'zustand';
import type { StimulusSummary } from '@/core/types';

export interface StimulusState {
  summary: StimulusSummary | null;
  collapsed: boolean;
  setStimulusPanel: (summary: StimulusSummary) => void;
  clearStimulusPanel: () => void;
  toggleStimulusPanel: () => void;
}

export const useStimulusStore = create<StimulusState>((set) => ({
  summary: null,
  collapsed: false,
  setStimulusPanel: (summary) => set({ summary, collapsed: false }),
  clearStimulusPanel: () => set({ summary: null, collapsed: false }),
  toggleStimulusPanel: () => set((state) => ({ collapsed: !state.collapsed })),
}));

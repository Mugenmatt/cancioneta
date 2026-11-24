import type { StimulusSummary } from '@/core/types';

export interface NarratorAxes {
  person: string;
  distance: string;
  reliability: string;
  theme?: string;
}

export function narratorSummary(axes: NarratorAxes): string {
  const values = [axes.person, axes.distance, axes.reliability];
  if (axes.theme) values.push(axes.theme);
  return values.filter(Boolean).join(' · ');
}

export interface NarratorStimulusInput {
  axes: NarratorAxes;
  title: string;
  note: string;
  groupTitles: {
    person: string;
    distance: string;
    reliability: string;
    theme: string;
  };
}

export function makeNarratorStimulus(input: NarratorStimulusInput): StimulusSummary {
  const { axes } = input;
  const groups = [
    { title: input.groupTitles.person, items: [axes.person] },
    { title: input.groupTitles.distance, items: [axes.distance] },
    { title: input.groupTitles.reliability, items: [axes.reliability] },
  ];
  if (axes.theme) groups.push({ title: input.groupTitles.theme, items: [axes.theme] });
  return {
    gameId: 'g34',
    title: input.title,
    items: [axes.person, axes.distance, axes.reliability, ...(axes.theme ? [axes.theme] : [])],
    groups,
    note: input.note,
  };
}

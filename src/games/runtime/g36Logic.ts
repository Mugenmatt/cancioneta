import type { StimulusSummary } from '@/core/types';

export type WheelKey = 'style' | 'meter' | 'structure';
export const WHEEL_KEYS: readonly WheelKey[] = ['style', 'meter', 'structure'];

export interface WheelSlots<T> {
  style: T;
  meter: T;
  structure: T;
}

export type WheelLocks = WheelSlots<boolean>;

export function applyWheelDraws<T>(
  current: WheelSlots<T>,
  drawn: Partial<WheelSlots<T>>,
  locks: WheelLocks,
): WheelSlots<T> {
  return {
    style: locks.style || drawn.style === undefined ? current.style : drawn.style,
    meter: locks.meter || drawn.meter === undefined ? current.meter : drawn.meter,
    structure: locks.structure || drawn.structure === undefined ? current.structure : drawn.structure,
  };
}

export function singleWheelDraw<T>(key: WheelKey, value: T): Partial<WheelSlots<T>> {
  if (key === 'style') return { style: value };
  if (key === 'meter') return { meter: value };
  return { structure: value };
}

export function wheelSummary(values: WheelSlots<string>): string {
  return [values.style, values.meter, values.structure].filter(Boolean).join(' · ');
}

export interface FormStimulusInput {
  values: WheelSlots<string>;
  title: string;
  note: string;
  groupTitles: WheelSlots<string>;
}

export function makeFormStimulus(input: FormStimulusInput): StimulusSummary {
  return {
    gameId: 'g36',
    title: input.title,
    items: [input.values.style, input.values.meter, input.values.structure],
    groups: [
      { title: input.groupTitles.style, items: [input.values.style] },
      { title: input.groupTitles.meter, items: [input.values.meter] },
      { title: input.groupTitles.structure, items: [input.values.structure] },
    ],
    note: input.note,
  };
}

import type { StimulusSummary } from '@/core/types';

export interface DeadlineOption {
  minutes: number;
  label: string;
}

export function deadlineAtFrom(minutes: number, now: number): number {
  return now + minutes * 60_000;
}

export interface DeadlineStimulusInput {
  target: string;
  deadlineAt?: number;
  title: string;
  groupTitle: string;
  note: string;
  deadlineLabel: string;
  doneLabel: string;
  pendingLabel: string;
}

export function makeDeadlineStimulus(input: DeadlineStimulusInput): StimulusSummary {
  return {
    gameId: 'g33',
    title: input.title,
    items: [input.target],
    groups: [{ title: input.groupTitle, items: [input.target] }],
    note: input.note,
    deadlineAt: input.deadlineAt,
    deadlineLabel: input.deadlineLabel,
    check: { target: input.target, doneLabel: input.doneLabel, pendingLabel: input.pendingLabel },
  };
}

import type { StimulusSummary } from '@/core/types';
import { G54_MAX_VERSES, G54_MIN_VERSES } from '@/content/games/g54';

export function filledVerses(values: readonly string[]): string[] {
  return values.map((value) => value.trim()).filter(Boolean);
}

export function canGoToEditor(values: readonly string[]): boolean {
  const count = filledVerses(values).length;
  return count >= G54_MIN_VERSES && count <= G54_MAX_VERSES;
}

export function versesWithoutQuestionMark(values: readonly string[]): number[] {
  return values.flatMap((value, index) => (value.trim() && !value.includes('?') ? [index] : []));
}

export interface QuestionVersesStimulusInput {
  theme: string;
  values: readonly string[];
  title: string;
  groupTitles: { theme: string; issues: string };
  issueLabel: (index: number) => string;
  note: string;
  doneLabel: string;
  pendingLabel: string;
}

export function makeQuestionVersesStimulus(input: QuestionVersesStimulusInput): StimulusSummary {
  const issues = versesWithoutQuestionMark(input.values);
  return {
    gameId: 'g54',
    title: input.title,
    items: filledVerses(input.values),
    groups: [
      { title: input.groupTitles.theme, items: [input.theme].filter(Boolean) },
      ...(issues.length > 0
        ? [{ title: input.groupTitles.issues, items: issues.map(input.issueLabel) }]
        : []),
    ],
    note: input.note,
    check: {
      target: '?',
      doneLabel: input.doneLabel,
      pendingLabel: input.pendingLabel,
    },
  };
}

import type { StimulusSummary } from '@/core/types';
import { G41_MIN_QUESTIONS, G41_MIN_SELECTED } from '@/content/games/g41';

export interface QuestionEntry {
  id: number;
  text: string;
  selected: boolean;
}

export function writtenQuestions(entries: readonly QuestionEntry[]): string[] {
  return entries.map((entry) => entry.text.trim()).filter(Boolean);
}

export function selectedQuestions(entries: readonly QuestionEntry[]): string[] {
  return entries.filter((entry) => entry.selected && entry.text.trim()).map((entry) => entry.text.trim());
}

export function canGoToEditor(entries: readonly QuestionEntry[]): boolean {
  return writtenQuestions(entries).length >= G41_MIN_QUESTIONS
    && selectedQuestions(entries).length >= G41_MIN_SELECTED;
}

export interface QuestionStimulusInput {
  title: string;
  questions: string[];
  groupTitle: string;
  note: string;
}

export function makeQuestionStimulus(input: QuestionStimulusInput): StimulusSummary {
  return {
    gameId: 'g41',
    title: input.title,
    items: input.questions,
    groups: [{ title: input.groupTitle, items: input.questions }],
    note: input.note,
  };
}

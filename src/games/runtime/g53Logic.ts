import type { StimulusSummary } from '@/core/types';
import { G53_QUESTIONS, G53_RECORD_SECONDS, G53_TEXT } from '@/content/games/g53';

export type G53Answers = Record<(typeof G53_QUESTIONS)[number]['id'], string>;

export function emptyAnswers(): G53Answers {
  return { far: '', near: '', missing: '' };
}

export function setAnswer(answers: G53Answers, id: keyof G53Answers, value: string): G53Answers {
  return { ...answers, [id]: value };
}

export function hasAnyAnswer(answers: G53Answers): boolean {
  return Object.values(answers).some((value) => value.trim().length > 0);
}

export function makeG53Stimulus(answers: G53Answers): StimulusSummary {
  const groups = G53_QUESTIONS
    .map((question) => ({ title: question.text, items: [answers[question.id].trim()].filter(Boolean) }))
    .filter((group) => group.items.length > 0);
  return {
    gameId: 'g53',
    title: G53_TEXT.editorTitle,
    items: G53_QUESTIONS.map((question) => answers[question.id].trim()).filter(Boolean),
    groups,
    note: G53_TEXT.noTranscription,
  };
}

export function makeG53Draft(answers: G53Answers): string {
  return G53_QUESTIONS
    .filter((question) => answers[question.id].trim())
    .map((question) => `[${question.label}] ${answers[question.id].trim()}`)
    .join('\n\n');
}

export function recordingLabel(seconds: number): string {
  return G53_TEXT.recordingSeconds(Math.max(0, seconds));
}

export function secondsLeft(seconds: number): number {
  return Math.max(0, G53_RECORD_SECONDS - seconds);
}

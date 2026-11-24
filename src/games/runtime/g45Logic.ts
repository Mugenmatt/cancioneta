import type { StimulusSummary } from '@/core/types';
import { G45_DRAFT_LABELS, G45_MAX_LINES, G45_MIN_LINES, G45_REST_MINUTES, G45_TEXT } from '@/content/games/g45';

export const G45_REST_SECONDS = G45_REST_MINUTES * 60;

export function restDeadline(minutes: number, now: number): number {
  return now + Math.max(0, minutes) * 60_000;
}

/** Separa renglones escritos; si no hay saltos de línea, usa las frases de la transcripción. */
export function splitLines(text: string): string[] {
  const normalized = text.replace(/\r/g, '');
  const byNewline = normalized.split(/\n+/u).map((line) => line.trim()).filter(Boolean);
  if (byNewline.length > 1) return byNewline;
  const bySentence = normalized.match(/[^.!?…]+(?:[.!?…]+|$)/gu) ?? [];
  return bySentence.map((line) => line.trim()).filter(Boolean);
}

export function hasValidLineCount(text: string): boolean {
  const count = splitLines(text).length;
  return count >= G45_MIN_LINES && count <= G45_MAX_LINES;
}

export function canFinish(lowText: string, highText: string, connection: string): boolean {
  return Boolean(connection.trim()) && hasValidLineCount(lowText) && hasValidLineCount(highText);
}

export interface G45DraftInput {
  lowText: string;
  highText: string;
  connection: string;
  addPreChorus: boolean;
  preChorus: string;
  centralLine: string;
}

function block(label: string, body: string): string {
  return `[${label}]\n${body.trim()}`;
}

export function makeG45Draft(input: G45DraftInput): string {
  const blocks = [
    `${G45_DRAFT_LABELS.connection}: ${input.connection.trim()}`,
    block(G45_DRAFT_LABELS.verse, splitLines(input.lowText).join('\n')),
  ];
  if (input.addPreChorus && input.preChorus.trim()) {
    blocks.push(block(G45_DRAFT_LABELS.preChorus, input.preChorus));
  }
  blocks.push(block(G45_DRAFT_LABELS.chorus, splitLines(input.highText).join('\n')));
  if (input.centralLine.trim()) {
    blocks.push(`${G45_DRAFT_LABELS.central}: ${input.centralLine.trim()}`);
  }
  return blocks.join('\n\n');
}

export function makeG45Stimulus(input: G45DraftInput): StimulusSummary {
  const groups: { title: string; items: string[] }[] = [
    { title: G45_DRAFT_LABELS.verse, items: splitLines(input.lowText) },
  ];
  if (input.addPreChorus && input.preChorus.trim()) {
    groups.push({ title: G45_DRAFT_LABELS.preChorus, items: splitLines(input.preChorus) });
  }
  groups.push({ title: G45_DRAFT_LABELS.chorus, items: splitLines(input.highText) });
  groups.push({ title: G45_TEXT.connectionQuestion, items: [input.connection.trim()] });
  if (input.centralLine.trim()) {
    groups.push({ title: G45_DRAFT_LABELS.central, items: [input.centralLine.trim()] });
  }

  return {
    gameId: 'g45',
    title: G45_TEXT.editorTitle,
    items: [input.connection.trim(), input.centralLine.trim()].filter(Boolean),
    groups,
    note: G45_TEXT.lineCountHint,
  };
}

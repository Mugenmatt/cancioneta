import type { StimulusSummary } from '@/core/types';
import { G48_MAX_VERSES, G48_MIN_VERSES, type Shot } from '@/content/games/g48';

export type ShotOrder = 'ordered' | 'random';

export function assignShots(
  count: number,
  order: ShotOrder,
  ordered: readonly Shot[],
  shuffled: readonly Shot[],
): Shot[] {
  const size = Math.min(Math.max(count, G48_MIN_VERSES), G48_MAX_VERSES);
  const source = order === 'ordered' ? ordered : shuffled;
  return source.slice(0, size);
}

export interface ShotStimulusInput {
  shots: readonly Shot[];
  scene: string;
  title: string;
  note: string;
  groupTitles: { scene: string; verse: (index: number, label: string) => string };
}

export function makeShotStimulus(input: ShotStimulusInput): StimulusSummary {
  const groups = [];
  const scene = input.scene.trim();
  if (scene) groups.push({ title: input.groupTitles.scene, items: [scene] });
  input.shots.forEach((shot, index) => {
    groups.push({ title: input.groupTitles.verse(index, shot.label), items: [shot.hint] });
  });
  return {
    gameId: 'g48',
    title: input.title,
    items: input.shots.map((shot) => shot.hint),
    groups,
    note: input.note,
  };
}

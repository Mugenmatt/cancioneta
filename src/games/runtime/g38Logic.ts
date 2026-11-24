import type { PoolItem, StimulusSummary } from '@/core/types';

export interface StolenScene {
  description: string;
  character: string;
  unsaid: string;
}

export function sceneFromItem(item: PoolItem): StolenScene {
  const character = item.extra?.character;
  const unsaid = item.extra?.unsaid;
  return {
    description: item.text,
    character: typeof character === 'string' ? character : '',
    unsaid: typeof unsaid === 'string' ? unsaid : '',
  };
}

export function sceneDeadlineAt(minutes: number, now: number): number {
  return now + minutes * 60_000;
}

export interface SceneStimulusInput {
  scene: StolenScene;
  deadlineAt?: number;
  title: string;
  groupTitles: { scene: string; character: string; unsaid: string };
  note: string;
  timeLabel: string;
}

export function makeSceneStimulus(input: SceneStimulusInput): StimulusSummary {
  const { scene } = input;
  return {
    gameId: 'g38',
    title: input.title,
    items: [scene.description, scene.character, scene.unsaid].filter(Boolean),
    groups: [
      { title: input.groupTitles.scene, items: [scene.description] },
      { title: input.groupTitles.character, items: [scene.character] },
      { title: input.groupTitles.unsaid, items: [scene.unsaid] },
    ],
    note: input.note,
    deadlineAt: input.deadlineAt,
    deadlineLabel: input.timeLabel,
  };
}

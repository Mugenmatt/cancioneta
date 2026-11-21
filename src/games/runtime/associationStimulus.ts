import type { PoolItem, StimulusSummary } from '@/core/types';
import { COMMON_TEXT } from '@/content/games/common';
import { ASSOCIATION_KINDS, ASSOCIATION_TEXT, type AssociationKind } from '@/content/games/g01';

export function createAssociationStimulus(
  columns: readonly (readonly PoolItem[])[],
  kinds: readonly AssociationKind[],
): StimulusSummary {
  const groups = columns.map((column, index) => {
    const label = ASSOCIATION_KINDS.find((entry) => entry.id === kinds[index])?.label ?? ASSOCIATION_TEXT.fallbackKind;
    return {
      title: `${COMMON_TEXT.column(index)} · ${label}`,
      items: column.map((item) => item.text),
    };
  });
  const items = groups.flatMap((group) => group.items);
  return {
    gameId: 'g01',
    title: ASSOCIATION_TEXT.stimulusTitle,
    items,
    groups,
    note: `${ASSOCIATION_TEXT.stimulusSummary(items.length)}. ${ASSOCIATION_TEXT.stimulusNote}`,
  };
}

import type { PoolItem } from '@/core/types';
import { otherColumnsFingerprints, replaceColumn, takeUniqueWords, uniquePoolItems } from '@/games/runtime/logic';

function item(id: string, text: string): PoolItem {
  return {
    id,
    pool: 'words.noun',
    text,
    lang: 'es',
    license: 'cc_by_sa',
    fingerprint: id,
  };
}

describe('Asociación Libre', () => {
  const columns = [
    [item('a1', 'uno'), item('a2', 'dos')],
    [item('b1', 'tres'), item('b2', 'cuatro')],
    [item('c1', 'cinco'), item('c2', 'seis')],
  ];

  it('excluye solo las palabras de las otras columnas', () => {
    expect(otherColumnsFingerprints(columns, 1)).toEqual(new Set(['a1', 'a2', 'c1', 'c2']));
  });

  it('regenera una columna sin tocar las demás', () => {
    const next = [item('a3', 'siete'), item('a4', 'ocho')];
    const result = replaceColumn(columns, 0, next);
    expect(result[0]).toEqual(next);
    expect(result[1]).toEqual(columns[1]);
    expect(result[2]).toEqual(columns[2]);
  });

  it('evita repeticiones dentro de un sorteo', () => {
    const duplicated = [item('x', 'casa'), item('x', 'casa'), item('y', 'mar')];
    expect(uniquePoolItems(duplicated).map((entry) => entry.fingerprint)).toEqual(['x', 'y']);
  });

  it('completa diez palabras sin usar huellas de las otras columnas', () => {
    const pool = Array.from({ length: 13 }, (_, index) => item(`w${index}`, `palabra${index}`));
    const groupSet = new Set(['w0', 'w1', 'w2']);
    const rng = { int: () => 0, shuffle: <T,>(items: readonly T[]) => [...items] };
    const drawn = takeUniqueWords([pool], groupSet, rng, 10);
    expect(drawn).toHaveLength(10);
    expect(drawn.some((entry) => groupSet.has(entry.fingerprint))).toBe(false);
    expect(new Set(drawn.map((entry) => entry.fingerprint)).size).toBe(10);
  });
});

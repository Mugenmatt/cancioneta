import { mapRelationsReal } from '@/data/mapRelationsReal';

const entries = Object.entries(mapRelationsReal);

describe('Relaciones del mapa', () => {
  it('no conserva relaciones parte-todo recíprocas', () => {
    for (const [key, value] of entries) {
      for (const part of value.parts) {
        expect(mapRelationsReal[part]?.parts ?? []).not.toContain(key);
      }
    }
  });

  it('descarta series cerradas con tres o más partes compartidas', () => {
    for (let first = 0; first < entries.length; first += 1) {
      for (let second = first + 1; second < entries.length; second += 1) {
        const shared = entries[first][1].parts.filter((part) => entries[second][1].parts.includes(part));
        expect(shared.length).toBeLessThan(3);
      }
    }
  });

  it('conserva las relaciones parte-todo verificadas', () => {
    expect(mapRelationsReal.faz.parts).toEqual(['barbilla', 'boca', 'frente', 'nariz', 'ojo']);
    expect(mapRelationsReal.puntero.parts).toEqual([
      'arquero', 'carrilero', 'defensor', 'delantero', 'lateral', 'mediapunta', 'volante',
    ]);
    expect(mapRelationsReal.dos).toBeUndefined();
    expect(mapRelationsReal.uno).toEqual({ parts: [], derived: ['unir'] });
  });

  it('no altera los derivados de Wiktextract', () => {
    expect(entries).toHaveLength(1555);
    expect(entries.reduce((total, [, value]) => total + value.derived.length, 0)).toBe(1631);
  });
});

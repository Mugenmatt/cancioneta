import { dataService } from '@/services/data/DataService';
import { G35_SCHEMES, G35_TEXT } from '@/content/games/g35';
import { makeRhymeStimulus, schemeById } from '@/games/runtime/g35Logic';

describe('G-35 Molde de rima', () => {
  it('tiene ocho esquemas en el banco y en las tarjetas', () => {
    const pool = dataService.getPool('rhyme_schemes');
    expect(pool).toHaveLength(8);
    expect(pool.every((item) => item.license === 'original')).toBe(true);
    expect(new Set(pool.map((item) => item.fingerprint)).size).toBe(8);
    expect([...pool.map((item) => item.text)].sort()).toEqual([...G35_SCHEMES.map((scheme) => scheme.id)].sort());
  });

  it('cada tarjeta trae letras y un ejemplo original de cuatro versos', () => {
    expect(G35_SCHEMES.map((scheme) => scheme.pattern)).toEqual([
      'ABAB', 'AABB', 'ABBA', 'XAXA', 'AAAA', 'AACBBC', 'A A / B B', 'XXXR',
    ]);
    for (const scheme of G35_SCHEMES) {
      expect(scheme.lines).toHaveLength(4);
      expect(scheme.lines.every((line) => line.trim().length > 10)).toBe(true);
      expect(scheme.hint.length).toBeGreaterThan(20);
    }
    expect(schemeById('abab')?.pattern).toBe('ABAB');
    expect(schemeById('missing')).toBeUndefined();
  });

  it('deja el esquema fijo arriba del cuaderno con el ejemplo', () => {
    const scheme = schemeById('aabb');
    if (!scheme) throw new Error('Falta el molde AABB');
    const stimulus = makeRhymeStimulus({
      scheme,
      title: G35_TEXT.editorTitle(scheme.pattern),
      note: G35_TEXT.editorNote,
      groupTitles: { scheme: G35_TEXT.schemeGroup, example: G35_TEXT.exampleGroup },
    });
    expect(stimulus.gameId).toBe('g35');
    expect(stimulus.title).toBe('Molde de rima: AABB');
    expect(stimulus.groups?.[0].items).toContain('AABB');
    expect(stimulus.groups?.[1].items).toEqual([...scheme.lines]);
  });
});

import {
  chainWordKey,
  findGridWords,
  isChainAdjacent,
  toChainUnits,
  trimChainPath,
  wordPrefixes,
} from '@/games/runtime/chainLogic';

describe('Cadena de letras', () => {
  it('trata qu como una sola unidad', () => {
    expect(toChainUnits('queso')).toEqual(['qu', 'e', 's', 'o']);
    expect(chainWordKey('queso')).toBe('keso');
  });

  it('conserva la ñ y compara las tildes sin acento', () => {
    expect(chainWordKey('año')).toBe('año');
    expect(chainWordKey('ÁRBOL')).toBe('arbol');
    expect(toChainUnits('año')).toEqual(['a', 'ñ', 'o']);
  });

  it('encuentra palabras en ocho direcciones con diccionario local', () => {
    const lexicon = new Map(['sol', 'keso', 'año'].map((word) => [word, word]));
    const grid = [
      ['s', 'o', 'l', 'x'],
      ['qu', 'e', 's', 'o'],
      ['a', 'ñ', 'o', 'x'],
      ['x', 'x', 'x', 'x'],
    ];
    const found = findGridWords(grid, lexicon, wordPrefixes(lexicon.keys(), 4));
    expect(found).toContain('sol');
    expect(found).toContain('keso');
    expect(found).toContain('año');
  });

  it('acepta adyacencia diagonal y rechaza saltos', () => {
    expect(isChainAdjacent({ row: 1, col: 1 }, { row: 2, col: 2 })).toBe(true);
    expect(isChainAdjacent({ row: 1, col: 1 }, { row: 3, col: 1 })).toBe(false);
  });

  it('recorta el camino al volver a tocar una casilla', () => {
    const path = [
      { row: 0, col: 0 },
      { row: 0, col: 1 },
      { row: 1, col: 2 },
    ];
    expect(trimChainPath(path, 0, 1)).toEqual([{ row: 0, col: 0 }]);
    expect(trimChainPath(path, 2, 2)).toEqual(path);
  });
});

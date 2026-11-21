import {
  MAP_LIMITS,
  canFillChildren,
  createMapNode,
  depthOf,
  fillChildren,
  layoutMap,
  MAP_LAYOUT,
  mapExportEntries,
  moveChild,
  parseMapPayload,
  removeChild,
  serializeMap,
  suggestMapChildSuggestions,
  suggestMapChildren,
  type MapNode,
} from '@/games/runtime/mapLogic';

const rng = {
  int: () => 0,
  shuffle: <T,>(items: readonly T[]) => [...items],
};

let sequence = 0;
const makeId = () => `n_${++sequence}`;

function occupiedTree(): MapNode {
  sequence = 0;
  const root = createMapNode(makeId(), 'raíz');
  return fillChildren(root, root.id, ['uno', 'dos', 'tres'], makeId);
}

describe('Mapa Mental', () => {
  beforeEach(() => { sequence = 0; });

  it('abre exactamente tres ranuras al crear el nodo inicial', () => {
    const root = createMapNode(makeId(), 'raíz');
    expect(root.children).toEqual([null, null, null]);
  });

  it('al borrar conserva la ranura vacía y descarta el subárbol', () => {
    sequence = 0;
    let root = occupiedTree();
    root = fillChildren(root, 'n_2', ['hoja'], makeId);
    const next = removeChild(root, 'n_1', 0);
    expect(next.children[0]).toBeNull();
    expect(next.children[1]?.text).toBe('dos');
  });

  it('respeta el máximo de niveles', () => {
    sequence = 0;
    let root = createMapNode(makeId(), 'raíz');
    let parentId = root.id;
    for (let depth = 2; depth <= MAP_LIMITS.maxDepth; depth += 1) {
      root = fillChildren(root, parentId, ['hijo'], makeId);
      parentId = `n_${sequence}`;
    }
    expect(depthOf(root, parentId)).toBe(MAP_LIMITS.maxDepth);
    expect(canFillChildren(root, parentId, 3)).toBe(false);
  });

  it('reordena hijos dentro de las tres ranuras', () => {
    const root = moveChild(occupiedTree(), 'n_1', 0, 2);
    expect(root.children.map((child) => child?.text ?? null)).toEqual(['tres', 'dos', 'uno']);
  });

  it('serializa conexiones y posiciones', () => {
    const payload = serializeMap(occupiedTree());
    expect(payload.schema).toBe('cancioneta.mapa');
    expect(payload.version).toBe(2);
    expect(payload.connections).toHaveLength(3);
    expect(Object.keys(payload.positions)).toHaveLength(4);
  });

  it('importa el formato anterior y rechaza mapas inválidos', () => {
    const root = parseMapPayload(JSON.stringify({
      version: 1,
      root: {
        id: 'n_1',
        text: 'raíz',
        children: [
          { id: 'n_2', text: 'uno', children: [] },
          { id: 'n_3', text: 'dos', children: [] },
          { id: 'n_4', text: 'tres', children: [] },
        ],
      },
    }), makeId);
    expect(root.children.map((child) => child?.text)).toEqual(['uno', 'dos', 'tres']);
    expect(() => parseMapPayload(JSON.stringify({ version: 9, root: { text: 'x', children: [] } }), makeId)).toThrow();
  });

  it('sugiere tres palabras reales distintas desde relaciones', () => {
    const words = suggestMapChildren(
      'casa',
      [],
      { synonyms: ['hogar', 'vivienda'], hypernyms: ['edificio'], hyponyms: ['chalé'], related: ['puerta'], parts: [], derived: [] },
      ['hogar', 'vivienda', 'edificio', 'chalé', 'puerta', 'ventana'],
      () => 0,
      rng,
    );
    expect(words).toEqual(['chalé', 'edificio', 'hogar']);
  });

  it('prioriza relaciones parte-todo y derivadas verificadas', () => {
    const picked = suggestMapChildSuggestions(
      'faz',
      [],
      { parts: ['boca', 'nariz'], derived: ['facial'], synonyms: ['cara'], related: ['ojos'], hypernyms: [], hyponyms: [] },
      ['boca', 'nariz', 'facial', 'cara', 'ojos'],
      () => 0,
      rng,
    );
    expect(picked.map((item) => item.word)).toEqual(['boca', 'facial', 'nariz']);
    expect(picked.map((item) => item.relation)).toEqual(['part', 'derived', 'part']);
  });

  it('ubica hermanos en filas separadas y centra al padre', () => {
    const layout = layoutMap(occupiedTree());
    expect(layout.positions['n_1']).toEqual({ x: 0, y: MAP_LAYOUT.rowHeight });
    expect(layout.positions['n_2'].y).toBe(0);
    expect(layout.positions['n_3'].y).toBe(MAP_LAYOUT.rowHeight);
    expect(layout.positions['n_4'].y).toBe(MAP_LAYOUT.rowHeight * 2);
    expect(layout.connections).toHaveLength(3);
  });

  it('exporta en el mismo orden visual del mapa', () => {
    const root = occupiedTree();
    expect(mapExportEntries(root).map((entry) => entry.text)).toEqual(['uno', 'raíz', 'dos', 'tres']);
  });

  it('rechaza un JSON con posiciones inconsistentes con el grafo', () => {
    const payload = serializeMap(occupiedTree());
    const altered = { ...payload, positions: { ...payload.positions, n_2: { x: 999, y: 999 } } };
    expect(() => parseMapPayload(JSON.stringify(payload), makeId)).not.toThrow();
    expect(() => parseMapPayload(JSON.stringify(altered), makeId)).toThrow('grafo inconsistente');
  });
});

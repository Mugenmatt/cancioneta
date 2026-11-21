import type { SemanticRelations } from '@/core/types';
import { normalizeWord, type WordRng } from './logic';

export type MapRelation =
  | 'synonym'
  | 'hypernym'
  | 'hyponym'
  | 'part'
  | 'derived'
  | 'related'
  | 'association'
  | 'manual';

export interface MapNode {
  id: string;
  text: string;
  relation: MapRelation;
  children: (MapNode | null)[];
}

export interface MapConnection {
  from: string;
  to: string;
  relation: MapRelation;
}

export interface MapPosition {
  x: number;
  y: number;
}

export interface MapEntry extends MapPosition {
  id: string;
  text: string;
  relation: MapRelation;
  depth: number;
}

export interface MapLayout {
  positions: Record<string, MapPosition>;
  connections: MapConnection[];
  entries: MapEntry[];
  width: number;
  height: number;
}

export interface MapPayload {
  schema: string;
  version: number;
  root: MapNode;
  connections: MapConnection[];
  positions: Record<string, MapPosition>;
}

export interface MapSuggestion {
  word: string;
  relation: MapRelation;
}

interface ImportState {
  count: number;
  ids: Set<string>;
  makeId: () => string;
}

export const MAP_LIMITS = { maxDepth: 5, maxNodes: 121, childSlots: 3 } as const;
export const MAP_LAYOUT = { columnWidth: 200, rowHeight: 96, nodeWidth: 168, nodeHeight: 56 } as const;

const RELATIONS: MapRelation[] = ['synonym', 'hypernym', 'hyponym', 'part', 'derived', 'related', 'association', 'manual'];

export function emptyChildren(): (MapNode | null)[] {
  return [null, null, null];
}

export function createMapNode(id: string, text: string, relation: MapRelation = 'manual'): MapNode {
  return { id, text, relation, children: emptyChildren() };
}

export function countNodes(node: MapNode | null): number {
  if (!node) return 0;
  return 1 + node.children.reduce((total, child) => total + countNodes(child), 0);
}

export function depthOf(node: MapNode, id: string, depth = 1): number {
  if (node.id === id) return depth;
  for (const child of node.children) {
    if (!child) continue;
    const found = depthOf(child, id, depth + 1);
    if (found) return found;
  }
  return 0;
}

export function findNode(node: MapNode, id: string): MapNode | undefined {
  if (node.id === id) return node;
  for (const child of node.children) {
    if (!child) continue;
    const found = findNode(child, id);
    if (found) return found;
  }
  return undefined;
}

export function findParent(node: MapNode, id: string): MapNode | undefined {
  if (node.children.some((child) => child?.id === id)) return node;
  for (const child of node.children) {
    if (!child) continue;
    const found = findParent(child, id);
    if (found) return found;
  }
  return undefined;
}

export function layoutMap(root: MapNode): MapLayout {
  const positions: Record<string, MapPosition> = {};
  const connections: MapConnection[] = [];
  const entries: MapEntry[] = [];
  let row = 0;

  const visit = (node: MapNode, depth: number, parent: MapNode | null): number => {
    const children = node.children.filter((child): child is MapNode => Boolean(child));
    let y: number;
    if (children.length === 0) {
      y = row * MAP_LAYOUT.rowHeight;
      row += 1;
    } else {
      const childRows = children.map((child) => visit(child, depth + 1, node));
      y = (childRows[0] + childRows[childRows.length - 1]) / 2;
    }
    const x = (depth - 1) * MAP_LAYOUT.columnWidth;
    positions[node.id] = { x, y };
    if (parent) connections.push({ from: parent.id, to: node.id, relation: node.relation });
    entries.push({ id: node.id, text: node.text, relation: node.relation, depth, x, y });
    return y;
  };

  visit(root, 1, null);
  entries.sort((first, second) => first.y - second.y || first.x - second.x || first.id.localeCompare(second.id));
  const maxX = Math.max(...entries.map((entry) => entry.x));
  const maxY = Math.max(...entries.map((entry) => entry.y));
  return {
    positions,
    connections,
    entries,
    width: maxX + MAP_LAYOUT.nodeWidth,
    height: maxY + MAP_LAYOUT.nodeHeight,
  };
}

export function collectMapWords(node: MapNode | null): string[] {
  return layoutMap(node ?? createMapNode('empty', '')).entries.map((entry) => entry.text).filter(Boolean);
}

export function mapExportEntries(root: MapNode): { text: string; relation: MapRelation }[] {
  return layoutMap(root).entries.map((entry) => ({ text: entry.text, relation: entry.relation }));
}

export function setChildNode(node: MapNode, parentId: string, index: number, child: MapNode | null): MapNode {
  if (node.id === parentId) {
    const children = [...node.children];
    children[index] = child;
    return { ...node, children };
  }
  return { ...node, children: node.children.map((slot) => (slot ? setChildNode(slot, parentId, index, child) : slot)) };
}

export function setChildText(
  node: MapNode,
  parentId: string,
  index: number,
  text: string,
  makeId: () => string,
  relation: MapRelation = 'manual',
): MapNode {
  const current = findNode(node, parentId);
  if (!current) return node;
  const child = current.children[index] ?? createMapNode(makeId(), text, relation);
  const next = { ...child, text };
  return setChildNode(node, parentId, index, next);
}

export function updateNodeText(node: MapNode, id: string, text: string): MapNode {
  if (node.id === id) return { ...node, text };
  return { ...node, children: node.children.map((child) => (child ? updateNodeText(child, id, text) : child)) };
}

export function removeChild(node: MapNode, parentId: string, index: number): MapNode {
  return setChildNode(node, parentId, index, null);
}

export function moveChild(node: MapNode, parentId: string, from: number, to: number): MapNode {
  if (from === to || to < 0 || to >= MAP_LIMITS.childSlots) return node;
  const parent = findNode(node, parentId);
  if (!parent || !parent.children[from]) return node;
  const children = [...parent.children];
  [children[from], children[to]] = [children[to], children[from]];
  return updateAllChildren(node, parentId, children);
}

function updateAllChildren(node: MapNode, parentId: string, children: (MapNode | null)[]): MapNode {
  if (node.id === parentId) return { ...node, children };
  return { ...node, children: node.children.map((slot) => (slot ? updateAllChildren(slot, parentId, children) : slot)) };
}

export function fillChildren(
  node: MapNode,
  parentId: string,
  suggestions: readonly (string | MapSuggestion)[],
  makeId: () => string,
): MapNode {
  const children = emptyChildren();
  suggestions.slice(0, MAP_LIMITS.childSlots).forEach((entry, index) => {
    const suggestion = typeof entry === 'string' ? { word: entry, relation: 'manual' as const } : entry;
    children[index] = createMapNode(makeId(), suggestion.word, suggestion.relation);
  });
  return updateAllChildren(node, parentId, children);
}

export function canFillChildren(node: MapNode, parentId: string, newTexts: number): boolean {
  const parent = findNode(node, parentId);
  if (!parent) return false;
  const depth = depthOf(node, parentId);
  if (depth >= MAP_LIMITS.maxDepth) return false;
  const empty = parent.children.filter((child) => !child).length;
  const added = Math.max(0, newTexts - empty);
  return countNodes(node) + added <= MAP_LIMITS.maxNodes;
}

export function maxNodeNumber(node: MapNode | null): number {
  if (!node) return 0;
  const own = /^n_(\d+)$/.exec(node.id);
  const ownNumber = own ? Number(own[1]) : 0;
  return node.children.reduce((max, child) => Math.max(max, maxNodeNumber(child)), ownNumber);
}

export function serializeMap(root: MapNode): MapPayload {
  const layout = layoutMap(root);
  return { schema: 'cancioneta.mapa', version: 2, root, connections: layout.connections, positions: layout.positions };
}

function normalizeNode(raw: RawNode, state: ImportState, depth: number): MapNode | null {
  if (depth > MAP_LIMITS.maxDepth || typeof raw.text !== 'string') return null;
  state.count += 1;
  if (state.count > MAP_LIMITS.maxNodes) return null;
  const givenId = typeof raw.id === 'string' && raw.id.trim() && !state.ids.has(raw.id) ? raw.id : state.makeId();
  state.ids.add(givenId);
  const rawChildren = Array.isArray(raw.children) ? raw.children : [];
  if (rawChildren.length > MAP_LIMITS.childSlots) return null;
  const relation = RELATIONS.includes(raw.relation as MapRelation) ? raw.relation as MapRelation : 'manual';
  const children = emptyChildren();
  for (let index = 0; index < rawChildren.length; index += 1) {
    const child = rawChildren[index];
    if (child === null || child === undefined) continue;
    if (typeof child !== 'object') return null;
    const normalized = normalizeNode(child as RawNode, state, depth + 1);
    if (!normalized) return null;
    children[index] = normalized;
  }
  return { id: givenId, text: raw.text, relation, children };
}

type RawNode = {
  id?: unknown;
  text?: unknown;
  relation?: unknown;
  children?: unknown;
};

function sameGraph(root: MapNode, connections: unknown, positions: unknown): boolean {
  const layout = layoutMap(root);
  if (!Array.isArray(connections) || connections.length !== layout.connections.length) return false;
  const expectedConnections = layout.connections.map((entry) => `${entry.from}>${entry.to}:${entry.relation}`);
  const actualConnections = connections.map((entry) => {
    if (typeof entry !== 'object' || entry === null) return '';
    const value = entry as Partial<MapConnection>;
    return `${value.from}>${value.to}:${value.relation}`;
  });
  if (expectedConnections.some((entry, index) => entry !== actualConnections[index])) return false;
  if (typeof positions !== 'object' || positions === null) return false;
  const actualPositions = positions as Record<string, Partial<MapPosition>>;
  return Object.entries(layout.positions).every(([id, expected]) => {
    const actual = actualPositions[id];
    return actual?.x === expected.x && actual?.y === expected.y;
  });
}

export function parseMapPayload(text: string, makeId: () => string): MapNode {
  const parsed = JSON.parse(text) as {
    schema?: unknown;
    version?: unknown;
    root?: unknown;
    connections?: unknown;
    positions?: unknown;
  };
  if (!parsed.root || typeof parsed.root !== 'object') throw new Error('root inválido');
  if (parsed.version !== 1 && parsed.version !== 2) throw new Error('versión no reconocida');
  if (parsed.version === 2 && parsed.schema !== 'cancioneta.mapa') throw new Error('esquema no reconocido');
  const state: ImportState = { count: 0, ids: new Set(), makeId };
  const root = normalizeNode(parsed.root as RawNode, state, 1);
  if (!root || state.count > MAP_LIMITS.maxNodes) throw new Error('mapa inválido');
  if (parsed.version === 2 && parsed.connections !== undefined && parsed.positions !== undefined) {
    if (!sameGraph(root, parsed.connections, parsed.positions)) throw new Error('grafo inconsistente');
  }
  return root;
}

export function suggestMapChildSuggestions(
  seed: string,
  used: readonly string[],
  relations: SemanticRelations | undefined,
  available: readonly string[],
  rank: (word: string) => number,
  rng: WordRng,
  count: number = MAP_LIMITS.childSlots,
): MapSuggestion[] {
  const blocked = new Set([seed, ...used].map(normalizeWord));
  const availableSet = new Set(available.map(normalizeWord));
  const types: { name: keyof SemanticRelations; relation: MapRelation; bonus: number }[] = [
    { name: 'parts', relation: 'part', bonus: 0 },
    { name: 'derived', relation: 'derived', bonus: 0 },
    { name: 'synonyms', relation: 'synonym', bonus: 1 },
    { name: 'hypernyms', relation: 'hypernym', bonus: 1 },
    { name: 'hyponyms', relation: 'hyponym', bonus: 1 },
    { name: 'related', relation: 'related', bonus: 2 },
  ];
  const candidates = new Map<string, { suggestion: MapSuggestion; score: number }>();
  const add = (word: string, relation: MapRelation, bonus: number) => {
    const key = normalizeWord(word);
    if (!key || blocked.has(key) || !availableSet.has(key)) return;
    const suggestion = { word, relation };
    const score = bonus + rank(word) / 1000;
    const candidate = candidates.get(key);
    if (!candidate || score < candidate.score) candidates.set(key, { suggestion, score });
  };
  for (const { name, relation, bonus } of types) {
    for (const word of relations?.[name] ?? []) add(word, relation, bonus);
  }
  for (const word of available) add(word, 'association', 20);

  const picked: MapSuggestion[] = [];
  const usedRelations = new Set<MapRelation>();
  let ranked = [...candidates.values()];
  const effectiveScore = (entry: { suggestion: MapSuggestion; score: number }) =>
    entry.score + (entry.score > 0 && usedRelations.has(entry.suggestion.relation) ? 3 : 0);
  while (picked.length < count && ranked.length > 0) {
    ranked.sort((first, second) => (
      effectiveScore(first) - effectiveScore(second)
      || first.suggestion.word.localeCompare(second.suggestion.word, 'es')
    ));
    const chosen = ranked.shift();
    if (!chosen) break;
    picked.push(chosen.suggestion);
    usedRelations.add(chosen.suggestion.relation);
    blocked.add(normalizeWord(chosen.suggestion.word));
    ranked = ranked.filter((entry) => !blocked.has(normalizeWord(entry.suggestion.word)));
  }
  void rng;
  return picked;
}

export function suggestMapChildren(
  seed: string,
  used: readonly string[],
  relations: SemanticRelations | undefined,
  available: readonly string[],
  rank: (word: string) => number,
  rng: WordRng,
  count: number = MAP_LIMITS.childSlots,
): string[] {
  return suggestMapChildSuggestions(seed, used, relations, available, rank, rng, count).map((item) => item.word);
}

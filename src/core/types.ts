export type PoolId =
  | 'words.noun'
  | 'words.verb'
  | 'words.adj'
  | 'titles'
  | 'characters'
  | 'songs'
  | 'poems_songs_ref'
  | 'quote_public'
  | 'script_phrases'
  | 'prompts'
  | 'images'
  | 'situations'
  | 'restrictions'
  | 'themes'
  | 'universes'
  | 'dice_lugar'
  | 'dice_personaje'
  | 'dice_objeto'
  | 'dice_accion'
  | 'dice_emocion'
  | 'dice_cualidad'
  | 'sensory_questions'
  | 'cutup_texts'
  | 'portal_seeds'
  | 'confession_topics'
  | 'letter_triggers'
  | 'spy_questions'
  | 'games';

export interface PoolItem {
  id: string;
  pool: PoolId;
  text: string;
  author?: string;
  work?: string;
  year?: number;
  kind?: string;
  lang: string;
  license: 'original' | 'public_domain' | 'cc0' | 'cc_by' | 'cc_by_sa' | 'metadata_only' | 'permission';
  sourceUrl?: string;
  externalLink?: string;
  attribution?: string;
  tags?: string[];
  fingerprint: string;
  extra?: Record<string, string | number | boolean>;
}

export interface GameExample {
  title: string;
  body: string;
}

export interface SongSection {
  id: string;
  name: string;
  kind: 'intro' | 'verse' | 'chorus' | 'bridge' | 'outro' | 'custom';
  stanzas: Stanza[];
}

export interface Stanza {
  id: string;
  structureId: string | null;
  text: string;
}

export interface Song {
  sections: SongSection[];
}

export interface LyricsSnapshotLine {
  sectionId: string;
  sectionName: string;
  stanzaId: string;
  stanzaIndex: number;
  lineIndex: number;
  text: string;
  words: string[];
}

export interface LyricsSnapshot {
  lines: LyricsSnapshotLine[];
}

export interface SemanticRelations {
  synonyms: readonly string[];
  hypernyms: readonly string[];
  hyponyms: readonly string[];
  related: readonly string[];
  parts: readonly string[];
  derived: readonly string[];
}

export interface StimulusGroup {
  title: string;
  items: string[];
}

export interface StimulusSummary {
  gameId: string;
  title: string;
  items: string[];
  groups?: StimulusGroup[];
  note?: string;
}

export interface PoolStats {
  total: number;
  used: number;
  cycle: number;
}

export interface RandomSource {
  next(): number;
  int(maxExclusive: number): number;
  shuffle<T>(items: readonly T[]): T[];
}

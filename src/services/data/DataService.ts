import type { PoolId, PoolItem, SemanticRelations } from '@/core/types';
import { fingerprint, makeId } from '@/services/random/fingerprint';
import { nouns } from '@/data/nouns';
import { verbs } from '@/data/verbs';
import { adjectives } from '@/data/adjectives';
import {
  prompts, spyQuestions, letterTriggers, confessionTopics, situations, restrictions,
  sensoryQuestions, cutupTexts, portalSeeds, themes, universes, dice, deadlineWords,
  questionTitles, badSongPrompts,
} from '@/data/prompts';
import { narratorPersons, narratorDistances, narratorReliabilities } from '@/data/narrator';
import { rhymeSchemeIds } from '@/data/rhymeSchemes';
import { formStyles, formMeters, formStructures } from '@/data/formWheels';
import { fableProtagonists, fableConflicts } from '@/data/fable';
import { arcEmotions } from '@/data/emotions';
import { titles, characters, songs, poemsSongsRef, quotes, scriptPhrases, images, type RawCultural } from '@/data/cultural';
import {
  culturalSource, realImages, realPrompts, realSongs, realTitles,
} from '@/data/culturalReal';
import {
  lexiconSource, realAdjectives, realInflections, realNouns, realRelations,
  realVerbs,
} from '@/data/lexiconReal';
import { mapRelationsReal } from '@/data/mapRelationsReal';
import { gameIds } from '@/games/registry';

export interface CreditEntry {
  source: string;
  license: string;
  attribution: string;
  url?: string;
}

export interface DataReport {
  builtAt: string;
  totalItems: number;
  byPool: Record<string, number>;
  duplicatesSkipped: number;
  testData: boolean;
}

const BUILD_DATE = culturalSource.builtAt;
let builtData: ReturnType<typeof buildPools> | null = null;
let inflectionKeys: Set<string> | null = null;

function getBuiltData(): ReturnType<typeof buildPools> {
  if (!builtData) {
    builtData = buildPools();
    builtData.pools.games = gameIds().map((id) => makeItem('games', id));
    builtData.report.byPool.games = builtData.pools.games.length;
    builtData.report.totalItems += builtData.pools.games.length;
  }
  return builtData;
}

function getInflectionKeys(): Set<string> {
  if (!inflectionKeys) {
    inflectionKeys = new Set(realInflections.map((form) => form.normalize('NFC').toLowerCase()));
  }
  return inflectionKeys;
}

function makeItem(
  pool: PoolId,
  text: string,
  extra: {
    author?: string; work?: string; year?: number; kind?: string; license?: PoolItem['license'];
    externalLink?: string; tags?: string[]; attribution?: string; sourceUrl?: string;
    extra?: Record<string, string | number | boolean>;
  } = {},
): PoolItem {
  return {
    id: makeId(pool, text),
    pool,
    text,
    author: extra.author,
    work: extra.work,
    year: extra.year,
    kind: extra.kind,
    lang: 'es',
    license: extra.license ?? 'original',
    sourceUrl: extra.sourceUrl,
    externalLink: extra.externalLink,
    attribution: extra.attribution,
    tags: extra.tags,
    fingerprint: fingerprint(text),
    extra: extra.extra,
  };
}

function fromLexicon(pool: PoolId, words: readonly string[]): PoolItem[] {
  const seen = new Set<string>();
  return words.flatMap((text) => {
    const item = makeItem(pool, text, {
      license: 'cc_by_sa',
      sourceUrl: 'https://kaikki.org/eswiktionary/',
      attribution: lexiconSource.attribution,
      extra: { source: 'wiktionary+slr21' },
    });
    if (seen.has(item.fingerprint)) return [];
    seen.add(item.fingerprint);
    return [item];
  });
}

function fromCultural(pool: PoolId, rows: RawCultural[]): PoolItem[] {
  return rows.map((row) => makeItem(pool, row.text, {
    author: row.author,
    work: row.work,
    year: row.year,
    kind: row.kind,
    license: row.license ?? 'original',
    externalLink: row.externalLink,
    tags: row.tags,
    attribution: row.attribution ?? (row.author === 'Cancioneta' ? 'Ilustración original de Cancioneta' : undefined),
    sourceUrl: row.sourceUrl,
    extra: row.extra,
  }));
}

function dedupe(items: PoolItem[], seen: Set<string>, report: { duplicatesSkipped: number }): PoolItem[] {
  return items.filter((item) => {
    if (seen.has(item.fingerprint)) {
      report.duplicatesSkipped += 1;
      return false;
    }
    seen.add(item.fingerprint);
    return true;
  });
}

function buildPools(): { pools: Record<PoolId, PoolItem[]>; report: DataReport; credits: CreditEntry[] } {
  const report = { duplicatesSkipped: 0 };
  const pools = {} as Record<PoolId, PoolItem[]>;
  const contentSeen = new Set<string>();

  pools['words.noun'] = fromLexicon('words.noun', realNouns.length > 0 ? realNouns : nouns);
  pools['words.verb'] = fromLexicon('words.verb', realVerbs.length > 0 ? realVerbs : verbs);
  pools['words.adj'] = fromLexicon('words.adj', realAdjectives.length > 0 ? realAdjectives : adjectives);

  pools['titles'] = dedupe([...fromCultural('titles', realTitles), ...fromCultural('titles', titles)], contentSeen, report);
  pools.characters = dedupe(fromCultural('characters', characters), contentSeen, report);
  pools.songs = dedupe([...fromCultural('songs', realSongs), ...fromCultural('songs', songs)], contentSeen, report);
  pools.poems_songs_ref = dedupe(fromCultural('poems_songs_ref', poemsSongsRef), contentSeen, report);
  pools.quote_public = dedupe(fromCultural('quote_public', quotes), contentSeen, report);
  pools.script_phrases = dedupe(fromCultural('script_phrases', scriptPhrases), contentSeen, report);
  pools.images = dedupe([...fromCultural('images', realImages), ...fromCultural('images', images)], contentSeen, report);

  pools.prompts = dedupe([
    ...fromCultural('prompts', realPrompts),
    ...prompts.map((text) => makeItem('prompts', text)),
  ], contentSeen, report);
  pools.spy_questions = dedupe(spyQuestions.map((text) => makeItem('spy_questions', text)), contentSeen, report);
  pools.letter_triggers = dedupe(letterTriggers.map((text) => makeItem('letter_triggers', text)), contentSeen, report);
  pools.confession_topics = dedupe(confessionTopics.map((text) => makeItem('confession_topics', text)), contentSeen, report);
  pools.situations = dedupe(situations.map((text) => makeItem('situations', text)), contentSeen, report);
  pools.restrictions = dedupe(restrictions.map((text) => makeItem('restrictions', text)), contentSeen, report);
  pools.cutup_texts = dedupe(cutupTexts.map((text) => makeItem('cutup_texts', text)), contentSeen, report);
  pools.portal_seeds = dedupe(portalSeeds.map((text) => makeItem('portal_seeds', text)), contentSeen, report);
  pools.themes = dedupe(themes.map((text) => makeItem('themes', text)), contentSeen, report);

  pools.universes = universes.map((u) => makeItem('universes', u.name, { extra: { terms: u.terms.join('|') } }));
  pools.sensory_questions = sensoryQuestions.flatMap((s) =>
    s.questions.map((q) => makeItem('sensory_questions', q, { tags: [s.sense] })),
  );

  pools.dice_lugar = dice.lugar.map((text) => makeItem('dice_lugar', text));
  pools.dice_personaje = dice.personaje.map((text) => makeItem('dice_personaje', text));
  pools.dice_objeto = dice.objeto.map((text) => makeItem('dice_objeto', text));
  pools.dice_accion = dice.accion.map((text) => makeItem('dice_accion', text));
  pools.dice_emocion = dice.emocion.map((text) => makeItem('dice_emocion', text));
  pools.dice_cualidad = dice.cualidad.map((text) => makeItem('dice_cualidad', text));
  pools.deadline_words = deadlineWords.map((text) => makeItem('deadline_words', text));
  pools.question_titles = questionTitles.map((text) => makeItem('question_titles', text));
  pools.bad_song_prompts = badSongPrompts.map((text) => makeItem('bad_song_prompts', text));
  pools.narrator_person = narratorPersons.map((text) => makeItem('narrator_person', text));
  pools.narrator_distance = narratorDistances.map((text) => makeItem('narrator_distance', text));
  pools.narrator_reliability = narratorReliabilities.map((text) => makeItem('narrator_reliability', text));
  pools.rhyme_schemes = rhymeSchemeIds.map((text) => makeItem('rhyme_schemes', text));
  pools.form_styles = formStyles.map((text) => makeItem('form_styles', text));
  pools.form_meters = formMeters.map((text) => makeItem('form_meters', text));
  pools.form_structures = formStructures.map((text) => makeItem('form_structures', text));
  pools.fable_protagonists = fableProtagonists.map((text) => makeItem('fable_protagonists', text));
  pools.fable_conflicts = fableConflicts.map((text) => makeItem('fable_conflicts', text));
  pools.emotion_arc = arcEmotions.map((text) => makeItem('emotion_arc', text));
  pools.games = [];

  const byPool: Record<string, number> = {};
  let total = 0;
  for (const [pool, items] of Object.entries(pools)) {
    byPool[pool] = items.length;
    total += items.length;
  }

  const credits: CreditEntry[] = [
    {
      source: 'Wikcionario en español (Wiktextract / kaikki.org)',
      license: lexiconSource.license,
      attribution: lexiconSource.attribution,
      url: 'https://kaikki.org/eswiktionary/',
    },
    {
      source: culturalSource.pipeline,
      license: culturalSource.license,
      attribution: culturalSource.attribution,
      url: 'data/cultura_db/data/exports/ultimo/catalogo.csv',
    },
    {
      source: 'Dominio público', license: 'Dominio público', attribution: 'Citas breves de obras cuyo plazo de protección venció.',
    },
    {
      source: 'Metadatos culturales', license: 'Solo metadatos', attribution: 'Títulos, autores y enlaces de consulta. No se incluye texto de obras protegidas.',
      url: 'https://es.wikipedia.org',
    },
    {
      source: 'Wikimedia Commons', license: 'CC BY / CC BY-SA según cada archivo', attribution: 'Imágenes reales con autor y licencia verificados en CulturaDB.',
      url: 'https://commons.wikimedia.org',
    },
    {
      source: 'Datamuse API (rimas online)',
      license: 'Gratuita sin clave hasta 2027-02-01; 100.000 consultas/día',
      attribution: 'La sección Rimas consulta Datamuse solo al tocar Buscar; la palabra no se guarda.',
      url: 'https://www.datamuse.com/api/',
    },
    {
      source: 'Fraunces (identidad)',
      license: 'SIL Open Font License 1.1',
      attribution: 'Copyright 2018 The Fraunces Project Authors. Paquete @expo-google-fonts/fraunces 0.4.1 (v38).',
      url: 'https://scripts.sil.org/OFL',
    },
    {
      source: 'Literata (escritura)',
      license: 'SIL Open Font License 1.1',
      attribution: 'Copyright 2017 The Literata Project Authors. Paquete @expo-google-fonts/literata 0.4.3.',
      url: 'https://scripts.sil.org/OFL',
    },
    {
      source: 'Inter (interfaz)',
      license: 'SIL Open Font License 1.1',
      attribution: 'Copyright 2020 The Inter Project Authors. Paquete @expo-google-fonts/inter 0.4.2.',
      url: 'https://scripts.sil.org/OFL',
    },
    {
      source: 'Íconos Feather',
      license: 'MIT',
      attribution: 'Copyright 2015 Joel Arvidsson. Paquete @expo/vector-icons 15.1.1.',
      url: 'https://github.com/expo/vector-icons',
    },
    {
      source: 'Piano sintetizado', license: 'Original', attribution: 'Muestras generadas por síntesis aditiva para esta versión.',
    },
  ];

  return {
    pools,
    credits,
    report: {
      builtAt: BUILD_DATE,
      totalItems: total,
      byPool,
      duplicatesSkipped: report.duplicatesSkipped,
      testData: false,
    },
  };
}

export class DataService {
  getPool(pool: PoolId): PoolItem[] {
    return getBuiltData().pools[pool] ?? [];
  }

  getRelations(word: string): SemanticRelations | undefined {
    const key = word.normalize('NFC').toLowerCase();
    const base = realRelations[key];
    const extra = mapRelationsReal[key];
    if (!base && !extra) return undefined;
    return {
      synonyms: base?.synonyms ?? [],
      hypernyms: base?.hypernyms ?? [],
      hyponyms: base?.hyponyms ?? [],
      related: base?.related ?? [],
      parts: extra?.parts ?? [],
      derived: extra?.derived ?? [],
    };
  }

  isValidWord(word: string): boolean {
    return getInflectionKeys().has(word.normalize('NFC').toLowerCase());
  }

  getById(pool: PoolId, id: string): PoolItem | undefined {
    return this.getPool(pool).find((item) => item.id === id);
  }

  getAll(): PoolItem[] {
    return Object.values(getBuiltData().pools).flat();
  }

  getReport(): DataReport {
    return getBuiltData().report;
  }

  getCredits(): CreditEntry[] {
    return getBuiltData().credits;
  }

  search(query: string, pools?: PoolId[]): PoolItem[] {
    const needle = query.normalize('NFC').toLowerCase().trim();
    if (!needle) return [];
    const source = pools ? pools.flatMap((p) => this.getPool(p)) : this.getAll();
    return source.filter((item) => item.text.toLowerCase().includes(needle)).slice(0, 60);
  }

  registerGamePool(ids: string[]): void {
    const data = getBuiltData();
    data.pools.games = ids.map((id) => makeItem('games', id));
    data.report.byPool.games = data.pools.games.length;
    data.report.totalItems = Object.values(data.report.byPool).reduce((sum, count) => sum + count, 0);
  }
}

export const dataService = new DataService();

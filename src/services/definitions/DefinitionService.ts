export interface WordDefinition {
  word: string;
  definition: string;
  source: 'wiktionary' | 'none';
}

const memoryCache = new Map<string, WordDefinition>();

function normalize(word: string): string {
  return word.normalize('NFC').toLowerCase().trim();
}

function pickDefinition(payload: unknown): string | null {
  if (!payload || typeof payload !== 'object') return null;
  const record = payload as Record<string, unknown>;
  const langEntries = (record.es ?? record.en ?? Object.values(record)[0]) as unknown;
  if (!Array.isArray(langEntries)) return null;
  for (const entry of langEntries) {
    if (!entry || typeof entry !== 'object') continue;
    const defs = (entry as { definitions?: unknown }).definitions;
    if (!Array.isArray(defs)) continue;
    for (const def of defs) {
      if (!def || typeof def !== 'object') continue;
      const text = (def as { definition?: unknown }).definition;
      if (typeof text === 'string') {
        const clean = text.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
        if (clean) return clean;
      }
    }
  }
  return null;
}

export async function getWordDefinition(word: string): Promise<WordDefinition> {
  const key = normalize(word);
  if (!key) return { word, definition: '', source: 'none' };
  const cached = memoryCache.get(key);
  if (cached) return cached;

  try {
    const response = await fetch(`https://es.wiktionary.org/api/rest_v1/page/definition/${encodeURIComponent(key)}`);
    if (response.ok) {
      const payload: unknown = await response.json();
      const definition = pickDefinition(payload);
      if (definition) {
        const result: WordDefinition = { word, definition, source: 'wiktionary' };
        memoryCache.set(key, result);
        return result;
      }
    }
  } catch {
    // Sin conexión o sin definición: se usa fallback.
  }

  const result: WordDefinition = { word, definition: '', source: 'none' };
  memoryCache.set(key, result);
  return result;
}

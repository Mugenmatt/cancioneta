export interface WordDefinition {
  word: string;
  definition: string;
  source: 'wiktionary' | 'none';
}

const memoryCache = new Map<string, WordDefinition>();

function normalize(word: string): string {
  return word.normalize('NFC').toLowerCase().trim();
}

const KEPT_TEMPLATES = new Set(['plm', 'l', 'l+', 'variante', 'grafía']);

function unwrapTemplates(text: string): string {
  let result = text;
  for (let depth = 0; depth < 4; depth += 1) {
    const next = result.replace(/\{\{([^{}]*)\}\}/g, (_match, inner: string) => {
      const [rawName, ...args] = inner.split('|');
      const name = rawName?.trim().toLowerCase() ?? '';
      if (!KEPT_TEMPLATES.has(name)) return '';
      const named = args.find((arg) => /^(?:glosa|t\d+|text)\s*=/i.test(arg.trim()));
      const rawValue = name === 'plm' ? (args[0] ?? '') : (named ?? args[1] ?? '');
      return rawValue.replace(/^\w+\s*=\s*/, '').trim();
    });
    if (next === result) break;
    result = next;
  }
  return result;
}

function cleanWikitext(raw: string): string {
  return unwrapTemplates(raw)
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<ref[^>]*>[\s\S]*?<\/ref>/gi, '')
    .replace(/<ref[^>]*\/>/gi, '')
    .replace(/\[\[(?:[^\]|]+\|)?([^\]]+)\]\]/g, '$1')
    .replace(/\[https?:\/\/\S+\s+([^\]]+)\]/g, '$1')
    .replace(/<[^>]+>/g, '')
    .replace(/'{2,}/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .replace(/\s+([,.;:])/g, '$1')
    .replace(/^\s*[:;,\-]\s*/, '')
    .trim();
}

function getSpanishSection(content: string): string {
  const lines = content.split(/\r?\n/);
  const start = lines.findIndex((line) => /^==\s*\{\{\s*lengua\s*\|\s*es\s*\}\}\s*==\s*$/i.test(line.trim()));
  if (start === -1) return '';
  const end = lines.findIndex((line, index) => index > start && /^==(?!=)/.test(line.trim()));
  return lines.slice(start + 1, end === -1 ? lines.length : end).join('\n');
}

function pickDefinition(payload: unknown): string | null {
  if (!payload || typeof payload !== 'object') return null;
  const pages = (payload as { query?: { pages?: unknown } }).query?.pages;
  if (!Array.isArray(pages) || !pages[0] || typeof pages[0] !== 'object') return null;
  const revisions = (pages[0] as { revisions?: unknown }).revisions;
  if (!Array.isArray(revisions) || !revisions[0] || typeof revisions[0] !== 'object') return null;
  const slots = (revisions[0] as { slots?: unknown }).slots;
  if (!slots || typeof slots !== 'object') return null;
  const main = (slots as { main?: unknown }).main;
  if (!main || typeof main !== 'object') return null;
  const content = (main as { content?: unknown }).content;
  if (typeof content !== 'string') return null;

  for (const line of getSpanishSection(content).split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!/^;\s*\d+\s*[:.]?/.test(trimmed)) continue;
    const definition = cleanWikitext(trimmed.replace(/^;\s*\d+\s*[:.]?\s*/, ''));
    if (/[\p{L}\p{N}]{2,}/u.test(definition)) return definition;
  }
  return null;
}

export async function getWordDefinition(word: string): Promise<WordDefinition> {
  const key = normalize(word);
  if (!key) return { word, definition: '', source: 'none' };
  const cached = memoryCache.get(key);
  if (cached) return cached;

  try {
    const response = await fetch(`https://es.wiktionary.org/w/api.php?action=query&prop=revisions&rvprop=content&rvslots=main&format=json&formatversion=2&redirects=1&origin=*&titles=${encodeURIComponent(key)}`);
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

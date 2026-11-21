const ARTICLES = ['el', 'la', 'los', 'las', 'un', 'una', 'unos', 'unas', 'lo'];

export interface NormalizeOptions {
  stripArticles?: boolean;
  keepSpaces?: boolean;
}

export function normalize(text: string, options: NormalizeOptions = {}): string {
  let value = text.normalize('NFC').toLowerCase().trim();
  value = value.replace(/ñ/g, '\u0001');
  value = value.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  value = value.replace(/\u0001/g, 'ñ');
  value = value.replace(/[“”"'«»‘’.,;:!¡?¿()[\]{}<>/\\|@#$%^&*_+=~`-]/g, ' ');
  value = value.replace(/\s+/g, ' ').trim();
  if (options.stripArticles) {
    const parts = value.split(' ');
    if (parts.length > 1 && ARTICLES.includes(parts[0])) value = parts.slice(1).join(' ');
  }
  return options.keepSpaces === false ? value.replace(/\s+/g, '') : value;
}

function fnv1a(text: string, seed: number): number {
  let hash = seed >>> 0;
  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash >>> 0;
}

export function hash64(text: string): string {
  const a = fnv1a(text, 0x811c9dc5);
  const b = fnv1a(`${text}#${a}`, 0x9e3779b9);
  return `${a.toString(16).padStart(8, '0')}${b.toString(16).padStart(8, '0')}`;
}

export function fingerprint(text: string, options: NormalizeOptions = {}): string {
  return hash64(normalize(text, options));
}

export function shortFingerprint(text: string, options: NormalizeOptions = {}): string {
  return fingerprint(text, options).slice(0, 8);
}

export function makeId(pool: string, text: string, options: NormalizeOptions = {}): string {
  return `${pool}:${shortFingerprint(text, options)}`;
}

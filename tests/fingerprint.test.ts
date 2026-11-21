import { fingerprint, makeId, normalize, shortFingerprint } from '@/services/random/fingerprint';

describe('normalización', () => {
  it('quita tildes, mayúsculas y puntuación, pero conserva la ñ', () => {
    expect(normalize('  Canción, AÑO; mañana!  ')).toBe('cancion año mañana');
  });

  it('colapsa espacios y puede quitar artículos iniciales', () => {
    expect(normalize('la   casa   roja', { stripArticles: true })).toBe('casa roja');
    expect(normalize('los', { stripArticles: true })).toBe('los');
  });

  it('genera la misma huella para variantes equivalentes', () => {
    expect(fingerprint('Casa Roja')).toBe(fingerprint('  casa roja! '));
    expect(fingerprint('casa roja')).not.toBe(fingerprint('casa azul'));
  });

  it('produce ids estables con pool y ocho caracteres', () => {
    const id = makeId('words.noun', 'Árbol');
    expect(id.startsWith('words.noun:')).toBe(true);
    expect(id.split(':')[1]).toHaveLength(8);
    expect(shortFingerprint('Árbol')).toBe(id.split(':')[1]);
  });
});

import { findLocalRhymes, normalizeRhymeWord, rhymeKeys } from '@/core/rhyme';

describe('rhyme', () => {
  it('calcula claves consonantes y asonantes desde la vocal tónica', () => {
    expect(rhymeKeys('amor')).toEqual({ consonant: 'or', assonant: 'o' });
    expect(rhymeKeys('dolor')).toEqual({ consonant: 'or', assonant: 'o' });
    expect(rhymeKeys('sol')).toEqual({ consonant: 'ol', assonant: 'o' });
    expect(rhymeKeys('casa')).toEqual({ consonant: 'asa', assonant: 'aa' });
    expect(rhymeKeys('corazón')).toEqual({ consonant: 'on', assonant: 'o' });
  });

  it('respeta diptongos, hiatos y vocales acentuadas débiles', () => {
    expect(rhymeKeys('tiempo')?.consonant).toBe('iempo');
    expect(rhymeKeys('mío')).toEqual({ consonant: 'io', assonant: 'io' });
    expect(rhymeKeys('maíz')?.consonant).toBe('iz');
  });

  it('normaliza sin alterar la ñ', () => {
    expect(normalizeRhymeWord('ÁmOR')).toBe('amor');
    expect(normalizeRhymeWord('año')).toBe('año');
  });

  it('separa rimas consonantes de asonantes y quita duplicados', () => {
    const result = findLocalRhymes('amor', ['dolor', 'sol', 'casa', 'amor', 'amor de', 'Dolor']);
    expect(result.consonants).toEqual(['dolor']);
    expect(result.assonants).toEqual(['sol']);
  });

  it('devuelve listas vacías para una búsqueda vacía', () => {
    expect(findLocalRhymes('', ['amor'])).toEqual({ consonants: [], assonants: [] });
  });
});

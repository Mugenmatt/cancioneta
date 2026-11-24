import {
  CHORDS_TEXT,
  chordsBpmValue,
  chordsInKeyText,
  chordsKeySource,
  chordsKeyTitle,
  chordsMeterLabel,
  chordsMoveLabel,
  chordsQualityChangeLabel,
} from '@/content/app';

describe('textos de la pantalla de acordes', () => {
  it('muestra la tonalidad elegida, posible o ausente', () => {
    expect(chordsKeyTitle('Do mayor', 'La menor')).toBe('Do mayor');
    expect(chordsKeyTitle(null, 'La menor')).toBe('Posible: La menor');
    expect(chordsKeyTitle(null, null)).toBe('Sin tonalidad');
  });

  it('explica el origen de la tonalidad en es-AR', () => {
    expect(chordsKeySource(true, false)).toBe('Elegida a mano');
    expect(chordsKeySource(false, true)).toBe('Ambigua · elegí una');
    expect(chordsKeySource(false, false)).toBe('Detección automática');
  });

  it('compone etiquetas accesibles y valores dinámicos', () => {
    expect(chordsMeterLabel('3/4')).toBe('Compás 3/4');
    expect(chordsMoveLabel('Am')).toBe('Mover a la izquierda Am');
    expect(chordsQualityChangeLabel('C7')).toBe('Cambiar calidad de C7');
    expect(chordsBpmValue(120)).toBe('120 BPM');
    expect(chordsInKeyText('Do mayor', ['C', 'Am'])).toBe('Acordes en Do mayor: C · Am');
  });

  it('mantiene los pasos de la hoja secundaria', () => {
    expect(Object.values(CHORDS_TEXT.steps)).toEqual(['Progresión', 'Sonido', 'Orden', 'Explorar']);
  });
});

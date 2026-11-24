import { dataService } from '@/services/data/DataService';
import { useLyricsStore } from '@/stores/lyricsStore';
import { G44_MINUTES, G44_TEXT } from '@/content/games/g44';
import { badSongDeadline, makeBadSongStimulus } from '@/games/runtime/g44Logic';

describe('G-44 Canción mala', () => {
  it('tiene 40 consignas originales sin repetir', () => {
    const pool = dataService.getPool('bad_song_prompts');
    expect(pool).toHaveLength(40);
    expect(pool.every((item) => item.license === 'original')).toBe(true);
    expect(new Set(pool.map((item) => item.fingerprint)).size).toBe(40);
    expect(pool.map((item) => item.text)).toEqual(expect.arrayContaining([
      'Escribí una canción sobre un lunes que empezó dos veces.',
      'Hacé una letra sobre un ascensor que se negaba a subir.',
    ]));
  });

  it('usa un temporizador fijo de diez minutos', () => {
    expect(G44_MINUTES).toBe(10);
    expect(badSongDeadline(10, 5_000)).toBe(600_000 + 5_000);
  });

  it('muestra la consigna en el editor sin insertarla en la letra', () => {
    const stimulus = makeBadSongStimulus({
      prompt: 'Escribí sobre un ascensor que se negaba a subir.',
      title: G44_TEXT.editorTitle('Escribí sobre un ascensor que se negaba a subir.'),
      groupTitle: G44_TEXT.promptEyebrow,
      note: G44_TEXT.goodBody,
    });
    expect(stimulus.gameId).toBe('g44');
    expect(stimulus.items).toEqual(['Escribí sobre un ascensor que se negaba a subir.']);
    expect(stimulus.groups).toEqual([{
      title: G44_TEXT.promptEyebrow,
      items: ['Escribí sobre un ascensor que se negaba a subir.'],
    }]);
  });

  it('«Tirar» limpia todo el texto del cuaderno', () => {
    useLyricsStore.getState().replaceAll('estrofa mala\n\nestribillo malo');
    expect(useLyricsStore.getState().exportText(false)).toContain('estrofa mala');
    useLyricsStore.getState().clear();
    expect(useLyricsStore.getState().exportText(false)).toBe('');
  });
});

import { dataService } from '@/services/data/DataService';
import {
  canGoToEditor, makeQuestionStimulus, selectedQuestions, writtenQuestions,
  type QuestionEntry,
} from '@/games/runtime/g41Logic';
import { G41_MIN_QUESTIONS, G41_MIN_SELECTED } from '@/content/games/g41';

function entries(...specs: Array<[string, boolean]>): QuestionEntry[] {
  return specs.map(([text, selected], id) => ({ id, text, selected }));
}

describe('G-41 Título interrogante', () => {
  it('tiene 60 títulos originales sin repetir', () => {
    const pool = dataService.getPool('question_titles');
    expect(pool).toHaveLength(60);
    expect(pool.every((item) => item.license === 'original')).toBe(true);
    expect(new Set(pool.map((item) => item.fingerprint)).size).toBe(60);
    expect(pool.map((item) => item.text)).toEqual(expect.arrayContaining([
      'La casa que se quedó despierta', 'El último tren no espera',
    ]));
  });

  it('pide al menos tres preguntas escritas y dos marcadas', () => {
    expect([G41_MIN_QUESTIONS, G41_MIN_SELECTED]).toEqual([3, 2]);
    expect(canGoToEditor(entries(['¿Quién espera?', true], ['¿Por qué?', true], ['¿Y ahora?', false]))).toBe(true);
    expect(canGoToEditor(entries(['¿Quién espera?', true], ['¿Por qué?', true]))).toBe(false);
    expect(canGoToEditor(entries(['¿Quién espera?', true], ['¿Por qué?', false], ['  ', false]))).toBe(false);
  });

  it('ignora preguntas vacías al escribir y al marcar', () => {
    const list = entries([' ¿Quién volvió? ', true], ['   ', true], ['¿Qué pasó?', false]);
    expect(writtenQuestions(list)).toEqual(['¿Quién volvió?', '¿Qué pasó?']);
    expect(selectedQuestions(list)).toEqual(['¿Quién volvió?']);
  });

  it('muestra las preguntas elegidas arriba del cuaderno', () => {
    const stimulus = makeQuestionStimulus({
      title: 'Título: La casa que se quedó despierta',
      questions: ['¿Quién espera?', '¿Por qué?'],
      groupTitle: 'Preguntas elegidas',
      note: 'Respondelas en un verso y un estribillo.',
    });
    expect(stimulus.gameId).toBe('g41');
    expect(stimulus.title).toBe('Título: La casa que se quedó despierta');
    expect(stimulus.items).toEqual(['¿Quién espera?', '¿Por qué?']);
    expect(stimulus.groups).toEqual([{ title: 'Preguntas elegidas', items: ['¿Quién espera?', '¿Por qué?'] }]);
  });
});

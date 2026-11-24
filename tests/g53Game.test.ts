import { G53_QUESTIONS, G53_RECORD_SECONDS, G53_TEXT } from '@/content/games/g53';
import { gameThemes } from '@/design/themes';
import { gameById } from '@/games/registry';
import {
  emptyAnswers,
  hasAnyAnswer,
  makeG53Draft,
  makeG53Stimulus,
  recordingLabel,
  secondsLeft,
  setAnswer,
} from '@/games/runtime/g53Logic';

describe('G-53 Paisaje sonoro', () => {
  it('pide 20 segundos y tres preguntas guía', () => {
    expect(G53_RECORD_SECONDS).toBe(20);
    expect(G53_QUESTIONS.map((question) => question.id)).toEqual(['far', 'near', 'missing']);
    expect(G53_QUESTIONS.map((question) => question.text)).toEqual([
      '¿Qué suena lejos?',
      '¿Qué suena cerca?',
      '¿Qué falta?',
    ]);
    expect(secondsLeft(7)).toBe(13);
    expect(secondsLeft(30)).toBe(0);
    expect(recordingLabel(8)).toBe(G53_TEXT.recordingSeconds(8));
  });

  it('arranca vacío y permite responder cada pregunta sin pisar las otras', () => {
    const empty = emptyAnswers();
    expect(hasAnyAnswer(empty)).toBe(false);
    const filled = setAnswer(empty, 'near', 'el mate contra la mesa');
    expect(filled).toEqual({ far: '', near: 'el mate contra la mesa', missing: '' });
    expect(empty).toEqual({ far: '', near: '', missing: '' });
    expect(hasAnyAnswer(filled)).toBe(true);
  });

  it('arma borrador y panel del editor solo con las respuestas escritas', () => {
    const answers = { far: 'un colectivo', near: 'el mate', missing: 'una voz' };
    expect(makeG53Draft(answers)).toBe('[Lejos] un colectivo\n\n[Cerca] el mate\n\n[Falta] una voz');
    const stimulus = makeG53Stimulus(answers);
    expect(stimulus.gameId).toBe('g53');
    expect(stimulus.title).toBe(G53_TEXT.editorTitle);
    expect(stimulus.groups?.map((group) => group.title)).toEqual(G53_QUESTIONS.map((question) => question.text));
    expect(makeG53Stimulus(emptyAnswers()).groups).toEqual([]);
  });

  it('tiene ficha y tema propios', () => {
    expect(gameById('g53')?.name).toBe('Paisaje sonoro');
    expect(gameById('g53')?.themeId).toBe('g53');
    expect(gameThemes.g53.id).toBe('g53');
  });
});

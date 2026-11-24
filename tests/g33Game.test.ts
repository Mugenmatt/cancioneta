import { dataService } from '@/services/data/DataService';
import { formatCountdown, includesTarget, remainingSeconds } from '@/editor/stimulusStatus';
import { deadlineAtFrom, makeDeadlineStimulus } from '@/games/runtime/g33Logic';
import { G33_DURATIONS } from '@/content/games/g33';

describe('G-33 Palabra con plazo', () => {
  it('tiene 60 palabras originales sin repetir', () => {
    const pool = dataService.getPool('deadline_words');
    expect(pool).toHaveLength(60);
    expect(pool.every((item) => item.license === 'original')).toBe(true);
    expect(new Set(pool.map((item) => item.fingerprint)).size).toBe(60);
    expect(pool.map((item) => item.text)).toEqual(expect.arrayContaining(['llave', 'hilo', 'banco', 'bala', 'ticket']));
  });

  it('ofrece los tres plazos pedidos', () => {
    expect(G33_DURATIONS.map((option) => option.minutes)).toEqual([20, 60, 1440]);
    expect(G33_DURATIONS.map((option) => option.label)).toEqual(['20 min', '1 h', '24 h']);
  });

  it('detecta la palabra en cualquier lugar sin confundir prefijos ni tildes', () => {
    expect(includesTarget('Guardo la llave en el bolsillo.', 'llave')).toBe(true);
    expect(includesTarget('Mañana vuelvo.', 'manana')).toBe(true);
    expect(includesTarget('La balanza está quieta.', 'bala')).toBe(false);
    expect(includesTarget('Seguí el hilo suelto.', 'hilo suelto')).toBe(true);
    expect(includesTarget('Nada aquí.', '')).toBe(false);
  });

  it('calcula el tiempo restante y lo formatea', () => {
    expect(deadlineAtFrom(20, 1_000)).toBe(1_200_000 + 1_000);
    expect(remainingSeconds(1_200_000, 0)).toBe(1200);
    expect(remainingSeconds(1_200_000, 1_200_000)).toBe(0);
    expect(remainingSeconds(undefined, 0)).toBe(0);
    expect(formatCountdown(1200)).toBe('20:00');
    expect(formatCountdown(59)).toBe('00:59');
    expect(formatCountdown(-4)).toBe('00:00');
  });

  it('arma el estímulo con palabra, plazo y estado para el editor', () => {
    const stimulus = makeDeadlineStimulus({
      target: 'llave',
      deadlineAt: 1_200_000,
      title: 'Palabra: llave',
      groupTitle: 'Palabra del plazo',
      note: 'Puede aparecer en cualquier parte.',
      deadlineLabel: 'Tiempo restante',
      doneLabel: 'Ya aparece',
      pendingLabel: 'Todavía no aparece',
    });
    expect(stimulus.gameId).toBe('g33');
    expect(stimulus.items).toEqual(['llave']);
    expect(stimulus.deadlineAt).toBe(1_200_000);
    expect(stimulus.check).toEqual({ target: 'llave', doneLabel: 'Ya aparece', pendingLabel: 'Todavía no aparece' });
  });
});

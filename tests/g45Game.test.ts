import { G45_DRAFT_LABELS, G45_MAX_LINES, G45_MIN_LINES, G45_REST_MINUTES, G45_TEXT } from '@/content/games/g45';
import { gameThemes } from '@/design/themes';
import { gameById } from '@/games/registry';
import {
  canFinish,
  G45_REST_SECONDS,
  hasValidLineCount,
  makeG45Draft,
  makeG45Stimulus,
  restDeadline,
  splitLines,
} from '@/games/runtime/g45Logic';

const low = 'Arreglé la canilla\nNadie dijo nada\nCaminé hasta el mercado\nVolví con el mate';
const high = 'Me sorprendió la calma. Vino sin avisar. Quedó en la mesa. No la busqué.';

describe('G-45 Dos registros', () => {
  it('cuenta entre 4 y 6 líneas por registro', () => {
    expect(G45_MIN_LINES).toBe(4);
    expect(G45_MAX_LINES).toBe(6);
    expect(splitLines(low)).toHaveLength(4);
    expect(splitLines(high)).toHaveLength(4);
    expect(hasValidLineCount(low)).toBe(true);
    expect(hasValidLineCount('uno\ndos\ntres')).toBe(false);
    expect(hasValidLineCount('1\n2\n3\n4\n5\n6\n7')).toBe(false);
  });

  it('pide las dos voces y la conexión antes de escribir', () => {
    expect(canFinish(low, high, '')).toBe(false);
    expect(canFinish(low, 'solo una línea', 'la calma')).toBe(false);
    expect(canFinish(low, high, 'la calma llegó después del gesto')).toBe(true);
  });

  it('el descanso es de 30 minutos y se puede saltear', () => {
    expect(G45_REST_MINUTES).toBe(30);
    expect(G45_REST_SECONDS).toBe(1800);
    expect(restDeadline(30, 1_000)).toBe(1_800_000 + 1_000);
    expect(restDeadline(-5, 500)).toBe(500);
  });

  it('arma el borrador con verso, estribillo y tema central opcional', () => {
    const plain = makeG45Draft({
      lowText: low,
      highText: high,
      connection: 'la calma llegó después del gesto',
      addPreChorus: false,
      preChorus: '',
      centralLine: '',
    });
    expect(plain).toContain(`${G45_DRAFT_LABELS.connection}: la calma llegó después del gesto`);
    expect(plain).toContain(`[${G45_DRAFT_LABELS.verse}]`);
    expect(plain).toContain(`[${G45_DRAFT_LABELS.chorus}]`);
    expect(plain).not.toContain(G45_DRAFT_LABELS.preChorus);

    const full = makeG45Draft({
      lowText: low,
      highText: high,
      connection: 'la calma llegó después del gesto',
      addPreChorus: true,
      preChorus: 'Antes de nombrarlo',
      centralLine: 'Vino sin avisar',
    });
    expect(full).toContain(`[${G45_DRAFT_LABELS.preChorus}]\nAntes de nombrarlo`);
    expect(full).toContain(`${G45_DRAFT_LABELS.central}: Vino sin avisar`);
  });

  it('muestra los bloques en el panel del editor', () => {
    const stimulus = makeG45Stimulus({
      lowText: low,
      highText: high,
      connection: 'la calma llegó después del gesto',
      addPreChorus: true,
      preChorus: 'Antes de nombrarlo',
      centralLine: 'Vino sin avisar',
    });
    expect(stimulus.gameId).toBe('g45');
    expect(stimulus.groups?.map((group) => group.title)).toEqual([
      G45_DRAFT_LABELS.verse,
      G45_DRAFT_LABELS.preChorus,
      G45_DRAFT_LABELS.chorus,
      G45_TEXT.connectionQuestion,
      G45_DRAFT_LABELS.central,
    ]);
    expect(stimulus.groups?.[2].items).toHaveLength(4);
  });

  it('tiene ficha y tema propios', () => {
    expect(gameById('g45')?.name).toBe('Dos registros');
    expect(gameById('g45')?.themeId).toBe('g45');
    expect(gameThemes.g45.id).toBe('g45');
  });
});

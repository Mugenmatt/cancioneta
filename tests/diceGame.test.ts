import { applyDraw, canRollDie, poolsToRoll } from '@/games/g24-dados/logic';

const dice = [
  { pool: 'dice_lugar' as const, label: 'Lugar' },
  { pool: 'dice_objeto' as const, label: 'Objeto' },
];

describe('Dados Líricos', () => {
  it('no vuelve a tirar un dado bloqueado', () => {
    expect(canRollDie({ dice_lugar: true }, 'dice_lugar')).toBe(false);
    expect(canRollDie({ dice_lugar: false }, 'dice_lugar')).toBe(true);
    expect(canRollDie({ dice_lugar: true }, 'dice_lugar', true)).toBe(true);
  });

  it('respeta los bloqueos al tirar todos', () => {
    expect(poolsToRoll(dice, { dice_lugar: true })).toEqual(['dice_objeto']);
    expect(poolsToRoll(dice, { dice_lugar: true }, true)).toEqual(['dice_lugar', 'dice_objeto']);
  });

  it('no cambia un valor cuando no hay resultado', () => {
    const values = { dice_lugar: 'playa' };
    expect(applyDraw(values, 'dice_lugar', undefined)).toBe(values);
    expect(applyDraw(values, 'dice_lugar', 'bosque')).toEqual({ dice_lugar: 'bosque' });
  });
});

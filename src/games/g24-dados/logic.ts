import type { PoolId } from '@/core/types';

export interface DieConfig {
  pool: PoolId;
  label: string;
}

export function canRollDie(locked: Record<string, boolean>, pool: PoolId, force = false): boolean {
  return force || !locked[pool];
}

export function poolsToRoll(dice: readonly DieConfig[], locked: Record<string, boolean>, force = false): PoolId[] {
  return dice.filter((die) => canRollDie(locked, die.pool, force)).map((die) => die.pool);
}

export function applyDraw(values: Record<string, string>, pool: PoolId, drawn: string | undefined): Record<string, string> {
  if (!drawn) return values;
  return { ...values, [pool]: drawn };
}

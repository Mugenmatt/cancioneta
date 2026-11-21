export type MeterId = '2/4' | '3/4' | '4/4' | '5/4' | '6/4' | '7/4' | '6/8' | '9/8' | '12/8';
export type Accent = 'strong' | 'secondary' | 'weak';

export interface Meter {
  id: MeterId;
  pulses: number;
  accents: Accent[];
  compound: boolean;
}

export const METERS: Meter[] = [
  { id: '2/4', pulses: 2, accents: ['strong', 'weak'], compound: false },
  { id: '3/4', pulses: 3, accents: ['strong', 'weak', 'weak'], compound: false },
  { id: '4/4', pulses: 4, accents: ['strong', 'weak', 'secondary', 'weak'], compound: false },
  { id: '5/4', pulses: 5, accents: ['strong', 'weak', 'weak', 'secondary', 'weak'], compound: false },
  { id: '6/4', pulses: 6, accents: ['strong', 'weak', 'weak', 'secondary', 'weak', 'weak'], compound: false },
  { id: '7/4', pulses: 7, accents: ['strong', 'weak', 'weak', 'secondary', 'weak', 'secondary', 'weak'], compound: false },
  { id: '6/8', pulses: 2, accents: ['strong', 'secondary'], compound: true },
  { id: '9/8', pulses: 3, accents: ['strong', 'secondary', 'secondary'], compound: true },
  { id: '12/8', pulses: 4, accents: ['strong', 'secondary', 'secondary', 'secondary'], compound: true },
];

export function getMeter(id: MeterId): Meter {
  return METERS.find((meter) => meter.id === id) ?? METERS[2];
}

export function nextMetronomePulse(current: number, meter: Meter): number {
  return (current + 1) % meter.pulses;
}

export function pulseIntervalMs(bpm: number): number {
  return Math.max(80, 60000 / Math.max(40, Math.min(300, bpm)));
}

export function chordBarMs(bpm: number, meter: Meter): number {
  return meter.pulses * pulseIntervalMs(bpm);
}

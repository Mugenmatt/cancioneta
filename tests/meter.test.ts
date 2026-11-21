import { METERS, chordBarMs, getMeter, nextMetronomePulse, pulseIntervalMs, type MeterId } from '@/music/meter';

describe('compases del metrónomo', () => {
  it('incluye los nueve compases pedidos', () => {
    expect(METERS.map((meter) => meter.id)).toEqual<MeterId[]>([
      '2/4', '3/4', '4/4', '5/4', '6/4', '7/4', '6/8', '9/8', '12/8',
    ]);
  });

  it('usa el pulso con puntillo en compases compuestos', () => {
    expect(getMeter('6/8').pulses).toBe(2);
    expect(getMeter('9/8').pulses).toBe(3);
    expect(getMeter('12/8').pulses).toBe(4);
    expect(getMeter('6/8').compound).toBe(true);
  });

  it('acentúa el grupo inicial y los secundarios acordados', () => {
    expect(getMeter('4/4').accents).toEqual(['strong', 'weak', 'secondary', 'weak']);
    expect(getMeter('5/4').accents).toEqual(['strong', 'weak', 'weak', 'secondary', 'weak']);
    expect(getMeter('7/4').accents).toEqual(['strong', 'weak', 'weak', 'secondary', 'weak', 'secondary', 'weak']);
    expect(getMeter('12/8').accents).toEqual(['strong', 'secondary', 'secondary', 'secondary']);
  });

  it('cada compás tiene un solo acento fuerte y arranca en él', () => {
    for (const meter of METERS) {
      expect(meter.accents).toHaveLength(meter.pulses);
      expect(meter.accents[0]).toBe('strong');
      expect(meter.accents.filter((accent) => accent === 'strong')).toHaveLength(1);
    }
  });

  it('vuelve al primer pulso al cerrar el compás', () => {
    expect(nextMetronomePulse(3, getMeter('4/4'))).toBe(0);
    expect(nextMetronomePulse(1, getMeter('6/8'))).toBe(0);
    expect(nextMetronomePulse(6, getMeter('7/4'))).toBe(0);
  });

  it('respeta el rango de BPM', () => {
    expect(pulseIntervalMs(90)).toBeCloseTo(666.67, 1);
    expect(pulseIntervalMs(200)).toBe(300);
    expect(pulseIntervalMs(300)).toBe(200);
    expect(pulseIntervalMs(400)).toBe(200);
    expect(pulseIntervalMs(20)).toBe(1500);
  });

  it('un acorde dura un compás completo en cada métrica', () => {
    expect(chordBarMs(90, getMeter('4/4'))).toBeCloseTo(2666.67, 1);
    expect(chordBarMs(90, getMeter('6/8'))).toBeCloseTo(1333.33, 1);
    expect(chordBarMs(120, getMeter('7/4'))).toBe(3500);
    for (const meter of METERS) {
      expect(chordBarMs(100, meter)).toBeCloseTo(meter.pulses * pulseIntervalMs(100), 5);
    }
  });
});

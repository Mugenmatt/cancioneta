const STEP = 0.05;

export function clampVolume(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(1, value));
}

export function volumeFromPosition(position: number, width: number): number {
  if (width <= 0) return 0;
  const raw = clampVolume(position / width);
  return Number((Math.round(raw / STEP) * STEP).toFixed(2));
}

export function positionFromVolume(value: number, width: number): number {
  return clampVolume(value) * Math.max(0, width);
}

export function clampToRange(value: number, min: number, max: number, step: number): number {
  if (!Number.isFinite(value) || max <= min || step <= 0) return min;
  const bounded = Math.max(min, Math.min(max, value));
  return Number((min + Math.round((bounded - min) / step) * step).toFixed(4));
}

export function valueFromPosition(position: number, width: number, min: number, max: number, step: number): number {
  if (width <= 0 || max <= min) return min;
  const raw = Math.max(0, Math.min(1, position / width));
  return clampToRange(min + raw * (max - min), min, max, step);
}

export function positionFromValue(value: number, width: number, min: number, max: number): number {
  if (max <= min) return 0;
  const bounded = Math.max(min, Math.min(max, value));
  return ((bounded - min) / (max - min)) * Math.max(0, width);
}

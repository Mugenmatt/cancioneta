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

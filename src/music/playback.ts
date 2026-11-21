export function nextPlaybackStep(current: number, length: number, loop: boolean): number | null {
  if (length <= 0) return null;
  if (current < 0) return 0;
  const next = current + 1;
  if (next < length) return next;
  return loop ? 0 : null;
}

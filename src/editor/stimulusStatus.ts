export function normalizeForMatch(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
}

export function includesTarget(lyrics: string, target: string): boolean {
  const needle = normalizeForMatch(target);
  if (!needle) return false;
  const haystack = normalizeForMatch(lyrics);
  const escaped = needle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`(^|[^a-z0-9])${escaped}($|[^a-z0-9])`).test(haystack);
}

export function remainingSeconds(deadlineAt: number | undefined, now: number): number {
  if (!deadlineAt || !Number.isFinite(deadlineAt)) return 0;
  return Math.max(0, Math.ceil((deadlineAt - now) / 1000));
}

export function formatCountdown(seconds: number): string {
  const total = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(total / 60);
  const rest = total % 60;
  return `${String(minutes).padStart(2, '0')}:${String(rest).padStart(2, '0')}`;
}

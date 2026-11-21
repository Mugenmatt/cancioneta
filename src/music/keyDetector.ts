import { KEYS, chordPitchClasses, keyScalePcs, pitchClass, type Chord, type Key } from './theory';

export type Compatibility = 'Alta' | 'Media' | 'Baja';

export interface KeyCandidate {
  key: Key;
  score: number;
  compatibility: Compatibility;
  ambiguous: boolean;
}

export interface KeyDetectionResult {
  candidates: KeyCandidate[];
  top: KeyCandidate | null;
  ambiguous: boolean;
  lowData: boolean;
}

function levelFor(score: number): Compatibility {
  if (score >= 80) return 'Alta';
  if (score >= 60) return 'Media';
  return 'Baja';
}

function degreeOfRoot(rootPc: number, key: Key): number | null {
  const scale = keyScalePcs(key, true);
  const index = scale.indexOf(rootPc);
  if (index < 0) return null;
  const naturalDegrees = key.mode === 'major' ? [0, 2, 4, 5, 7, 9, 11] : [0, 2, 3, 5, 7, 8, 10];
  const tonicPc = pitchClass(key.tonic);
  const relative = ((rootPc - tonicPc) % 12 + 12) % 12;
  const idx = naturalDegrees.indexOf(relative);
  return idx >= 0 ? idx + 1 : null;
}

function isDominantOf(degree: number | null): boolean {
  return degree === 5;
}

export function detectKeys(chords: Chord[]): KeyDetectionResult {
  if (chords.length === 0) {
    return { candidates: [], top: null, ambiguous: false, lowData: true };
  }
  const chordPcs = chords.map((chord) => Array.from(new Set(chordPitchClasses(chord.root, chord.quality))));
  const roots = chords.map((chord) => pitchClass(chord.root));
  const lowData = chords.length === 1;

  const results: KeyCandidate[] = KEYS.map((key) => {
    const scale = keyScalePcs(key, true);
    let raw = 0;
    chordPcs.forEach((pcs, index) => {
      const inScale = pcs.filter((pc) => scale.includes(pc)).length;
      let base = 0;
      if (inScale === pcs.length) base = 2;
      else if (inScale >= pcs.length - 1 && pcs.length >= 4) base = 1;
      else if (inScale >= 2) base = 0.2;
      else base = -1;
      const weight = index === 0 || index === chords.length - 1 ? 1.3 : 1;
      raw += base * weight;
    });

    for (let i = 1; i < chords.length; i += 1) {
      const prev = degreeOfRoot(roots[i - 1], key);
      const curr = degreeOfRoot(roots[i], key);
      if (prev === 5 && curr === 1) raw += key.mode === 'major' ? 2 : 2;
      if (prev === 4 && curr === 1) raw += 1;
      if (prev === 2 && curr === 5) raw += 1;
    }

    const tonicPc = pitchClass(key.tonic);
    if (roots[0] === tonicPc) raw += 1.5;
    if (roots[roots.length - 1] === tonicPc) raw += 2;
    if (roots.includes(tonicPc)) raw += 0.5;
    const lastDegree = degreeOfRoot(roots[roots.length - 1], key);
    if (isDominantOf(lastDegree)) raw += 1;

    const maxPossible = Math.max(1, chords.length * 2 + 5);
    const score = Math.max(0, Math.min(100, Math.round((raw / maxPossible) * 100)));
    return { key, score, compatibility: levelFor(score), ambiguous: false };
  }).sort((a, b) => b.score - a.score);

  const top = results[0] ?? null;
  if (top && top.score >= 60) {
    for (const candidate of results) {
      if (candidate !== top && top.score - candidate.score <= 5) candidate.ambiguous = true;
    }
    if (results.some((c) => c.ambiguous)) top.ambiguous = true;
  }

  return {
    candidates: results.slice(0, 6),
    top,
    ambiguous: Boolean(top?.ambiguous),
    lowData,
  };
}

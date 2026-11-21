import type { Chord, Key, QualityId } from './theory';
import {
  chordName, diatonicChords, formatChord, keyScaleNotes, parallelKey, pitchClass, relativeKey,
  spellByDegree,
} from './theory';

export interface RelationItem {
  title: string;
  detail: string;
  chords: string[];
}

export interface RelationGroup {
  id: string;
  title: string;
  subtitle: string;
  items: RelationItem[];
}

export function relatedKeys(key: Key): Key[] {
  const relative = relativeKey(key);
  const parallel = parallelKey(key);
  const dominant = { tonic: spellByDegree(key.tonic, 7), mode: key.mode };
  const subdominant = { tonic: spellByDegree(key.tonic, 5), mode: key.mode };
  const name = (tonic: Key['tonic'], mode: Key['mode']) => `${formatKeyTonic(tonic)} ${mode === 'major' ? 'mayor' : 'menor'}`;
  return [
    relative,
    parallel,
    { ...dominant, name: name(dominant.tonic, dominant.mode) },
    { ...subdominant, name: name(subdominant.tonic, subdominant.mode) },
  ];
}

function formatKeyTonic(tonic: Key['tonic']): string {
  const accidentals = tonic.accidental === 0 ? '' : tonic.accidental > 0
    ? '♯'.repeat(tonic.accidental)
    : '♭'.repeat(Math.abs(tonic.accidental));
  return `${tonic.letter}${accidentals}`;
}

export function diatonicRelations(key: Key): RelationItem[] {
  return diatonicChords(key).map((info) => ({
    title: `${info.roman} — ${chordName(info.root, info.quality)}`,
    detail: info.seventhQuality === 'maj7' || info.seventhQuality === 'm7' || info.seventhQuality === '7'
      ? `Acorde diatónico. Séptima: ${chordName(info.root, info.seventhQuality)}.`
      : 'Acorde diatónico de la escala.',
    chords: [chordName(info.root, info.quality)],
  }));
}

export function borrowedChords(key: Key): RelationItem[] {
  const parallel = parallelKey(key);
  const original = new Set(diatonicChords(key).map((d) => `${pitchClass(d.root)}:${d.quality}`));
  return diatonicChords(parallel)
    .filter((d) => !original.has(`${pitchClass(d.root)}:${d.quality}`))
    .slice(0, 5)
    .map((d) => ({
      title: `${chordName(d.root, d.quality)} prestado`,
      detail: `Viene de ${parallel.name}. Aporta color sin cambiar de centro tonal.`,
      chords: [chordName(d.root, d.quality)],
    }));
}

export function commonSubstitutions(key: Key): RelationItem[] {
  const d = diatonicChords(key);
  const pick = (degree: number, quality: QualityId = d[degree - 1].quality) => chordName(d[degree - 1].root, quality);
  const items: RelationItem[] = [
    { title: 'I ↔ vi', detail: 'Mismo campo armónico; cambia el color y el punto de reposo.', chords: [pick(1), pick(6)] },
    { title: 'IV ↔ ii', detail: 'Ambos preparan la dominante. La segunda suele pedir un séptimo grado.', chords: [pick(4), pick(2)] },
    { title: 'V ↔ vii°', detail: 'La sensible también empuja hacia la tónica.', chords: [pick(5), pick(7)] },
  ];
  const fifth = d[4];
  const tritoneRoot = spellByDegree(key.tonic, 1, 2);
  items.push({
    title: 'V7 ↔ sustituto de tritono',
    detail: 'Comparte el tritono con la dominante y resuelve un semitono abajo.',
    chords: [chordName(fifth.root, '7'), chordName(tritoneRoot, '7')],
  });
  return items;
}

export function secondaryDominants(key: Key): RelationItem[] {
  const d = diatonicChords(key);
  return [2, 3, 4, 5, 6].map((degree) => {
    const target = d[degree - 1];
    const dominantRoot = spellByDegree(target.root, 7);
    return {
      title: `V/${target.roman}`,
      detail: `Dominante secundaria que resuelve en ${chordName(target.root, target.quality)}.`,
      chords: [chordName(dominantRoot, '7'), chordName(target.root, target.quality)],
    };
  });
}

export function explainProgression(key: Key, chords: Chord[]): string[] {
  const d = diatonicChords(key);
  return chords.map((chord, index) => {
    const match = d.find((entry) => pitchClass(entry.root) === pitchClass(chord.root));
    const label = match ? match.roman : 'acorde prestado';
    const relation = index === 0 ? 'abre' : index === chords.length - 1 ? 'cierra' : 'conecta';
    return `${formatChord(chord)}: ${label}, ${relation}.`;
  });
}

export function escapeRoutes(key: Key): string[] {
  const scale = keyScaleNotes(key).map((n) => formatKeyTonic(n));
  return [
    `Quedarte en ${key.name}: ${scale.join(' – ')}.`,
    `Ir a la relativa: ${relativeKey(key).name}.`,
    `Probar el modo paralelo: ${parallelKey(key).name}.`,
    'Cambiar el último acorde por uno prestado y volver.',
  ];
}

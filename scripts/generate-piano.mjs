import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const SAMPLE_RATE = 44100;
const DURATION = 2.4;
const START_MIDI = 36;
const END_MIDI = 84;
const OUT_DIR = join(process.cwd(), 'assets', 'audio', 'piano');
const NAMES = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B'];

mkdirSync(OUT_DIR, { recursive: true });

function noteName(midi) {
  const name = NAMES[midi % 12];
  const octave = Math.floor(midi / 12) - 1;
  return `${name}${octave}`;
}

function frequency(midi) {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

function render(midi) {
  const f0 = frequency(midi);
  const frames = Math.floor(SAMPLE_RATE * DURATION);
  const data = new Float32Array(frames);
  const brightness = Math.min(1, (midi - 30) / 60);
  let noiseState = (Math.imul(midi + 1, 1103515245) + 12345) >>> 0;
  for (let frame = 0; frame < frames; frame += 1) {
    const t = frame / SAMPLE_RATE;
    let value = 0;
    const partials = 14;
    for (let n = 1; n <= partials; n += 1) {
      const inharmonic = 1 + 0.00018 * n * n * (0.6 + brightness * 0.5);
      const freq = f0 * n * inharmonic;
      if (freq > SAMPLE_RATE / 2 - 400) break;
      const amp = Math.pow(n, -1.7) * (1 + brightness * 0.3 * Math.min(1, n / 5));
      const decay = Math.exp(-t * (0.55 + n * 0.28 + brightness * 0.6));
      const phase = 2 * Math.PI * freq * t;
      const secondString = 2 * Math.PI * freq * (1 + 0.0004 * n * brightness) * t;
      value += amp * decay * (Math.sin(phase) * 0.62 + Math.sin(secondString) * 0.38);
    }
    if (t < 0.014) {
      noiseState = (Math.imul(noiseState, 1664525) + 1013904223) >>> 0;
      const hammerNoise = (noiseState / 4294967296) * 2 - 1;
      value += hammerNoise * Math.exp(-t / 0.0035) * (0.12 + brightness * 0.08);
    }
    const attack = Math.min(1, t / 0.0025);
    const releaseStart = DURATION - 0.35;
    const release = t > releaseStart ? Math.pow(Math.max(0, (DURATION - t) / 0.35), 1.6) : 1;
    const body = Math.exp(-t * (0.5 + brightness * 0.35));
    data[frame] = value * attack * release * body;
  }
  let peak = 0;
  for (const sample of data) peak = Math.max(peak, Math.abs(sample));
  const gain = peak > 0 ? 0.5 / peak : 1;
  const pcm = Buffer.alloc(frames * 2);
  for (let i = 0; i < frames; i += 1) {
    const clamped = Math.max(-1, Math.min(1, data[i] * gain));
    pcm.writeInt16LE(Math.round(clamped * 32767), i * 2);
  }
  const header = Buffer.alloc(44);
  header.write('RIFF', 0);
  header.writeUInt32LE(36 + pcm.length, 4);
  header.write('WAVE', 8);
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(1, 22);
  header.writeUInt32LE(SAMPLE_RATE, 24);
  header.writeUInt32LE(SAMPLE_RATE * 2, 28);
  header.writeUInt16LE(2, 32);
  header.writeUInt16LE(16, 34);
  header.write('data', 36);
  header.writeUInt32LE(pcm.length, 40);
  return Buffer.concat([header, pcm]);
}

const manifest = [];
for (let midi = START_MIDI; midi <= END_MIDI; midi += 1) {
  const note = noteName(midi);
  const file = `piano_${note.replace('♯', 's')}.wav`;
  const wav = render(midi);
  writeFileSync(join(OUT_DIR, file), wav);
  manifest.push({ midi, note, file, frequency: Number(frequency(midi).toFixed(3)) });
  process.stdout.write(`\r${midi - START_MIDI + 1}/${END_MIDI - START_MIDI + 1}`);
}
writeFileSync(join(OUT_DIR, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);
process.stdout.write('\n');

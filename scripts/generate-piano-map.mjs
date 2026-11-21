import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const manifest = JSON.parse(readFileSync(join(process.cwd(), 'assets', 'audio', 'piano', 'manifest.json'), 'utf8'));
const lines = manifest.map((entry) => `  ${entry.midi}: require('../../../assets/audio/piano/${entry.file}'),`);
const names = manifest.map((entry) => `  ${entry.midi}: '${entry.note}',`);
const source = `export const PIANO_SAMPLE_FILES: Record<number, number> = {\n${lines.join('\n')}\n};\n\nexport const PIANO_NOTE_NAMES: Record<number, string> = {\n${names.join('\n')}\n};\n`;
writeFileSync(join(process.cwd(), 'src', 'services', 'audio', 'pianoSamples.ts'), source);

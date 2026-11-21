export const CONEXION_EXAMPLES = [
  { title: 'Buzo de aguas profundas', body: 'Paciente como una marea quieta, resistente como el metal que aguanta la presión.' },
  { title: 'Panadería de madrugada', body: 'Silenciosa como la harina, tibia como una mano que todavía no despertó.' },
  { title: 'Reloj de estación', body: 'Testarudo como una vía, generoso como el andén que recibe a todos.' },
] as const;

export const CONEXION_TEXT = {
  intro: 'Descubrí las cualidades de una palabra fuente y aplicalas a otra cosa para armar un símil. La app no te da el símil hecho.',
  sourceEyebrow: 'Palabra fuente',
  qualitiesLabel: 'Cualidades que encontrás',
  qualitiesPlaceholder: 'Silenciosa, lenta, terca…',
  targetLabel: '¿A qué se las aplicás?',
  targetPlaceholder: 'Una persona, un lugar, un recuerdo…',
  examplesTitle: 'Tres ejemplos originales',
  anotherSource: 'Otra fuente',
  body: (source: string, qualities: string, target: string) => `${source}\nCualidades: ${qualities || '—'}\nAplicadas a: ${target || '—'}`,
} as const;

export type PerspectiveCategory = 'objects' | 'animals' | 'nature' | 'substances' | 'abstract';

export const PERSPECTIVE_CATEGORIES: { id: PerspectiveCategory; label: string; words: readonly string[] }[] = [
  { id: 'objects', label: 'Objetos', words: ['silla', 'espejo', 'ventana', 'reloj', 'maleta', 'lámpara', 'puente', 'tijera', 'botella', 'paraguas', 'cuchara', 'armario', 'bicicleta', 'semáforo', 'teléfono'] },
  { id: 'animals', label: 'Animales', words: ['gato', 'perro', 'caballo', 'ballena', 'mariposa', 'cuervo', 'oso', 'liebre', 'delfín', 'caracol', 'águila', 'topo', 'lobo', 'pulga', 'araña'] },
  { id: 'nature', label: 'Elementos naturales', words: ['lluvia', 'viento', 'mar', 'montaña', 'río', 'nube', 'trueno', 'arena', 'bosque', 'luna', 'sol', 'hielo', 'hoja', 'volcán', 'roca'] },
  { id: 'substances', label: 'Sustancias', words: ['agua', 'sal', 'miel', 'hierro', 'aceite', 'tinta', 'papel', 'barro', 'cristal', 'café', 'leche', 'pólvora', 'resina', 'crema', 'alcohol'] },
  { id: 'abstract', label: 'Conceptos abstractos', words: ['tiempo', 'memoria', 'deseo', 'miedo', 'paciencia', 'suerte', 'silencio', 'justicia', 'duda', 'esperanza', 'odio', 'ternura', 'orgullo', 'pérdida', 'ritmo'] },
];

export const PERSPECTIVE_TEXT = {
  intro: 'Un sustantivo te presta su punto de vista. No expliques qué es: escribí desde su cuerpo, su tiempo y su deseo.',
  anyCategory: 'Sin categoría',
  categoryLabel: (label: string) => `Categoría: ${label}`,
  anotherNoun: 'Otro sustantivo',
  body: (noun: string) => `Escribí desde la perspectiva de: ${noun}`,
} as const;

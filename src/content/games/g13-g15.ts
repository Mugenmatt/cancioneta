export const CARDS_TEXT = {
  g13: {
    intro: 'Dos frases independientes. Cambiá una sin tocar la otra y buscá qué las une.',
    changeCard: 'Cambiar esta frase',
    searching: 'Buscando una frase…',
  },
  g16: {
    intro: 'Elegí hasta cuatro frases de guion. Tocá una para ver su procedencia y después intercalalas en tu letra.',
    count: (count: number) => `${count} ${count === 1 ? 'frase' : 'frases'}`,
    showSource: 'Tocá para ver la fuente',
    replace: 'Reemplazar',
    empty: '—',
  },
  g17: {
    intro: 'Dos obras para buscar y coser: tomá un recurso de cada una y armá una criatura nueva. No copies textos.',
    changeWork: 'Cambiar esta obra',
    searching: 'Buscando una obra…',
  },
  g18: {
    intro: 'Este verso vuelve entre tus propios versos. Dejalo fijo y escribí alrededor.',
    anotherVerse: 'Otro verso',
    searching: 'Buscando un verso…',
  },
} as const;

export const PIENSO_EN_VOS_TEXT = {
  modes: [
    { value: 1, label: 'Una persona + una cosa' },
    { value: 2, label: 'Varias personas + una cosa' },
    { value: 3, label: 'Varias personas + varias cosas' },
  ],
  intro: 'Prestale a una persona las cualidades de una cosa, o a una cosa las de una persona. La app no inventa el retrato: elegí vos.',
  nounEyebrow: 'Sustantivo',
  peopleLabel: 'Personas o expresiones colectivas',
  peoplePlaceholder: 'Mi hermana, la muchedumbre, vos…',
  thingsLabel: 'Cosas',
  thingsPlaceholder: 'Una casa vacía, el invierno…',
  anotherNoun: 'Otro sustantivo',
  body: (noun: string, modeLabel: string, people: string, things: string) => [
    `Sustantivo: ${noun}`,
    `Modalidad: ${modeLabel}`,
    people ? `Personas: ${people}` : '',
    things ? `Cosas: ${things}` : '',
  ].filter(Boolean).join('\n'),
} as const;

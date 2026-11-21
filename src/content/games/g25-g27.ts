export const CARTA_TEXT = {
  intro: 'Escribí una carta completa para quien elijas. Después rescatá solo las frases que puedan entrar en una canción.',
  triggerEyebrow: 'Disparador',
  searching: 'Buscando un disparador…',
  letterLabel: 'La carta',
  letterPlaceholder: 'Querido/a…',
  rescue: 'Rescatar frases',
  anotherTrigger: 'Otro disparador',
  fragmentsTitle: 'Elegí fragmentos para la canción',
} as const;

export const SECRETO_TEXT = {
  intro: 'Escribí dos versiones del mismo tema: una indirecta, con metáforas y misterio; otra directa, sin esconder nada.',
  topicEyebrow: 'Tema',
  searching: 'Buscando un tema…',
  hiddenTitle: 'Lo que oculto',
  hiddenPlaceholder: 'Metáforas, símbolos, misterio…',
  confessionTitle: 'Lo que confieso',
  confessionPlaceholder: 'Directo, sin rodeos…',
  anotherTopic: 'Otro tema',
  body: (topic: string, hidden: string, confession: string) => `Tema: ${topic}\n\nLO QUE OCULTO:\n${hidden}\n\nLO QUE CONFIESO:\n${confession}`,
} as const;

export const UNIVERSO_TEXT = {
  intro: 'Escribí sobre el tema con el vocabulario del universo elegido. Los dos estímulos se cambian por separado.',
  subjectEyebrow: 'Tema',
  universeEyebrow: 'Universo',
  searching: 'Buscando…',
  anotherSubject: 'Otro tema',
  anotherUniverse: 'Otro universo',
  body: (subject: string, universe: string, terms: readonly string[]) => [
    `Tema: ${subject}`,
    `Universo: ${universe}`,
    terms.length ? `Vocabulario de apoyo: ${terms.join(', ')}` : '',
  ].filter(Boolean).join('\n'),
} as const;

export const TRENZA_TEXT = {
  intro: 'Escribí tres frases o pedile una a la app. Después trenzalas, mezclando sus partes como hebras.',
  phraseLabel: (index: number) => `Frase ${index + 1}`,
  phrasePlaceholder: 'Una frase suelta…',
  braid: 'Trenzar',
  changeOne: 'Cambiar frase',
  addOne: 'Agregar frase',
  changeAll: 'Cambiar/agregar todas',
  resultTitle: 'Trenza',
  body: (phrases: readonly string[], result: string) => `Frases:\n${phrases.join('\n')}\n\nTrenza:\n${result}`,
} as const;

export const G38_TIMER_MINUTES = 30;

export const G38_TEXT = {
  intro: 'Robá una escena: una situación breve, un personaje y eso que nadie dice. Escribí solo desde el sentimiento de ese personaje.',
  sceneEyebrow: 'La escena',
  characterEyebrow: 'El personaje',
  unsaidEyebrow: 'Lo que no se dice',
  anotherScene: 'Otra escena',
  loading: 'Buscando escena…',
  timerTitle: 'Temporizador opcional',
  timerOn: 'Activar 30 min',
  timerOff: 'Sin temporizador',
  timerActive: 'Escribiendo con 30 minutos',
  timerReached: 'Se cumplió el tiempo; seguí si querés',
  timerIdle: 'Sin tiempo: escribí a tu ritmo.',
  timeLabel: 'Tiempo restante',
  consigna: (description: string, character: string, unsaid: string) =>
    `Escena: ${description} Personaje: ${character}. Lo que no se dice: ${unsaid.replace(/\.$/, '')}. Escribí desde el sentimiento de ${character}, sin contar lo demás.`,
  editorTitle: (character: string) => `Escena robada: ${character}`,
  editorGroup: 'La escena',
  characterGroup: 'Personaje',
  unsaidGroup: 'Lo que no se dice',
  editorNote: 'Una sola voz: la del personaje. Lo que no se dice puede gobernar el verso, pero no hace falta escribirlo literalmente.',
  send: 'Llevar al cuaderno',
  privacy: 'La escena y la letra viven solo en memoria. El temporizador no guarda nada ni avisa cuando termina.',
} as const;

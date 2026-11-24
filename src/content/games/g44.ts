export const G44_MINUTES = 10;

export const G44_TEXT = {
  intro: 'Diez minutos para escribir una canción mala a propósito. Después la tirás y escribís la buena.',
  promptEyebrow: 'Consigna',
  anotherPrompt: 'Otra consigna',
  timeLabel: 'Tiempo para la mala',
  reached: 'Se acabó el tiempo. Tocá «Tirar» cuando quieras.',
  writeBad: 'Escribir la mala',
  tirar: 'Tirar',
  tirarHint: 'Esto borra todo lo que escribiste en el cuaderno.',
  goodTitle: 'Ahora la buena',
  goodBody: 'El cuaderno está vacío y la consigna sigue arriba. Escribí la canción que sí querés.',
  goodSend: 'Escribir la buena',
  editorTitle: (prompt: string) => `Consigna: ${prompt}`,
  privacy: 'No se guarda nada: ni la canción mala ni la buena. Si cerrás la app, se pierde.',
} as const;

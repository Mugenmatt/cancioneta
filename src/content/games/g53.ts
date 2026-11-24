export const G53_RECORD_SECONDS = 20;

export const G53_QUESTIONS = [
  {
    id: 'far',
    label: 'Lejos',
    text: '¿Qué suena lejos?',
    placeholder: 'El ruido que viene de otro lado…',
  },
  {
    id: 'near',
    label: 'Cerca',
    text: '¿Qué suena cerca?',
    placeholder: 'Lo que está al lado del micrófono…',
  },
  {
    id: 'missing',
    label: 'Falta',
    text: '¿Qué falta?',
    placeholder: 'El sonido que esperabas y no apareció…',
  },
] as const;

export const G53_TEXT = {
  intro: 'Grabá 20 segundos de paisaje sonoro: una cocina, la calle, la lluvia, lo que tengas cerca. Escuchalo y escribí desde lo que oíste.',
  privacy: 'El micrófono se pide recién cuando tocás grabar. El audio queda en una carpeta temporal y se borra al terminar. No se transcribe ni se guarda la letra.',
  webNotice: 'En la web el micrófono no está disponible. Podés escribir a mano los sonidos que imaginarías para este paisaje y seguir con el Juego sin que se rompa nada.',
  permissionDenied: 'Necesitás permitir el micrófono para grabar. El audio se queda en una carpeta temporal del teléfono.',
  recordingError: 'No se pudo iniciar la grabación. Probá otra vez.',
  record: 'Grabar 20 segundos',
  stop: 'Detener grabación',
  listen: 'Escuchar paisaje',
  recordingSeconds: (seconds: number) => `${seconds} s de grabación`,
  noTranscription: 'Acá no hay transcripción: el paisaje se escribe escuchando, no dictando.',
  questionsEyebrow: 'Tres preguntas guía',
  canSkipAudio: 'Si no grabás, podés escribir de todos modos; el cuaderno queda igual.',
  send: 'Llevar al cuaderno',
  finish: 'Terminar y borrar audio',
  editorTitle: 'Paisaje sonoro',
} as const;

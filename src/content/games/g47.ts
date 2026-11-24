export const G47_MODES = ['twisted', 'offbeat', 'speakSing'] as const;
export type G47ModeId = (typeof G47_MODES)[number];

export const G47_RULES = [
  { id: 'invert', title: 'Invertir la dirección', detail: 'Si la melodía sube, hacela bajar; si baja, hacela subir.' },
  { id: 'durations', title: 'Cambiar duraciones', detail: 'Alargá lo que era corto y acortá lo que era largo.' },
  { id: 'leap', title: 'Saltar un intervalo', detail: 'En vez de ir a la nota vecina, saltá una tercera o una quinta.' },
  { id: 'stretch', title: 'Estirar y comprimir', detail: 'Alargá una nota y acortá la siguiente para compensar.' },
] as const;
export type G47RuleId = (typeof G47_RULES)[number]['id'];

export const G47_BPM = 96;

export const G47_TEXT = {
  intro: 'Tres formas de trabajar la melodía con la voz. Grabá, escuchá el pulso o exagerá tu propia manera de hablar.',
  modeTwisted: 'Melodía torcida',
  modeOffbeat: 'Otro tiempo',
  modeSpeakSing: 'Hablar-cantando',
  twisted: {
    step1: 'Tarareá o grabá el estribillo de una canción que ames. El audio es temporal: si cerrás la app, se va.',
    record: 'Grabar tararea',
    stop: 'Parar grabación',
    play: 'Escuchar',
    pause: 'Pausar',
    clear: 'Borrar audio temporal',
    seconds: (count: number) => `${count} s grabados`,
    step2: 'Elegí una o más tarjetas de reglas y aplicálas a lo que grabaste.',
    rulesEyebrow: 'Reglas de transformación',
    note: '¿Cómo quedó la melodía torcida?',
    notePlaceholder: 'Escribí una frase, un verso o una anotación de la melodía…',
    webNotice: 'En web no hay micrófono. Podés seguir con las tarjetas y escribir la transformación a mano.',
    permissionNotice: 'Sin permiso de micrófono. Podés seguir escribiendo la transformación a mano.',
    recordingNotice: 'No se pudo grabar. Podés seguir con las tarjetas y escribir a mano.',
    audioReady: 'Grabación lista en la carpeta temporal.',
    editorNote: 'Reglas aplicadas a una melodía tarareada; el audio no se guarda.',
  },
  offbeat: {
    step1: 'El acento cae en un tiempo sorteado. Mirá el patrón y escuchá el metrónomo.',
    accentEyebrow: 'Acento sorteado',
    accent: (beat: number) => `Tiempo ${beat}`,
    anotherAccent: 'Otro acento',
    advanced: 'Modo avanzado: el "y" entre tiempos',
    patternEyebrow: 'Patrón del compás',
    start: 'Prender metrónomo',
    stop: 'Apagar metrónomo',
    webNotice: 'En web el sonido depende del navegador. Si no lo escuchás, seguí el patrón que se resalta en pantalla.',
    audioError: 'No se pudo prender el metrónomo en este dispositivo. Seguí el patrón visual.',
    phrase: 'Frase que arranca en ese tiempo',
    phrasePlaceholder: 'Escribí una frase que empiece justo en el acento…',
    editorNote: 'Frases para improvisar arrancando en el tiempo acentuado.',
  },
  speakSing: {
    step1: 'Salé una frase corta. Decila en voz alta, sin adornos.',
    step2: 'Decila de nuevo con emoción.',
    step3: 'Decila con MÁS emoción y cantala exagerando la melodía natural de la frase.',
    drawPhrase: 'Otra frase',
    phraseEyebrow: 'Frase del ejercicio',
    notes: 'Anotá lo que descubriste',
    notesPlaceholder: '¿Qué cambió cuando la cantaste? ¿Dónde se te abrió la voz?…',
    editorNote: 'Frase dicha neutra, con emoción y cantada exagerando su melodía natural.',
  },
  send: 'Llevar al cuaderno',
  privacy: 'Las grabaciones viven solo en la carpeta temporal; los textos, solo en memoria. Nada se guarda.',
} as const;

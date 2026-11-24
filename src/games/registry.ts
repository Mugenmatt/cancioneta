export type GamePhase = 'fase0' | 'original' | 'nuevo';
export type GameStatus = 'ready' | 'soon';

export interface GameMeta {
  id: string;
  number: number;
  name: string;
  phase: GamePhase;
  summary: string;
  tags: string[];
  status: GameStatus;
  themeId: string;
}

export const GAME_REGISTRY: GameMeta[] = [
  { id: 'f0-1', number: 0, name: 'Voz desatada', phase: 'fase0', summary: 'Hablá sin censura, transcribí y rescatá frases.', tags: ['voz', 'grabación', 'offline'], status: 'ready', themeId: 'f0-1' },
  { id: 'f0-2', number: 0, name: 'Páginas matutinas', phase: 'fase0', summary: 'Tres páginas de escritura libre, sin corregir.', tags: ['escritura libre', 'timer'], status: 'ready', themeId: 'f0-2' },
  { id: 'f0-3', number: 0, name: 'Prompt', phase: 'fase0', summary: 'Una consigna y una imagen para abrir una escena.', tags: ['prompt', 'imagen'], status: 'ready', themeId: 'f0-3' },
  { id: 'f0-4', number: 0, name: 'El Espía', phase: 'fase0', summary: 'Observá sesenta segundos y escribí lo que viste.', tags: ['observación', 'timer'], status: 'ready', themeId: 'f0-4' },
  { id: 'f0-5', number: 0, name: '¿Por qué?', phase: 'fase0', summary: 'Preguntá por qué y seguí la respuesta hacia abajo.', tags: ['preguntas', 'escritura libre'], status: 'ready', themeId: 'f0-5' },
  { id: 'g01', number: 1, name: 'Asociación Libre', phase: 'original', summary: 'Treinta palabras en tres columnas, sin repeticiones.', tags: ['palabras', 'asociación'], status: 'ready', themeId: 'g01' },
  { id: 'g02', number: 2, name: 'Desde el Título', phase: 'original', summary: 'Un título ajeno como puerta de entrada.', tags: ['título', 'cultura'], status: 'ready', themeId: 'g02' },
  { id: 'g03', number: 3, name: 'Unión de Palabras', phase: 'original', summary: 'Palabras que se revelan de a una.', tags: ['palabras', 'azar'], status: 'ready', themeId: 'g03' },
  { id: 'g04', number: 4, name: 'Contar-Mostrar', phase: 'original', summary: 'Alterná ideas abstractas e imágenes concretas.', tags: ['prompt', 'estructura'], status: 'ready', themeId: 'g04' },
  { id: 'g05', number: 5, name: 'En la Piel', phase: 'original', summary: 'Escribí desde un personaje y su mundo.', tags: ['personaje', 'voz'], status: 'ready', themeId: 'g05' },
  { id: 'g06', number: 6, name: 'Palabra Portal', phase: 'original', summary: 'Cuatro columnas de asociaciones que abren un camino.', tags: ['palabras', 'asociación'], status: 'ready', themeId: 'g06' },
  { id: 'g07', number: 7, name: 'Palabras Invisibles', phase: 'original', summary: 'Cuatro palabras propias, nunca nombradas.', tags: ['palabras', 'metáfora'], status: 'ready', themeId: 'g07' },
  { id: 'g08', number: 8, name: 'Canción Influencia', phase: 'original', summary: 'Otra letra sobre el tema de una canción.', tags: ['canción', 'influencia'], status: 'ready', themeId: 'g08' },
  { id: 'g09', number: 9, name: 'Canción Influencia 2', phase: 'original', summary: 'Transformá rima y métrica hasta que sea tuya.', tags: ['canción', 'métrica'], status: 'ready', themeId: 'g09' },
  { id: 'g10', number: 10, name: 'Canción Influencia 3', phase: 'original', summary: 'Invertí expresiones y quedate con lo raro.', tags: ['canción', 'inversión'], status: 'ready', themeId: 'g10' },
  { id: 'g11', number: 11, name: 'Palabras Clavadas', phase: 'original', summary: 'Cada palabra pide una posición dentro del verso.', tags: ['palabras', 'restricción'], status: 'ready', themeId: 'g11' },
  { id: 'g12', number: 12, name: 'Conexión', phase: 'original', summary: 'Encontrá cualidades y construí un símil.', tags: ['símil', 'imagen'], status: 'ready', themeId: 'g12' },
  { id: 'g13', number: 13, name: 'Cociendo Frases', phase: 'original', summary: 'Dos frases independientes que se encuentran.', tags: ['frases', 'collage'], status: 'ready', themeId: 'g13' },
  { id: 'g14', number: 14, name: 'Otra Perspectiva', phase: 'original', summary: 'Escribí desde un sustantivo inesperado.', tags: ['voz', 'objeto'], status: 'ready', themeId: 'g14' },
  { id: 'g15', number: 15, name: 'Pienso en Vos', phase: 'original', summary: 'Personas con cualidades de cosas, o al revés.', tags: ['retrato', 'metáfora'], status: 'ready', themeId: 'g15' },
  { id: 'g16', number: 16, name: 'El Guion', phase: 'original', summary: 'Frases de guion para intercalar y coser.', tags: ['guion', 'frases'], status: 'ready', themeId: 'g16' },
  { id: 'g17', number: 17, name: 'Frankenstein', phase: 'original', summary: 'Dos obras, dos autores, una criatura nueva.', tags: ['poesía', 'collage'], status: 'ready', themeId: 'g17' },
  { id: 'g18', number: 18, name: 'Verso Insistente', phase: 'original', summary: 'Un verso que vuelve y ordena la canción.', tags: ['repetición', 'verso'], status: 'ready', themeId: 'g18' },
  { id: 'g19', number: 19, name: 'Canción Collage', phase: 'original', summary: 'Tres imágenes para disparar una atmósfera.', tags: ['imagen', 'collage'], status: 'ready', themeId: 'g19' },
  { id: 'g20', number: 20, name: 'Sentidos Guía', phase: 'original', summary: 'Siete puertas sensoriales para un flujo.', tags: ['sentidos', 'preguntas'], status: 'ready', themeId: 'g20' },
  { id: 'g21', number: 21, name: 'La Séptima', phase: 'original', summary: 'Una palabra nueva en la séptima posición.', tags: ['editor', 'restricción'], status: 'ready', themeId: 'g21' },
  { id: 'g22', number: 22, name: 'Restricciones', phase: 'original', summary: 'Reglas elegidas para empujar la escritura.', tags: ['restricción', 'juego'], status: 'ready', themeId: 'g22' },
  { id: 'g23', number: 23, name: 'Mapa Mental', phase: 'original', summary: 'Un árbol de asociaciones que se puede exportar.', tags: ['mapa', 'asociación'], status: 'ready', themeId: 'g23' },
  { id: 'g24', number: 24, name: 'Dados Líricos', phase: 'nuevo', summary: 'Seis dados para armar una escena completa.', tags: ['dados', 'azar'], status: 'ready', themeId: 'g24' },
  { id: 'g25', number: 25, name: 'Carta que nunca envié', phase: 'nuevo', summary: 'Una carta privada para rescatar fragmentos.', tags: ['carta', 'emocional'], status: 'ready', themeId: 'g25' },
  { id: 'g26', number: 26, name: 'Secreto y confesión', phase: 'nuevo', summary: 'Lo que oculto y lo que confieso, cara a cara.', tags: ['contraste', 'confesión'], status: 'ready', themeId: 'g26' },
  { id: 'g27', number: 27, name: 'Traslado de universo', phase: 'nuevo', summary: 'Un tema escrito con el vocabulario de otro mundo.', tags: ['universo', 'vocabulario'], status: 'ready', themeId: 'g27' },
  { id: 'g28', number: 28, name: 'Collage textual', phase: 'nuevo', summary: 'Palabras dispuestas como un cartel.', tags: ['collage', 'visual'], status: 'ready', themeId: 'g28' },
  { id: 'g29', number: 29, name: 'Cut-up', phase: 'nuevo', summary: 'Recortar, mezclar y volver a mirar.', tags: ['cut-up', 'azar'], status: 'ready', themeId: 'g29' },
  { id: 'g30', number: 30, name: 'Trenza de palabras', phase: 'nuevo', summary: 'Tres frases que se entrelazan.', tags: ['frases', 'experimental'], status: 'ready', themeId: 'g30' },
  { id: 'g32', number: 32, name: 'Acróstico de azar', phase: 'nuevo', summary: 'Una letra por verso, una palabra escondida.', tags: ['acróstico', 'verso'], status: 'ready', themeId: 'g32' },
  { id: 'g33', number: 33, name: 'Palabra con plazo', phase: 'nuevo', summary: 'Una palabra, un plazo y la canción antes que venza.', tags: ['palabra', 'temporizador'], status: 'ready', themeId: 'g33' },
  { id: 'g34', number: 34, name: 'Narrador', phase: 'nuevo', summary: 'Persona, distancia y fiabilidad tiradas por separado.', tags: ['narrador', 'azar'], status: 'ready', themeId: 'g34' },
  { id: 'g35', number: 35, name: 'Molde de rima', phase: 'nuevo', summary: 'Ocho esquemas con ejemplos originales de cuatro versos.', tags: ['rima', 'estructura'], status: 'ready', themeId: 'g35' },
  { id: 'g36', number: 36, name: 'Ruleta de forma', phase: 'nuevo', summary: 'Estilo, compás y estructura en ruedas bloqueables.', tags: ['forma', 'azar'], status: 'ready', themeId: 'g36' },
  { id: 'g37', number: 37, name: 'Fábula', phase: 'nuevo', summary: 'Protagonista, conflicto y moraleja de dos versos.', tags: ['fábula', 'moraleja'], status: 'ready', themeId: 'g37' },
  { id: 'g38', number: 38, name: 'Escena robada', phase: 'nuevo', summary: 'Una escena, un personaje y lo que no se dice.', tags: ['escena', 'emoción'], status: 'ready', themeId: 'g38' },
  { id: 'g39', number: 39, name: 'Disección de un verso', phase: 'nuevo', summary: 'Encontrá el recurso de un verso y usalo en otro tema.', tags: ['verso', 'análisis'], status: 'ready', themeId: 'g39' },
  { id: 'g41', number: 41, name: 'Título interrogante', phase: 'nuevo', summary: 'Preguntas que nacen de un título y vuelven respondidas en la canción.', tags: ['preguntas', 'título'], status: 'ready', themeId: 'g41' },
  { id: 'g42', number: 42, name: 'Diez primeros versos', phase: 'nuevo', summary: 'Diez aperturas que dejen una pregunta; elegí tres.', tags: ['aperturas', 'favoritos'], status: 'ready', themeId: 'g42' },
  { id: 'g43', number: 43, name: 'Contar a un extraño', phase: 'nuevo', summary: 'Contar sin adornos y convertirlo en letra sin perder datos.', tags: ['relato', 'transformación'], status: 'ready', themeId: 'g43' },
  { id: 'g44', number: 44, name: 'Canción mala', phase: 'nuevo', summary: 'Diez minutos para escribirla mal a propósito, tirarla y escribir la buena.', tags: ['consigna', 'temporizador'], status: 'ready', themeId: 'g44' },
  { id: 'g45', number: 45, name: 'Dos registros', phase: 'nuevo', summary: 'Dos grabaciones con voces distintas para encontrar la conexión.', tags: ['audio', 'grabación', 'estructura'], status: 'ready', themeId: 'g45' },
  { id: 'g46', number: 46, name: 'Dúo por turnos', phase: 'nuevo', summary: 'Doce versos que se pasan el celular y acaban en verso, pre-estribillo y estribillo.', tags: ['duo', 'versos', 'estructura'], status: 'ready', themeId: 'g46' },
  { id: 'g47', number: 47, name: 'Taller de melodía', phase: 'nuevo', summary: 'Melodía torcida, acento en otro tiempo y hablar-cantando en un solo Juego.', tags: ['melodía', 'audio', 'metrónomo'], status: 'ready', themeId: 'g47' },
  { id: 'g48', number: 48, name: 'Plano a plano', phase: 'nuevo', summary: 'Un plano cinematográfico por verso, en orden o al azar.', tags: ['planos', 'estructura'], status: 'ready', themeId: 'g48' },
  { id: 'g49', number: 49, name: 'Refrán mutante', phase: 'nuevo', summary: 'Tres o cuatro estrofas que cierran con la misma frase.', tags: ['repetición', 'estrofas'], status: 'ready', themeId: 'g49' },
  { id: 'g50', number: 50, name: 'Arco emocional', phase: 'nuevo', summary: 'Tres emociones distintas para verso, pre-estribillo y estribillo.', tags: ['emociones', 'estructura'], status: 'ready', themeId: 'g50' },
  { id: 'g51', number: 51, name: 'Métrica fija', phase: 'nuevo', summary: 'Cuatro versos con moldes silábicos, conteo aproximado y corrección manual.', tags: ['métrica', 'sílabas', 'versos'], status: 'ready', themeId: 'g51' },
  { id: 'g52', number: 52, name: 'Transcripción torcida', phase: 'nuevo', summary: 'Balbuceo grabado, transcripción literal y fragmentos raros.', tags: ['audio', 'transcripción', 'collage'], status: 'ready', themeId: 'g52' },
  { id: 'g53', number: 53, name: 'Paisaje sonoro', phase: 'nuevo', summary: 'Veinte segundos de ambiente para escribir desde lo que se escucha.', tags: ['audio', 'ambiente', 'escucha'], status: 'ready', themeId: 'g53' },
  { id: 'g54', number: 54, name: 'Solo preguntas', phase: 'nuevo', summary: 'Entre ocho y dieciséis versos, todos preguntas.', tags: ['preguntas', 'restricción'], status: 'ready', themeId: 'g54' },
  { id: 'g55', number: 55, name: 'Empezar por el final', phase: 'nuevo', summary: 'Escribí el último verso y después los anteriores hacia atrás.', tags: ['final', 'reverso'], status: 'ready', themeId: 'g55' },
  { id: 'g56', number: 56, name: 'Estribillo traidor', phase: 'nuevo', summary: 'Un estribillo que desmiente la estrofa, lado a lado.', tags: ['contradicción', 'estribillo'], status: 'ready', themeId: 'g56' },
  { id: 'g57', number: 57, name: 'Dos voces', phase: 'nuevo', summary: 'Dos personajes alternan versos, sin narrador.', tags: ['diálogo', 'voces'], status: 'ready', themeId: 'g57' },
];

export interface GameCounts {
  games: number;
  fase0: number;
  total: number;
}

export function gameCounts(): GameCounts {
  const fase0 = GAME_REGISTRY.filter((game) => game.phase === 'fase0').length;
  return {
    games: GAME_REGISTRY.length - fase0,
    fase0,
    total: GAME_REGISTRY.length,
  };
}

export function gameById(id: string): GameMeta | undefined {
  return GAME_REGISTRY.find((game) => game.id === id);
}

export function gameIds(): string[] {
  return GAME_REGISTRY.map((game) => game.id);
}

export function gamesForToday(date = new Date()): GameMeta {
  const start = new Date(date.getFullYear(), 0, 0);
  const day = Math.floor((date.getTime() - start.getTime()) / 86400000);
  return GAME_REGISTRY[day % GAME_REGISTRY.length];
}

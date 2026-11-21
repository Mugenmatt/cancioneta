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
  { id: 'g31', number: 31, name: 'Cadena de letras', phase: 'nuevo', summary: 'Conectá letras y encontrá palabras.', tags: ['letras', 'diccionario'], status: 'ready', themeId: 'g31' },
  { id: 'g32', number: 32, name: 'Acróstico de azar', phase: 'nuevo', summary: 'Una letra por verso, una palabra escondida.', tags: ['acróstico', 'verso'], status: 'ready', themeId: 'g32' },
];

export const PHASE_LABEL: Record<GamePhase, string> = {
  fase0: 'Fase 0 · Calentar',
  original: 'Los originales',
  nuevo: 'Nuevos juegos',
};

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

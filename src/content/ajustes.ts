import { APP_META } from './app';

export const SETTINGS_TEXT = {
  back: 'Inicio',
  eyebrow: 'Ajustes',
  title: 'Cómo se siente',
  appearance: 'Apariencia',
  themes: {
    system: 'Sistema',
    light: 'Claro',
    dark: 'Oscuro',
  },
  reduceMotion: {
    title: 'Reducir movimiento',
    body: 'Menos animaciones y transiciones.',
  },
  includeStructure: {
    title: 'Incluir nombres de secciones',
    body: 'Al exportar, agrega Verso, Estribillo, etc.',
  },
  dataTitle: 'Paquete de datos',
  dataSummary: (total: number, pools: number) => `${total} piezas cargadas en ${pools} pools.`,
  memory: {
    title: 'Memoria de sorteos',
    body: 'Los juegos evitan repetir hasta agotar el material.',
    action: 'Borrar',
  },
  resetAlert: {
    title: 'Borrar memoria de sorteos',
    message: 'Los juegos y pools podrán volver a mostrar material que ya viste. Tu letra no se toca.',
    cancel: 'Cancelar',
    confirm: 'Borrar',
  },
  introduction: {
    title: 'Introducción',
    body: 'Repasar qué se guarda y cómo empezar.',
  },
  credits: {
    title: 'Créditos y licencias',
    body: 'Ver fuentes del material y tipografías.',
  },
  privacy: {
    title: 'Privacidad',
    body: 'Cancioneta no tiene cuentas, nube, analíticas ni anuncios. La letra, las grabaciones y los mapas viven en memoria o en archivos temporales. Solo se guardan ajustes y una huella técnica para no repetir sorteos.',
  },
  footer: `${APP_META.name} 0.1.0 · offline first`,
} as const;

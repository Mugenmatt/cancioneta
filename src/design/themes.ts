import { contrastRatio, ensureContrast, relativeLuminance, softInk, type ColorMode } from './tokens';

export type Motif =
  | 'grain'
  | 'halo'
  | 'grid'
  | 'stripes'
  | 'wave'
  | 'orbit'
  | 'rings'
  | 'beam'
  | 'blur'
  | 'stairs'
  | 'paper'
  | 'window';

export type Entrance = 'rise' | 'flip' | 'fade' | 'drop' | 'slide';

export interface GameTheme {
  id: string;
  name: string;
  bg: string;
  bgAlt: string;
  surface: string;
  ink: string;
  inkSoft: string;
  accent: string;
  accentInk: string;
  accentText: string;
  motif: Motif;
  entrance: Entrance;
  displayFont: 'display' | 'displayRegular' | 'displayItalic' | 'serifSemiBold' | 'sansBold' | 'sansSemiBold';
  label: string;
}

const raw: Record<string, Omit<GameTheme, 'id' | 'name' | 'accentText'>> = {
  'f0-1': {
    bg: '#17120E', bgAlt: '#2A1E15', surface: '#2A211A', ink: '#F6EBDD', inkSoft: '#C9B29B',
    accent: '#E0A458', accentInk: '#21160D', motif: 'wave', entrance: 'rise', displayFont: 'display', label: 'Voz desatada',
  },
  'f0-2': {
    bg: '#F1E7D2', bgAlt: '#E4D4B8', surface: '#FBF4E5', ink: '#2B241C', inkSoft: '#6D5F4D',
    accent: '#9DB8C6', accentInk: '#14262E', motif: 'paper', entrance: 'fade', displayFont: 'serifSemiBold', label: 'Páginas matutinas',
  },
  'f0-3': {
    bg: '#E9E4DC', bgAlt: '#D6CEC2', surface: '#FCFAF6', ink: '#221F1B', inkSoft: '#685F54',
    accent: '#7C5C8E', accentInk: '#FFF6FF', motif: 'window', entrance: 'slide', displayFont: 'displayItalic', label: 'Prompt',
  },
  'f0-4': {
    bg: '#0C0C0D', bgAlt: '#1A1414', surface: '#171313', ink: '#F2EDE4', inkSoft: '#AFA39A',
    accent: '#C23B32', accentInk: '#FFF2EF', motif: 'rings', entrance: 'fade', displayFont: 'sansBold', label: 'El Espía',
  },
  'f0-5': {
    bg: '#F4F2EE', bgAlt: '#E7E3DC', surface: '#FFFFFF', ink: '#26241F', inkSoft: '#6F6A61',
    accent: '#4A4A48', accentInk: '#FFFFFF', motif: 'stairs', entrance: 'rise', displayFont: 'serifSemiBold', label: '¿Por qué?',
  },
  'g01': {
    bg: '#EFE7E1', bgAlt: '#E3D3C6', surface: '#FFFDFA', ink: '#2A2320', inkSoft: '#6E6059',
    accent: '#B96A4B', accentInk: '#1B1108', motif: 'grain', entrance: 'rise', displayFont: 'sansBold', label: 'Asociación Libre',
  },
  'g02': {
    bg: '#1F2A30', bgAlt: '#2E3E46', surface: '#2A373D', ink: '#F4EFE6', inkSoft: '#BEC9CD',
    accent: '#E2C275', accentInk: '#2A210D', motif: 'beam', entrance: 'flip', displayFont: 'display', label: 'Desde el Título',
  },
  'g03': {
    bg: '#0F2A22', bgAlt: '#1B3F33', surface: '#163529', ink: '#F1EBDD', inkSoft: '#ADC5B4',
    accent: '#D8B25C', accentInk: '#2A200A', motif: 'grid', entrance: 'flip', displayFont: 'serifSemiBold', label: 'Unión de Palabras',
  },
  'g04': {
    bg: '#DCD9D2', bgAlt: '#B9B6AE', surface: '#F2F0EA', ink: '#24231F', inkSoft: '#615F58',
    accent: '#3D5A63', accentInk: '#F4FBFC', motif: 'halo', entrance: 'fade', displayFont: 'sansSemiBold', label: 'Contar-Mostrar',
  },
  'g05': {
    bg: '#2A231C', bgAlt: '#3B3026', surface: '#372C22', ink: '#F2E7D5', inkSoft: '#C3B097',
    accent: '#C7A36A', accentInk: '#2A200F', motif: 'paper', entrance: 'slide', displayFont: 'display', label: 'En la Piel',
  },
  'g06': {
    bg: '#0A1F33', bgAlt: '#0E2F4C', surface: '#102A41', ink: '#E8F1F7', inkSoft: '#9DB5C7',
    accent: '#59C3C3', accentInk: '#052527', motif: 'orbit', entrance: 'rise', displayFont: 'sansSemiBold', label: 'Palabra Portal',
  },
  'g07': {
    bg: '#241B2F', bgAlt: '#33253F', surface: '#2C2137', ink: '#F0E8F4', inkSoft: '#B9A6C6',
    accent: '#B79CED', accentInk: '#241436', motif: 'blur', entrance: 'fade', displayFont: 'displayItalic', label: 'Palabras Invisibles',
  },
  'g08': {
    bg: '#2B1712', bgAlt: '#47241B', surface: '#3A1F18', ink: '#F6EADF', inkSoft: '#C9A795',
    accent: '#E05C43', accentInk: '#2A0D08', motif: 'rings', entrance: 'flip', displayFont: 'sansBold', label: 'Canción Influencia',
  },
  'g09': {
    bg: '#1D2026', bgAlt: '#2C3038', surface: '#262A31', ink: '#EFF1F2', inkSoft: '#AFB5BC',
    accent: '#E0A458', accentInk: '#2A1D08', motif: 'orbit', entrance: 'rise', displayFont: 'sansSemiBold', label: 'Canción Influencia 2',
  },
  'g10': {
    bg: '#1B1D22', bgAlt: '#30333B', surface: '#262930', ink: '#EDEEF2', inkSoft: '#A9ADB8',
    accent: '#8FB8DE', accentInk: '#10202E', motif: 'window', entrance: 'flip', displayFont: 'sansSemiBold', label: 'Canción Influencia 3',
  },
  'g11': {
    bg: '#E8DCC8', bgAlt: '#D8C3A5', surface: '#F8F0E2', ink: '#342A20', inkSoft: '#7A6A55',
    accent: '#A63A32', accentInk: '#FFF4F1', motif: 'grid', entrance: 'drop', displayFont: 'serifSemiBold', label: 'Palabras Clavadas',
  },
  'g12': {
    bg: '#0E2E2C', bgAlt: '#164B46', surface: '#143C38', ink: '#EAF4F1', inkSoft: '#A6C4BD',
    accent: '#E3C08A', accentInk: '#2A210F', motif: 'wave', entrance: 'rise', displayFont: 'serifSemiBold', label: 'Conexión',
  },
  'g13': {
    bg: '#2C1A14', bgAlt: '#4A2B1E', surface: '#3A241B', ink: '#F8EBDD', inkSoft: '#D0AE96',
    accent: '#C97B4A', accentInk: '#2B1207', motif: 'grain', entrance: 'slide', displayFont: 'display', label: 'Cociendo Frases',
  },
  'g14': {
    bg: '#22262A', bgAlt: '#333A40', surface: '#2B3137', ink: '#EFF1F3', inkSoft: '#AEB6BD',
    accent: '#E2B24C', accentInk: '#271C06', motif: 'halo', entrance: 'fade', displayFont: 'sansSemiBold', label: 'Otra Perspectiva',
  },
  'g15': {
    bg: '#2A1B22', bgAlt: '#442A35', surface: '#382430', ink: '#F6E9EE', inkSoft: '#C7A6B4',
    accent: '#E7A3B8', accentInk: '#31121E', motif: 'blur', entrance: 'rise', displayFont: 'displayItalic', label: 'Pienso en Vos',
  },
  'g16': {
    bg: '#141414', bgAlt: '#242424', surface: '#1D1D1D', ink: '#F3F1EA', inkSoft: '#A8A59C',
    accent: '#E6E1D5', accentInk: '#161616', motif: 'stripes', entrance: 'drop', displayFont: 'sansBold', label: 'El Guion',
  },
  'g17': {
    bg: '#18201A', bgAlt: '#29332A', surface: '#222B23', ink: '#E9EFE6', inkSoft: '#AAB8A7',
    accent: '#9BC36B', accentInk: '#12200A', motif: 'grain', entrance: 'slide', displayFont: 'serifSemiBold', label: 'Frankenstein',
  },
  'g18': {
    bg: '#121214', bgAlt: '#222227', surface: '#1B1B20', ink: '#F5F2EA', inkSoft: '#ABA8A0',
    accent: '#F2B33D', accentInk: '#251A04', motif: 'beam', entrance: 'fade', displayFont: 'display', label: 'Verso Insistente',
  },
  'g19': {
    bg: '#0B0B0D', bgAlt: '#1A1A1F', surface: '#151519', ink: '#F0EEE9', inkSoft: '#A4A19A',
    accent: '#D8D3C6', accentInk: '#141412', motif: 'blur', entrance: 'fade', displayFont: 'sansSemiBold', label: 'Canción Collage',
  },
  'g20': {
    bg: '#1C1D24', bgAlt: '#2E3040', surface: '#262833', ink: '#F1EEF5', inkSoft: '#B3AEC2',
    accent: '#E6C75A', accentInk: '#24200B', motif: 'orbit', entrance: 'rise', displayFont: 'sansSemiBold', label: 'Sentidos Guía',
  },
  'g21': {
    bg: '#F0F1F3', bgAlt: '#DDE1E7', surface: '#FFFFFF', ink: '#20242A', inkSoft: '#626A75',
    accent: '#2E6FB5', accentInk: '#F2F8FF', motif: 'grid', entrance: 'slide', displayFont: 'sansSemiBold', label: 'La Séptima',
  },
  'g22': {
    bg: '#18302A', bgAlt: '#234439', surface: '#1E3931', ink: '#ECF2EC', inkSoft: '#AFC4B8',
    accent: '#E9E4D0', accentInk: '#1E2C22', motif: 'stripes', entrance: 'drop', displayFont: 'displayRegular', label: 'Restricciones',
  },
  'g23': {
    bg: '#141A12', bgAlt: '#263022', surface: '#1E281B', ink: '#EAF0E3', inkSoft: '#AFBCA6',
    accent: '#C8A96B', accentInk: '#241D0F', motif: 'orbit', entrance: 'fade', displayFont: 'sansSemiBold', label: 'Mapa Mental',
  },
  'g24': {
    bg: '#241C2E', bgAlt: '#3A2C47', surface: '#30253A', ink: '#F3ECF7', inkSoft: '#C2B4CE',
    accent: '#F2A0A0', accentInk: '#2E1010', motif: 'grid', entrance: 'drop', displayFont: 'sansBold', label: 'Dados Líricos',
  },
  'g25': {
    bg: '#E9DFCB', bgAlt: '#D8C7AA', surface: '#FBF5E9', ink: '#2F271D', inkSoft: '#776956',
    accent: '#A5563F', accentInk: '#FFF7F2', motif: 'paper', entrance: 'slide', displayFont: 'displayItalic', label: 'Carta que nunca envié',
  },
  'g26': {
    bg: '#1A1720', bgAlt: '#2C2733', surface: '#23202A', ink: '#F0EBF3', inkSoft: '#B1A9BA',
    accent: '#D9C3A0', accentInk: '#241B0F', motif: 'stripes', entrance: 'fade', displayFont: 'sansSemiBold', label: 'Secreto y confesión',
  },
  'g27': {
    bg: '#101C2C', bgAlt: '#1D3450', surface: '#172A42', ink: '#E9F1FA', inkSoft: '#A5B6CA',
    accent: '#7ED0C0', accentInk: '#062620', motif: 'orbit', entrance: 'rise', displayFont: 'sansSemiBold', label: 'Traslado de universo',
  },
  'g28': {
    bg: '#151515', bgAlt: '#2B2B2B', surface: '#202020', ink: '#F2EEE4', inkSoft: '#ADA89D',
    accent: '#E86A4A', accentInk: '#2A0D06', motif: 'blur', entrance: 'rise', displayFont: 'display', label: 'Collage textual',
  },
  'g29': {
    bg: '#EDE6D8', bgAlt: '#DCD0BC', surface: '#FAF5EA', ink: '#24211B', inkSoft: '#6B655A',
    accent: '#3C3C3A', accentInk: '#F8F4E9', motif: 'stripes', entrance: 'drop', displayFont: 'sansBold', label: 'Cut-up',
  },
  'g30': {
    bg: '#201A2C', bgAlt: '#352A47', surface: '#2A2238', ink: '#F2ECF7', inkSoft: '#B9AEC8',
    accent: '#E4B0D4', accentInk: '#2B1024', motif: 'wave', entrance: 'rise', displayFont: 'displayItalic', label: 'Trenza de palabras',
  },
  'g32': {
    bg: '#26262B', bgAlt: '#3A3A42', surface: '#303037', ink: '#F0EFE9', inkSoft: '#B3B1A9',
    accent: '#C9C4B4', accentInk: '#1F1F1C', motif: 'stairs', entrance: 'drop', displayFont: 'displayRegular', label: 'Acróstico de azar',
  },
};

export const gameThemes: Record<string, GameTheme> = Object.fromEntries(
  Object.entries(raw).map(([id, theme]) => {
    const backgrounds = [theme.bg, theme.bgAlt, theme.surface];
    return [id, {
      id,
      name: theme.label,
      ...theme,
      inkSoft: backgrounds.every((bg) => contrastRatio(theme.inkSoft, bg) >= 4.5)
        ? theme.inkSoft
        : softInk(theme.ink, backgrounds),
      accentText: ensureContrast(theme.accent, backgrounds),
    }];
  }),
);

export function themeFor(id: string, mode: ColorMode): GameTheme {
  const base = gameThemes[id] ?? gameThemes.g01;
  if (mode === 'light' || relativeLuminance(base.bg) > 0.35) return base;
  const backgrounds = [base.bgAlt, base.bg, base.motif === 'paper' ? '#24211D' : base.surface];
  return {
    ...base,
    bg: base.bgAlt,
    bgAlt: base.bg,
    surface: base.motif === 'paper' ? '#24211D' : base.surface,
    ink: '#F4F1EA',
    inkSoft: ensureContrast('#BCB5A9', backgrounds),
    accentText: ensureContrast(base.accent, backgrounds),
  };
}

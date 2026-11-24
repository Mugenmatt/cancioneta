export type ColorMode = 'light' | 'dark';

export interface CoreColors {
  bgBase: string;
  bgRaised: string;
  bgSunken: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  accentCore: string;
  accentSoft: string;
  lineSubtle: string;
  lineStrong: string;
  stateError: string;
  stateSuccess: string;
  stateWarning: string;
  overlay: string;
}

export const coreColors: Record<ColorMode, CoreColors> = {
  light: {
    bgBase: '#F7F3EC',
    bgRaised: '#FFFFFF',
    bgSunken: '#EFE8DB',
    textPrimary: '#1B1A17',
    textSecondary: '#5E5A52',
    textMuted: '#6B665D',
    accentCore: '#B83E0C',
    accentSoft: '#FDE4D3',
    lineSubtle: '#E2DACB',
    lineStrong: '#CFC4B0',
    stateError: '#B42318',
    stateSuccess: '#2C7630',
    stateWarning: '#8B5E02',
    overlay: 'rgba(27,26,23,0.45)',
  },
  dark: {
    bgBase: '#12110F',
    bgRaised: '#1C1A17',
    bgSunken: '#0B0A09',
    textPrimary: '#F2EEE6',
    textSecondary: '#B3AEA3',
    textMuted: '#949087',
    accentCore: '#FB923C',
    accentSoft: '#3A2113',
    lineSubtle: '#2C2924',
    lineStrong: '#454038',
    stateError: '#F97066',
    stateSuccess: '#66BB6A',
    stateWarning: '#F2C94C',
    overlay: 'rgba(5,5,4,0.6)',
  },
};

export type SemanticRole =
  | 'surface.paper'
  | 'surface.raised'
  | 'surface.sunken'
  | 'ink.primary'
  | 'ink.secondary'
  | 'ink.muted'
  | 'accent.brand'
  | 'accent.game'
  | 'accent.onAccent'
  | 'line.hairline'
  | 'line.strong'
  | 'focus.ring'
  | 'state.error'
  | 'state.success'
  | 'state.warning';

export type SemanticRoles = Record<SemanticRole, string>;

function semanticRolesFor(colors: CoreColors, mode: ColorMode): SemanticRoles {
  return {
    'surface.paper': colors.bgBase,
    'surface.raised': colors.bgRaised,
    'surface.sunken': colors.bgSunken,
    'ink.primary': colors.textPrimary,
    'ink.secondary': colors.textSecondary,
    'ink.muted': colors.textMuted,
    'accent.brand': colors.accentCore,
    'accent.game': colors.accentCore,
    'accent.onAccent': mode === 'light' ? colors.bgRaised : colors.bgBase,
    'line.hairline': colors.lineSubtle,
    'line.strong': colors.lineStrong,
    'focus.ring': colors.accentCore,
    'state.error': colors.stateError,
    'state.success': colors.stateSuccess,
    'state.warning': colors.stateWarning,
  };
}

export const semanticRoles: Record<ColorMode, SemanticRoles> = {
  light: semanticRolesFor(coreColors.light, 'light'),
  dark: semanticRolesFor(coreColors.dark, 'dark'),
};

export const contentWidth = {
  reading: 640,
  grid: 1200,
} as const;

export const spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
} as const;

export const radii = {
  field: 8,
  card: 16,
  sheet: 28,
  chip: 999,
} as const;

export const fontSizes = {
  caption: 12,
  small: 14,
  body: 16,
  reading: 18,
  lead: 22,
  title: 28,
  display: 36,
  hero: 48,
} as const;

export const lineHeights = {
  tight: 1.15,
  title: 1.25,
  body: 1.45,
  reading: 1.55,
} as const;

export const letterSpacing = {
  hero: -1.2,
  display: -0.8,
  title: -0.4,
  label: 1.4,
  button: 1.1,
} as const;

export const motion = {
  fast: 120,
  base: 240,
  slow: 480,
  easing: {
    enter: [0.215, 0.61, 0.355, 1],
    exit: [0.55, 0.055, 0.675, 0.19],
    emphasis: [0.645, 0.045, 0.355, 1],
  },
} as const;

export const fonts = {
  display: 'Fraunces_700Bold',
  displayRegular: 'Fraunces_400Regular',
  displayItalic: 'Fraunces_400Regular_Italic',
  serif: 'Literata_400Regular',
  serifSemiBold: 'Literata_600SemiBold',
  serifItalic: 'Literata_400Regular_Italic',
  sans: 'Inter_400Regular',
  sansMedium: 'Inter_500Medium',
  sansSemiBold: 'Inter_600SemiBold',
  sansBold: 'Inter_700Bold',
} as const;

export const hitSlop = { top: 12, bottom: 12, left: 12, right: 12 } as const;

export const minTouch = 44;

export function alpha(hex: string, value: number): string {
  const clean = hex.replace('#', '');
  const full = clean.length === 3 ? clean.split('').map((c) => c + c).join('') : clean;
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${value})`;
}

export function mix(a: string, b: string, amount: number): string {
  const cleanA = a.replace('#', '');
  const cleanB = b.replace('#', '');
  const parse = (hex: string, i: number) => parseInt(hex.slice(i, i + 2), 16);
  const channel = (i: number) =>
    Math.round(parse(cleanA, i) * (1 - amount) + parse(cleanB, i) * amount)
      .toString(16)
      .padStart(2, '0');
  return `#${channel(0)}${channel(2)}${channel(4)}`;
}

function toRgb(hex: string): [number, number, number] {
  const clean = hex.replace('#', '');
  return [
    parseInt(clean.slice(0, 2), 16),
    parseInt(clean.slice(2, 4), 16),
    parseInt(clean.slice(4, 6), 16),
  ];
}

export function relativeLuminance(hex: string): number {
  const [r, g, b] = toRgb(hex).map((value) => {
    const channel = value / 255;
    return channel <= 0.03928 ? channel / 12.92 : Math.pow((channel + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrastRatio(a: string, b: string): number {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

export function ensureContrast(color: string, backgrounds: string[], floor = 4.6): string {
  if (backgrounds.every((bg) => contrastRatio(color, bg) >= floor)) return color;
  const toward = backgrounds.every((bg) => relativeLuminance(bg) > 0.35) ? '#000000' : '#FFFFFF';
  for (let amount = 0.02; amount <= 1.0001; amount += 0.02) {
    const candidate = mix(color, toward, amount);
    if (backgrounds.every((bg) => contrastRatio(candidate, bg) >= floor)) return candidate;
  }
  return toward;
}

export function softInk(ink: string, backgrounds: string[], floor = 4.6): string {
  let result = ink;
  for (let amount = 1; amount >= 0; amount -= 0.01) {
    const candidate = mix(backgrounds[0], ink, amount);
    if (backgrounds.every((bg) => contrastRatio(candidate, bg) >= floor)) result = candidate;
    else if (result !== ink) break;
  }
  return result;
}

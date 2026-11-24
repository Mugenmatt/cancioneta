import { DEV_GALLERY_TEXT } from '../content/devGallery';
import { GAME_REGISTRY, type GamePhase } from '../games/registry';
import { gameThemes, themeFor, type GameTheme } from './themes';
import { contrastRatio, type ColorMode } from './tokens';

export const GALLERY_MODES: readonly ColorMode[] = ['light', 'dark'];

export type GalleryStatus = 'ready' | 'pending';

export interface GalleryEntry {
  id: string;
  number: number;
  name: string;
  phase: GamePhase;
  status: GalleryStatus;
  theme?: GameTheme;
}

type TextRole = 'ink' | 'inkSoft' | 'accentText';

export interface ContrastFinding {
  id: string;
  mode: ColorMode;
  role: TextRole;
  background: string;
  ratio: number;
}

export interface GalleryContrastAudit {
  checked: number;
  findings: ContrastFinding[];
}

function phaseRank(phase: GamePhase): number {
  if (phase === 'fase0') return 0;
  if (phase === 'original') return 1;
  return 2;
}

export function galleryEntries(): GalleryEntry[] {
  const entries: GalleryEntry[] = GAME_REGISTRY.map((game) => ({
    id: game.id,
    number: game.number,
    name: game.name,
    phase: game.phase,
    status: 'ready',
    theme: gameThemes[game.themeId],
  }));

  entries.push({
    id: 'g31',
    number: 31,
    name: DEV_GALLERY_TEXT.pending.name,
    phase: 'nuevo',
    status: 'pending',
  });

  return entries.sort(
    (a, b) => phaseRank(a.phase) - phaseRank(b.phase) || a.number - b.number || a.id.localeCompare(b.id),
  );
}

export function auditGalleryContrast(): GalleryContrastAudit {
  const findings: ContrastFinding[] = [];
  let checked = 0;
  const roles: readonly TextRole[] = ['ink', 'inkSoft', 'accentText'];

  for (const game of GAME_REGISTRY) {
    for (const mode of GALLERY_MODES) {
      const theme = themeFor(game.themeId, mode);
      const backgrounds = [theme.bg, theme.bgAlt, theme.surface];
      for (const role of roles) {
        for (const background of backgrounds) {
          const ratio = contrastRatio(theme[role], background);
          checked += 1;
          if (ratio < 4.5) findings.push({ id: game.id, mode, role, background, ratio });
        }
      }
    }
  }

  return { checked, findings };
}

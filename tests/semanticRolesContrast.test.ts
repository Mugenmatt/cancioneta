import {
  contrastRatio,
  semanticRoles,
  type ColorMode,
  type SemanticRole,
} from '@/design/tokens';

const modes: ColorMode[] = ['light', 'dark'];
const surfaces: SemanticRole[] = ['surface.paper', 'surface.raised', 'surface.sunken'];
const textRoles: SemanticRole[] = [
  'ink.primary',
  'ink.secondary',
  'ink.muted',
  'accent.brand',
  'accent.game',
  'state.error',
  'state.success',
  'state.warning',
];

describe('contraste AA de los roles semánticos', () => {
  it.each(modes)('%s mantiene 4.5:1 para texto sobre las superficies', (mode) => {
    const roles = semanticRoles[mode];
    for (const role of textRoles) {
      for (const surface of surfaces) {
        expect(contrastRatio(roles[role], roles[surface])).toBeGreaterThanOrEqual(4.5);
      }
    }
  });

  it.each(modes)('%s mantiene 4.5:1 para el texto sobre los acentos', (mode) => {
    const roles = semanticRoles[mode];
    expect(contrastRatio(roles['accent.onAccent'], roles['accent.brand'])).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(roles['accent.onAccent'], roles['accent.game'])).toBeGreaterThanOrEqual(4.5);
  });

  it.each(modes)('%s mantiene 3:1 para el anillo de foco', (mode) => {
    const roles = semanticRoles[mode];
    for (const surface of surfaces) {
      expect(contrastRatio(roles['focus.ring'], roles[surface])).toBeGreaterThanOrEqual(3);
    }
  });
});

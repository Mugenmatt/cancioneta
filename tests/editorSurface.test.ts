import { coreColors, mix } from '@/design/tokens';
import { editorBackground } from '@/editor/editorBackground';

describe('editorBackground', () => {
  it('mantiene el gradiente del editor cuando no se está escribiendo', () => {
    expect(editorBackground(coreColors.light, false, false)).toEqual([coreColors.light.bgBase, coreColors.light.bgSunken]);
  });

  it('suaviza el gradiente mientras se escribe', () => {
    expect(editorBackground(coreColors.light, true, false)).toEqual([
      coreColors.light.bgBase,
      mix(coreColors.light.bgBase, coreColors.light.bgSunken, 0.35),
    ]);
  });

  it('deja el fondo plano en modo concentración, incluso escribiendo', () => {
    expect(editorBackground(coreColors.dark, true, true)).toEqual([coreColors.dark.bgBase, coreColors.dark.bgBase]);
  });
});

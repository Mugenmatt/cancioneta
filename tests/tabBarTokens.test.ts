import { Platform, StyleSheet } from 'react-native';
import { TAB_LABELS } from '@/content/app';
import { getTabBarStyle, tabBarLabelStyle, TAB_ANIMATION } from '@/design/tabBar';
import { coreColors, fontSizes, lineHeights, semanticRoles, spacing } from '@/design/tokens';

describe('estilos de la barra de pestañas', () => {
  it('fija la animación en none para evitar deslizamientos', () => {
    expect(TAB_ANIMATION).toBe('none');
  });

  it('usa la escala tipográfica para la etiqueta', () => {
    expect(tabBarLabelStyle.fontSize).toBe(fontSizes.caption);
    expect(Object.values(fontSizes)).toContain(tabBarLabelStyle.fontSize);
    expect(tabBarLabelStyle.lineHeight).toBe(fontSizes.caption * lineHeights.body);
  });

  it('toma colores y espaciado de los tokens', () => {
    const style = getTabBarStyle(coreColors.light, 'light');
    expect(style.backgroundColor).toBe(coreColors.light.bgRaised);
    expect(style.borderTopColor).toBe(coreColors.light.lineSubtle);
    expect(style.borderTopWidth).toBe(StyleSheet.hairlineWidth);
    expect(style.paddingTop).toBe(spacing.xs);
  });

  it('expone el color de foco del tema solo en web', () => {
    const style = getTabBarStyle(coreColors.dark, 'dark');
    if (Platform.OS === 'web') {
      expect(style['--focus-ring']).toBe(semanticRoles.dark['focus.ring']);
    } else {
      expect(style['--focus-ring']).toBeUndefined();
    }
  });

  it('mantiene las etiquetas en el archivo de contenido', () => {
    expect(TAB_LABELS).toEqual({
      home: 'Inicio',
      rhymes: 'Rimas',
      chords: 'Acordes',
      games: 'Juegos',
      write: 'Escribir',
    });
  });
});

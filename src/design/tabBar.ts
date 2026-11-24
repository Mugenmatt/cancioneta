import { Platform, StyleSheet, type ViewStyle } from 'react-native';
import {
  fonts,
  fontSizes,
  lineHeights,
  semanticRoles,
  spacing,
  type ColorMode,
  type CoreColors,
} from './tokens';

export const TAB_ANIMATION = 'none' as const;

type TabBarStyle = ViewStyle & { '--focus-ring'?: string };

export function getTabBarStyle(colors: CoreColors, mode: ColorMode): TabBarStyle {
  const style: TabBarStyle = {
    backgroundColor: colors.bgRaised,
    borderTopColor: colors.lineSubtle,
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: spacing.xs,
  };
  if (Platform.OS === 'web') style['--focus-ring'] = semanticRoles[mode]['focus.ring'];
  return style;
}

export const tabBarLabelStyle = {
  fontFamily: fonts.sansMedium,
  fontSize: fontSizes.caption,
  lineHeight: fontSizes.caption * lineHeights.body,
};

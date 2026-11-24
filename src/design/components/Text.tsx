import type { ReactNode } from 'react';
import { StyleSheet, Text as RNText, type TextProps as RNTextProps } from 'react-native';
import { useCoreTheme } from '../ThemeProvider';
import { fonts, fontSizes, letterSpacing, lineHeights, semanticRoles } from '../tokens';

type Variant =
  | 'hero'
  | 'display'
  | 'title'
  | 'lead'
  | 'reading'
  | 'body'
  | 'small'
  | 'caption'
  | 'label'
  | 'serif'
  | 'serifItalic';

interface AppTextProps extends RNTextProps {
  variant?: Variant;
  color?: string;
  children?: ReactNode;
  display?: boolean;
}

const variantStyles = StyleSheet.create({
  hero: { fontFamily: fonts.display, fontSize: fontSizes.hero, lineHeight: fontSizes.hero * lineHeights.tight, letterSpacing: letterSpacing.hero },
  display: { fontFamily: fonts.display, fontSize: fontSizes.display, lineHeight: fontSizes.display * lineHeights.tight, letterSpacing: letterSpacing.display },
  title: { fontFamily: fonts.display, fontSize: fontSizes.title, lineHeight: fontSizes.title * lineHeights.title, letterSpacing: letterSpacing.title },
  lead: { fontFamily: fonts.serif, fontSize: fontSizes.lead, lineHeight: fontSizes.lead * lineHeights.body },
  reading: { fontFamily: fonts.serif, fontSize: fontSizes.reading, lineHeight: fontSizes.reading * lineHeights.reading },
  body: { fontFamily: fonts.sans, fontSize: fontSizes.body, lineHeight: fontSizes.body * lineHeights.body },
  small: { fontFamily: fonts.sans, fontSize: fontSizes.small, lineHeight: fontSizes.small * lineHeights.body },
  caption: { fontFamily: fonts.sans, fontSize: fontSizes.caption, lineHeight: fontSizes.caption * lineHeights.body },
  label: { fontFamily: fonts.sansSemiBold, fontSize: fontSizes.caption, lineHeight: fontSizes.caption * lineHeights.body, letterSpacing: letterSpacing.label, textTransform: 'uppercase' },
  serif: { fontFamily: fonts.serif, fontSize: fontSizes.reading, lineHeight: fontSizes.reading * lineHeights.reading },
  serifItalic: { fontFamily: fonts.serifItalic, fontSize: fontSizes.lead, lineHeight: fontSizes.lead * lineHeights.body },
});

export function AppText({ variant = 'body', color, style, children, ...rest }: AppTextProps) {
  const { mode } = useCoreTheme();
  const roles = semanticRoles[mode];
  return (
    <RNText
      {...rest}
      style={[variantStyles[variant], { color: color ?? roles['ink.primary'] }, style]}
      allowFontScaling
      maxFontSizeMultiplier={2}
    >
      {children}
    </RNText>
  );
}

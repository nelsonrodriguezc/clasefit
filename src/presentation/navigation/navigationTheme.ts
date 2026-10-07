import type { Theme } from '@react-navigation/native';
import { DarkTheme } from '@react-navigation/native';

import { colors } from '../theme';

/** Dark navigation theme, so no light background flashes between screens. */
export const navigationTheme: Theme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: colors.primary,
    background: colors.background,
    card: colors.tabBar,
    text: colors.text,
    border: colors.border,
    notification: colors.danger,
  },
};

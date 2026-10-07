import { Pressable, StyleSheet, Text, View } from 'react-native';

import { initialsOf } from '../formatters';
import { colors } from '../theme';

interface Props {
  readonly name: string;
  readonly size?: number;
  /** When present the avatar is a button (e.g. to open the profile). */
  readonly onPress?: () => void;
  readonly accessibilityLabel?: string;
}

/** Member initials in a circle (there are no profile photos in the MVP). Decorative unless pressable. */
export function Avatar({ name, size = 40, onPress, accessibilityLabel }: Props) {
  const circle = (
    <View style={[styles.circle, { width: size, height: size, borderRadius: size / 2 }]}>
      <Text style={[styles.initials, { fontSize: size * 0.38 }]}>{initialsOf(name)}</Text>
    </View>
  );
  if (!onPress) {
    return (
      <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
        {circle}
      </View>
    );
  }
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={accessibilityLabel} onPress={onPress} hitSlop={8}>
      {circle}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  circle: {
    backgroundColor: colors.primaryDark,
    borderWidth: 2,
    borderColor: colors.primaryBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: { color: colors.primaryLight, fontWeight: '800' },
});

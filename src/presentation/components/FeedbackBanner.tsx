import { Ionicons } from '@expo/vector-icons';
import { useEffect } from 'react';
import { AccessibilityInfo, Pressable, StyleSheet, Text, View } from 'react-native';

import type { Feedback } from '../feedback';
import { TEXTS } from '../messages';
import { colors, MIN_TOUCH, radius, spacing } from '../theme';

interface Props {
  readonly feedback: Feedback;
  readonly onDismiss: () => void;
}

const STYLE = {
  success: { icon: 'checkmark-circle-outline', color: colors.primary, surface: colors.successSurface, border: colors.primaryBorder },
  error: { icon: 'alert-circle-outline', color: colors.dangerText, surface: colors.dangerSurface, border: colors.danger },
} as const;

/**
 * Result of the last action (mockup "Formas de feedback"): icon, literal message and a close button.
 * Announced to screen readers when it appears; rejections and errors are alerts.
 */
export function FeedbackBanner({ feedback, onDismiss }: Props) {
  useEffect(() => {
    AccessibilityInfo.announceForAccessibility(feedback.message);
  }, [feedback]);

  const tone = STYLE[feedback.kind];
  return (
    <View
      testID={`feedback-${feedback.kind}`}
      accessibilityRole={feedback.kind === 'error' ? 'alert' : undefined}
      accessibilityLiveRegion="polite"
      style={[styles.banner, { backgroundColor: tone.surface, borderColor: tone.border }]}
    >
      <Ionicons name={tone.icon} size={22} color={tone.color} />
      <Text style={styles.message}>{feedback.message}</Text>
      <Pressable accessibilityRole="button" accessibilityLabel={TEXTS.dismiss} onPress={onDismiss} style={styles.close}>
        <Ionicons name="close" size={20} color={tone.color} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginHorizontal: spacing.lg,
    marginVertical: spacing.sm,
    paddingLeft: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  message: { flex: 1, color: colors.text, fontSize: 15, fontWeight: '600', paddingVertical: spacing.md },
  close: { minWidth: MIN_TOUCH, minHeight: MIN_TOUCH, alignItems: 'center', justifyContent: 'center' },
});

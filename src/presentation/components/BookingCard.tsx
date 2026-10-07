import { StyleSheet, Text, View } from 'react-native';

import type { MyBooking } from '@/application/views';

import { dayLabel, timeLabel } from '../formatters';
import { TEXTS } from '../messages';
import { colors, radius, spacing } from '../theme';
import { PrimaryButton } from './PrimaryButton';

interface Props {
  readonly booking: MyBooking;
  readonly disabled: boolean;
  readonly onCancel: (booking: MyBooking) => void;
}

export function BookingCard({ booking, disabled, onCancel }: Props) {
  const when = `${dayLabel(booking.daysFromToday, booking.sessionDate)} · ${timeLabel(booking.startsAt)}`;

  return (
    <View testID={`booking-${booking.id}`} style={styles.card}>
      <Text style={styles.name}>{booking.className}</Text>
      <Text style={styles.detail}>{`${when} · ${booking.durationMin} min`}</Text>
      <Text style={styles.detail}>{`Instructor: ${booking.instructor}`}</Text>
      <PrimaryButton
        label={TEXTS.cancelBooking}
        variant="secondary"
        accessibilityLabel={`${TEXTS.cancelBooking} de ${booking.className}, ${when}`}
        disabled={disabled}
        onPress={() => onCancel(booking)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
  },
  name: { fontSize: 18, fontWeight: '700', color: colors.text },
  detail: { fontSize: 15, color: colors.muted, marginBottom: spacing.xs },
});

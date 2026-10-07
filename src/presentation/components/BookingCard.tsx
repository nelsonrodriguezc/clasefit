import { StyleSheet, Text, View } from 'react-native';

import type { MyBooking } from '@/application/views';

import { disciplineOf } from '../disciplines';
import { dayLabel, timeLabel } from '../formatters';
import { A11Y, TEXTS } from '../messages';
import { colors, spacing } from '../theme';
import { Badge } from './Badge';
import { GlassCard } from './GlassCard';
import { IconTile } from './IconTile';
import { InfoRow } from './InfoRow';
import { PrimaryButton } from './PrimaryButton';

interface Props {
  readonly booking: MyBooking;
  readonly disabled: boolean;
  readonly onCancel: (booking: MyBooking) => void;
}

export function BookingCard({ booking, disabled, onCancel }: Props) {
  const when = `${dayLabel(booking.daysFromToday, booking.sessionDate)} · ${timeLabel(booking.startsAt)}`;

  return (
    <GlassCard testID={`booking-${booking.id}`} style={styles.card}>
      <View style={styles.body}>
        <IconTile icon={disciplineOf(booking.className).icon} />
        <View style={styles.info}>
          <View style={styles.titleRow}>
            <Text style={styles.name}>{booking.className}</Text>
            <Badge tone="success" label={TEXTS.booked} />
          </View>
          <InfoRow icon="calendar-outline">{`${when} · ${booking.durationMin} min`}</InfoRow>
          <InfoRow icon="person-outline">{`Instructor: ${booking.instructor}`}</InfoRow>
        </View>
      </View>
      <PrimaryButton
        label={TEXTS.cancelBooking}
        variant="outlineDanger"
        icon="close-circle-outline"
        accessibilityLabel={A11Y.cancel(booking.className, when)}
        disabled={disabled}
        onPress={() => onCancel(booking)}
      />
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  card: { gap: spacing.md },
  body: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  info: { flex: 1, gap: spacing.xs },
  titleRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: spacing.sm },
  name: { fontSize: 18, fontWeight: '800', color: colors.text, flexShrink: 1 },
});

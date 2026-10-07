import { StyleSheet, Text, View } from 'react-native';

import type { UpcomingClass } from '@/application/views';

import { dayLabel, spotsLabel, timeLabel } from '../formatters';
import { TEXTS } from '../messages';
import { colors, radius, spacing } from '../theme';
import { PrimaryButton } from './PrimaryButton';

interface Props {
  readonly item: UpcomingClass;
  readonly busy: boolean;
  readonly disabled: boolean;
  readonly onBook: (sessionId: string) => void;
}

/** One upcoming class. Rules are not evaluated here: the card only renders the state it receives. */
export function ClassCard({ item, busy, disabled, onBook }: Props) {
  const when = `${dayLabel(item.daysFromToday, item.date)} · ${timeLabel(item.startsAt)}`;
  const availability = item.isFull ? TEXTS.full : spotsLabel(item.availableSpots, item.capacity);

  return (
    <View testID={`class-${item.sessionId}`} style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.name}>{item.name}</Text>
        {item.isBookedByMember && (
          <Text style={styles.badge} accessibilityLabel={`${TEXTS.booked}: ${item.name}`}>
            {TEXTS.booked}
          </Text>
        )}
      </View>
      <Text style={styles.detail}>{`${when} · ${item.durationMin} min`}</Text>
      <Text style={styles.detail}>{`Instructor: ${item.instructor}`}</Text>
      <Text style={[styles.availability, item.isFull && styles.full]}>{availability}</Text>
      {!item.isFull && !item.isBookedByMember && (
        <PrimaryButton
          label={TEXTS.book}
          accessibilityLabel={`${TEXTS.book} ${item.name}, ${when}`}
          busy={busy}
          disabled={disabled}
          onPress={() => onBook(item.sessionId)}
        />
      )}
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
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
  name: { fontSize: 18, fontWeight: '700', color: colors.text, flexShrink: 1 },
  badge: {
    backgroundColor: colors.badgeSurface,
    color: colors.badgeText,
    fontWeight: '700',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
  detail: { fontSize: 15, color: colors.muted },
  availability: { fontSize: 15, fontWeight: '600', color: colors.text, marginBottom: spacing.sm },
  full: { color: colors.danger },
});

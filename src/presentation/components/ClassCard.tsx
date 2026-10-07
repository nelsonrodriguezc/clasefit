import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { UpcomingClass } from '@/application/views';

import { dayLabel, spotsLabel, timeLabel } from '../formatters';
import { TEXTS } from '../messages';
import { colors, radius, spacing } from '../theme';
import { PrimaryButton } from './PrimaryButton';
import { GlassCard } from './GlassCard';

interface Props {
  readonly item: UpcomingClass;
  readonly busy: boolean;
  readonly disabled: boolean;
  readonly onBook: (sessionId: string) => void;
  readonly onOpen: (item: UpcomingClass) => void;
}

/** One upcoming class. Rules are not evaluated here: the card only renders the state it receives. */
export function ClassCard({ item, busy, disabled, onBook, onOpen }: Props) {
  const when = `${dayLabel(item.daysFromToday, item.date)} · ${timeLabel(item.startsAt)}`;
  const availability = item.isFull ? TEXTS.full : spotsLabel(item.availableSpots, item.capacity);

  return (
    <GlassCard padded={false}>
      <View testID={`class-${item.sessionId}`} style={styles.card}>
      <Pressable accessibilityRole="button" accessibilityLabel={`Ver detalle de ${item.name}`} onPress={() => onOpen(item)} style={styles.header}>
        <Text style={styles.name}>{item.name}</Text>
        {item.isBookedByMember && (
          <Text style={styles.badge} accessibilityLabel={`${TEXTS.booked}: ${item.name}`}>
            {TEXTS.booked}
          </Text>
        )}
      </Pressable>
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
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: spacing.lg,
    gap: spacing.xs,
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

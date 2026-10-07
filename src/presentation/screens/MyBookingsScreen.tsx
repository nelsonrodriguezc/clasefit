import { ScrollView, StyleSheet, Text, View } from 'react-native';

import type { MyBooking } from '@/application/views';

import { BookingCard } from '../components/BookingCard';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { FeedbackBanner } from '../components/FeedbackBanner';
import { EmptyState, ErrorState, LoadingState } from '../components/StateViews';
import { dayLabel, timeLabel } from '../formatters';
import { useMyBookings } from '../hooks/useMyBookings';
import { TEXTS } from '../messages';
import { colors, spacing } from '../theme';

const summaryOf = (booking: MyBooking): string =>
  `${booking.className} · ${dayLabel(booking.daysFromToday, booking.sessionDate)} · ${timeLabel(booking.startsAt)}`;

/** HU-03 */
export function MyBookingsScreen() {
  const { state, feedback, dismissFeedback, candidate, busy, requestCancel, confirmCancel, keepBooking, refresh } =
    useMyBookings();

  if (state.status === 'loading') return <LoadingState />;
  if (state.status === 'error') return <ErrorState message={state.message} onRetry={() => void refresh()} />;

  return (
    <View testID="my-bookings" style={styles.screen}>
      {feedback && <FeedbackBanner feedback={feedback} onDismiss={dismissFeedback} />}
      {state.items.length > 0 && <Text style={styles.hint}>{TEXTS.cancelRule}</Text>}
      {/* RN-03 limits bookings to 2 per day in a 3-day window: a plain ScrollView is enough. */}
      <ScrollView contentContainerStyle={styles.list}>
        {state.items.length === 0 && <EmptyState message={TEXTS.noBookings} />}
        {state.items.map((booking) => (
          <BookingCard
            key={booking.id}
            booking={booking}
            disabled={busy}
            onCancel={(selected) => void requestCancel(selected)}
          />
        ))}
      </ScrollView>
      <ConfirmDialog
        visible={candidate !== null}
        title={TEXTS.confirmCancelTitle}
        message={candidate ? summaryOf(candidate) : ''}
        confirmLabel={TEXTS.confirmCancelAccept}
        cancelLabel={TEXTS.confirmCancelDismiss}
        onConfirm={() => void confirmCancel()}
        onCancel={keepBooking}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  hint: { color: colors.muted, paddingHorizontal: spacing.lg, paddingTop: spacing.md },
  list: { padding: spacing.lg, gap: spacing.md },
});

import { ScrollView, StyleSheet, Text, View } from 'react-native';

import type { MyBooking } from '@/application/views';

import { BookingCard } from '../components/BookingCard';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { FeedbackBanner } from '../components/FeedbackBanner';
import { Notice } from '../components/Notice';
import { EmptyState, ErrorState, LoadingState } from '../components/StateViews';
import { TopBar } from '../components/TopBar';
import { dayLabel, timeLabel } from '../formatters';
import { useMyBookings } from '../hooks/useMyBookings';
import { TEXTS } from '../messages';
import { colors, spacing } from '../theme';

const summaryOf = (booking: MyBooking): string =>
  `${booking.className} · ${dayLabel(booking.daysFromToday, booking.sessionDate)} · ${timeLabel(booking.startsAt)}`;

/** HU-03 */
export function MyBookingsScreen() {
  const { state, feedback, dismissFeedback, refresh, cancellation } = useMyBookings();

  if (state.status === 'loading') return <LoadingState />;
  if (state.status === 'error') return <ErrorState message={state.message} onRetry={() => void refresh()} />;

  return (
    <View testID="my-bookings" style={styles.screen}>
      <TopBar />
      <Text accessibilityRole="header" style={styles.title}>
        {TEXTS.myBookingsTitle}
      </Text>
      {feedback && <FeedbackBanner feedback={feedback} onDismiss={dismissFeedback} />}
      {state.items.length === 0 ? (
        <EmptyState message={TEXTS.noBookings} icon="bookmark-outline" />
      ) : (
        // RN-03 limits bookings to 2 per day in a 3-day window: a plain ScrollView is enough.
        <ScrollView contentContainerStyle={styles.list}>
          <Notice text={TEXTS.cancelRule} />
          {state.items.map((booking) => (
            <BookingCard
              key={booking.id}
              booking={booking}
              disabled={cancellation.busy}
              onCancel={(selected) => void cancellation.requestCancel({ bookingId: selected.id, summary: summaryOf(selected) })}
            />
          ))}
        </ScrollView>
      )}
      <ConfirmDialog
        visible={cancellation.candidate !== null}
        title={TEXTS.confirmCancelTitle}
        message={cancellation.candidate?.summary ?? ''}
        confirmLabel={TEXTS.confirmCancelAccept}
        cancelLabel={TEXTS.confirmCancelDismiss}
        onConfirm={() => void cancellation.confirmCancel()}
        onCancel={cancellation.keepBooking}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  title: { color: colors.text, fontSize: 30, fontWeight: '800', paddingHorizontal: spacing.lg, paddingBottom: spacing.sm },
  list: { padding: spacing.lg, paddingTop: spacing.sm, gap: spacing.md },
});

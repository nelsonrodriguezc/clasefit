import { useCallback, useState } from 'react';

import type { MyBooking } from '@/application/views';

import { useDependencies } from '../dependencies/DependenciesContext';
import type { Feedback } from '../feedback';
import { failure, success } from '../feedback';
import { ERROR_MESSAGES, TEXTS } from '../messages';
import type { ScreenState } from './ScreenState';
import { useRefreshOnFocus } from './useRefreshOnFocus';

/**
 * View-model of "Mis reservas". Cancelling is a two-step flow: a pre-check (RN-04) decides whether
 * to ask for confirmation, and the confirmed cancellation is validated again by the use case.
 */
export function useMyBookings() {
  const { listMyBookings, cancelBooking } = useDependencies();
  const [state, setState] = useState<ScreenState<MyBooking>>({ status: 'loading' });
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [candidate, setCandidate] = useState<MyBooking | null>(null);
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    const result = await listMyBookings.execute();
    setState(result.ok ? { status: 'ready', items: result.value } : { status: 'error', message: ERROR_MESSAGES[result.error] });
  }, [listMyBookings]);

  const dismissFeedback = useCallback(() => setFeedback(null), []);

  // A message about a previous action may be outdated once the member comes back to the tab.
  useRefreshOnFocus(refresh, dismissFeedback);

  const requestCancel = useCallback(
    async (booking: MyBooking) => {
      setBusy(true);
      try {
        const verdict = await cancelBooking.check(booking.id);
        if (verdict.ok) {
          setCandidate(booking);
        } else {
          setFeedback(failure(ERROR_MESSAGES[verdict.error]));
          await refresh();
        }
      } finally {
        setBusy(false);
      }
    },
    [cancelBooking, refresh],
  );

  const confirmCancel = useCallback(async () => {
    if (!candidate) return;
    const booking = candidate;
    setCandidate(null);
    setBusy(true);
    try {
      const result = await cancelBooking.execute(booking.id);
      setFeedback(result.ok ? success(TEXTS.bookingCancelled) : failure(ERROR_MESSAGES[result.error]));
      await refresh();
    } finally {
      setBusy(false);
    }
  }, [candidate, cancelBooking, refresh]);

  const keepBooking = useCallback(() => setCandidate(null), []);

  return { state, feedback, dismissFeedback, candidate, busy, requestCancel, confirmCancel, keepBooking, refresh };
}

import { useCallback, useState } from 'react';

import type { MyBooking } from '@/application/views';

import { useDependencies } from '../dependencies/DependenciesContext';
import type { Feedback } from '../feedback';
import { ERROR_MESSAGES } from '../messages';
import type { ScreenState } from './ScreenState';
import { useCancellation } from './useCancellation';
import { useRefreshOnFocus } from './useRefreshOnFocus';

/** View-model of "Mis reservas": the member's bookings and the shared cancellation flow. */
export function useMyBookings() {
  const { listMyBookings } = useDependencies();
  const [state, setState] = useState<ScreenState<MyBooking>>({ status: 'loading' });
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  const refresh = useCallback(async () => {
    const result = await listMyBookings.execute();
    setState(result.ok ? { status: 'ready', items: result.value } : { status: 'error', message: ERROR_MESSAGES[result.error] });
  }, [listMyBookings]);

  const dismissFeedback = useCallback(() => setFeedback(null), []);

  // A message about a previous action may be outdated once the member comes back to the tab.
  useRefreshOnFocus(refresh, dismissFeedback);

  const cancellation = useCancellation(refresh, setFeedback);

  return { state, feedback, dismissFeedback, refresh, cancellation };
}

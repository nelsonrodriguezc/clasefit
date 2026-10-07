import { useCallback, useRef, useState } from 'react';

import type { UpcomingClass } from '@/application/views';

import { useDependencies } from '../dependencies/DependenciesContext';
import type { Feedback } from '../feedback';
import { failure, success } from '../feedback';
import { ERROR_MESSAGES, TEXTS } from '../messages';
import type { ScreenState } from './ScreenState';
import { useRefreshOnFocus } from './useRefreshOnFocus';

/** View-model of "Próximas clases": state for the screen, actions delegated to use cases. */
export function useUpcomingClasses() {
  const { listUpcomingClasses, bookClass } = useDependencies();
  const [state, setState] = useState<ScreenState<UpcomingClass>>({ status: 'loading' });
  const [pendingSessionId, setPendingSessionId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const inFlight = useRef(false);

  const refresh = useCallback(async () => {
    const result = await listUpcomingClasses.execute();
    setState(result.ok ? { status: 'ready', items: result.value } : { status: 'error', message: ERROR_MESSAGES[result.error] });
  }, [listUpcomingClasses]);

  const dismissFeedback = useCallback(() => setFeedback(null), []);

  // A message about a previous action may be outdated once the member comes back to the tab.
  useRefreshOnFocus(refresh, dismissFeedback);

  const book = useCallback(
    async (sessionId: string) => {
      if (inFlight.current) return; // ignore taps while a booking is being processed
      inFlight.current = true;
      setPendingSessionId(sessionId);
      try {
        const result = await bookClass.execute(sessionId);
        setFeedback(result.ok ? success(TEXTS.bookingConfirmed) : failure(ERROR_MESSAGES[result.error]));
        await refresh();
      } finally {
        inFlight.current = false;
        setPendingSessionId(null);
      }
    },
    [bookClass, refresh],
  );

  return { state, pendingSessionId, feedback, dismissFeedback, book, refresh };
}

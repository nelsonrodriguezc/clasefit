import { useCallback, useState } from 'react';

import { useDependencies } from '../dependencies/DependenciesContext';
import type { Feedback } from '../feedback';
import { failure, success } from '../feedback';
import { ERROR_MESSAGES, TEXTS } from '../messages';

/** The booking to cancel and the text that identifies it in the confirmation dialog. */
export interface CancellationTarget {
  readonly bookingId: string;
  readonly summary: string;
}

/**
 * Cancelling is a two-step flow shared by "Mis reservas" and the class detail: a pre-check (RN-04)
 * decides whether to ask for confirmation, and the confirmed cancellation is validated again.
 */
export function useCancellation(refresh: () => Promise<void>, report: (feedback: Feedback) => void) {
  const { cancelBooking } = useDependencies();
  const [candidate, setCandidate] = useState<CancellationTarget | null>(null);
  const [busy, setBusy] = useState(false);

  const requestCancel = useCallback(
    async (target: CancellationTarget) => {
      setBusy(true);
      try {
        const verdict = await cancelBooking.check(target.bookingId);
        if (verdict.ok) {
          setCandidate(target);
        } else {
          report(failure(ERROR_MESSAGES[verdict.error]));
          await refresh();
        }
      } finally {
        setBusy(false);
      }
    },
    [cancelBooking, refresh, report],
  );

  const confirmCancel = useCallback(async () => {
    if (!candidate) return;
    const target = candidate;
    setCandidate(null);
    setBusy(true);
    try {
      const result = await cancelBooking.execute(target.bookingId);
      report(result.ok ? success(TEXTS.bookingCancelled) : failure(ERROR_MESSAGES[result.error]));
      await refresh();
    } finally {
      setBusy(false);
    }
  }, [candidate, cancelBooking, refresh, report]);

  const keepBooking = useCallback(() => setCandidate(null), []);

  return { candidate, busy, requestCancel, confirmCancel, keepBooking };
}

export type Cancellation = ReturnType<typeof useCancellation>;

import type { Booking } from '../model/Booking';
import type { Rule } from './Rule';

export type CancellationViolation = 'CANCELLATION_WINDOW_CLOSED';

export interface CancellationAttempt {
  readonly booking: Booking;
  /** Epoch milliseconds. */
  readonly now: number;
}

export type CancellationRule = Rule<CancellationAttempt, CancellationViolation>;

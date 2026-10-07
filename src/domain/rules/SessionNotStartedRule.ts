import type { Result } from '../shared/Result';
import { err } from '../shared/Result';
import { hasStarted } from '../time/businessTime';
import type { BookingAttempt, BookingRule, BookingViolation } from './BookingRule';
import { PASSES } from './Rule';

/** HU-01: a class that already started is no longer offered and cannot be booked. */
export class SessionNotStartedRule implements BookingRule {
  check({ session, now }: BookingAttempt): Result<void, BookingViolation> {
    return hasStarted(session.startsAt, now) ? err('SESSION_ALREADY_STARTED') : PASSES;
  }
}

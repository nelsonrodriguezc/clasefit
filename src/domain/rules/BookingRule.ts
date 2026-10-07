import type { Booking } from '../model/Booking';
import type { ClassSession } from '../model/ClassSession';
import type { Rule } from './Rule';

export type BookingViolation = 'SESSION_ALREADY_STARTED' | 'ALREADY_BOOKED' | 'CLASS_FULL' | 'DAILY_LIMIT_REACHED';

/** Everything a booking rule may look at. */
export interface BookingAttempt {
  readonly session: ClassSession;
  /** All current bookings of the member, including the ones whose class already started today. */
  readonly memberBookings: readonly Booking[];
  /** Epoch milliseconds. */
  readonly now: number;
}

export type BookingRule = Rule<BookingAttempt, BookingViolation>;

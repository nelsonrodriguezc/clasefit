import type { Booking } from '../model/Booking';
import type { ClassSession } from '../model/ClassSession';

/** The member's booking for this exact session (class + date), if any. */
export const bookingOf = (session: ClassSession, memberBookings: readonly Booking[]): Booking | undefined =>
  memberBookings.find((booking) => booking.sessionId === session.id);

/** True when the member already holds a booking for this exact session (class + date). */
export const isBookedBy = (session: ClassSession, memberBookings: readonly Booking[]): boolean =>
  bookingOf(session, memberBookings) !== undefined;

/** Spots left: capacity minus spots taken by others minus the member's own booking. Never negative. */
export const availableSpots = (session: ClassSession, memberBookings: readonly Booking[]): number =>
  Math.max(0, session.capacity - session.takenByOthers - (isBookedBy(session, memberBookings) ? 1 : 0));

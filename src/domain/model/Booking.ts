import type { BusinessDate } from '../time/businessTime';
import type { ClassSession, SessionId } from './ClassSession';

/**
 * A member's booking of a class session. It keeps a snapshot of the session because catalog
 * classes are relative to "today" (diaOffset): tomorrow the same catalog entry is another date.
 * Data minimization: only the member id is stored, never the member's name.
 */
export interface Booking {
  readonly id: string;
  readonly memberId: string;
  readonly sessionId: SessionId;
  readonly classId: string;
  readonly sessionDate: BusinessDate;
  /** Epoch milliseconds. */
  readonly startsAt: number;
  readonly durationMin: number;
  readonly className: string;
  readonly instructor: string;
  /** Epoch milliseconds. */
  readonly bookedAt: number;
}

export interface NewBooking {
  readonly id: string;
  readonly memberId: string;
  readonly session: ClassSession;
  readonly bookedAt: number;
}

export const createBooking = ({ id, memberId, session, bookedAt }: NewBooking): Booking => ({
  id,
  memberId,
  sessionId: session.id,
  classId: session.classId,
  sessionDate: session.date,
  startsAt: session.startsAt,
  durationMin: session.durationMin,
  className: session.name,
  instructor: session.instructor,
  bookedAt,
});

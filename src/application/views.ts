import type { Booking } from '@/domain/model/Booking';
import type { BusinessDate } from '@/domain/time/businessTime';

/** A session shown in "Próximas clases". */
export interface UpcomingClass {
  readonly sessionId: string;
  readonly classId: string;
  readonly name: string;
  readonly instructor: string;
  readonly date: BusinessDate;
  /** 0 = today, 1 = tomorrow, 2 = the day after tomorrow (Bogota). */
  readonly daysFromToday: number;
  /** Epoch milliseconds. */
  readonly startsAt: number;
  readonly durationMin: number;
  readonly capacity: number;
  readonly availableSpots: number;
  readonly isFull: boolean;
  readonly isBookedByMember: boolean;
}

/** A booking shown in "Mis reservas". */
export interface MyBooking extends Booking {
  readonly daysFromToday: number;
}

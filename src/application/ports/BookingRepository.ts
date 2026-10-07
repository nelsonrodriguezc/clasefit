import type { Booking } from '@/domain/model/Booking';

/**
 * Persistence of bookings. Implementations must be write-through: when add/remove resolve the
 * change is durable, and when they reject nothing changed.
 */
export interface BookingRepository {
  findByMember(memberId: string): Promise<readonly Booking[]>;
  add(booking: Booking): Promise<void>;
  remove(bookingIds: readonly string[]): Promise<void>;
}

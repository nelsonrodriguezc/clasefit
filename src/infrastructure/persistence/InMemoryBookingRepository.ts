import type { BookingRepository } from '@/application/ports/BookingRepository';
import type { Booking } from '@/domain/model/Booking';

/** Session-only repository (nothing is written to the device). Satisfies the same contract. */
export class InMemoryBookingRepository implements BookingRepository {
  private bookings: readonly Booking[] = [];

  async findByMember(memberId: string): Promise<readonly Booking[]> {
    return this.bookings.filter((booking) => booking.memberId === memberId);
  }

  async add(booking: Booking): Promise<void> {
    this.bookings = [...this.bookings, booking];
  }

  async remove(bookingIds: readonly string[]): Promise<void> {
    this.bookings = this.bookings.filter((booking) => !bookingIds.includes(booking.id));
  }
}

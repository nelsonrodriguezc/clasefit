import type { BookingRepository } from '@/application/ports/BookingRepository';
import type { Logger } from '@/application/ports/Logger';
import type { Booking } from '@/domain/model/Booking';

import { IntegrityError } from '../security/IntegrityError';
import { parseStoredBookings } from './bookingSchema';
import type { KeyValueStore } from './KeyValueStore';

export const BOOKINGS_STORAGE_KEY = 'clasefit.bookings.v1';

/**
 * Bookings persisted as one validated JSON document in a KeyValueStore (the encrypted one in the
 * app). Write-through: the in-memory copy only changes after the store accepted the write.
 * Fail-closed: altered, undecryptable or malformed content is discarded and erased.
 */
export class PersistentBookingRepository implements BookingRepository {
  private cache?: readonly Booking[];
  private loading?: Promise<readonly Booking[]>;

  constructor(
    private readonly store: KeyValueStore,
    private readonly logger: Logger,
  ) {}

  async findByMember(memberId: string): Promise<readonly Booking[]> {
    return (await this.load()).filter((booking) => booking.memberId === memberId);
  }

  async add(booking: Booking): Promise<void> {
    await this.commit([...(await this.load()), booking]);
  }

  async remove(bookingIds: readonly string[]): Promise<void> {
    await this.commit((await this.load()).filter((booking) => !bookingIds.includes(booking.id)));
  }

  private async commit(next: readonly Booking[]): Promise<void> {
    await this.store.setItem(BOOKINGS_STORAGE_KEY, JSON.stringify(next));
    this.cache = next;
  }

  private load(): Promise<readonly Booking[]> {
    if (this.cache) return Promise.resolve(this.cache);
    if (!this.loading) {
      this.loading = this.read().finally(() => {
        this.loading = undefined;
      });
    }
    return this.loading;
  }

  private async read(): Promise<readonly Booking[]> {
    let raw: string | null;
    try {
      raw = await this.store.getItem(BOOKINGS_STORAGE_KEY);
    } catch (error) {
      if (error instanceof IntegrityError) return this.discard(error.reason);
      throw error; // e.g. secure store unavailable: may be transient, so the data is kept
    }
    if (raw === null) return (this.cache = []);
    const bookings = parseStoredBookings(raw);
    if (!bookings) return this.discard('invalid_content');
    return (this.cache = bookings);
  }

  private async discard(reason: IntegrityError['reason']): Promise<readonly Booking[]> {
    this.logger.warn('storage.integrity_failure', { reason });
    await this.store.removeItem(BOOKINGS_STORAGE_KEY);
    return (this.cache = []);
  }
}

import type { BookingViolation } from '@/domain/rules/BookingRule';
import type { CancellationViolation } from '@/domain/rules/CancellationRule';

/** Expected failures of each use case. Business violations come from the domain rules. */
export type ListUpcomingClassesError = 'CATALOG_UNAVAILABLE' | 'UNEXPECTED';
export type BookClassError = BookingViolation | 'SESSION_NOT_FOUND' | 'UNEXPECTED';
export type ListMyBookingsError = 'UNEXPECTED';
export type CancelBookingError = CancellationViolation | 'BOOKING_NOT_FOUND' | 'UNEXPECTED';

/** Every code the UI may have to explain to the member. */
export type AppErrorCode = ListUpcomingClassesError | BookClassError | ListMyBookingsError | CancelBookingError;

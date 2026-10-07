import type { AppErrorCode } from '@/application/errors';

/**
 * Every text shown to the member, in one place. Messages of RN-01..RN-04 and HU-01..HU-03 are
 * quoted literally from the functional input; the rest are assumption S9 (proposal.md).
 * Record<AppErrorCode, string> makes the compiler demand a message for every new error code.
 */
export const ERROR_MESSAGES: Readonly<Record<AppErrorCode, string>> = {
  CLASS_FULL: 'Esta clase ya no tiene cupos.',
  ALREADY_BOOKED: 'Ya reservaste esta clase.',
  DAILY_LIMIT_REACHED: 'Solo puedes reservar 2 clases por día.',
  CANCELLATION_WINDOW_CLOSED: 'Ya no puedes cancelar: faltan menos de 2 horas.',
  SESSION_ALREADY_STARTED: 'Esta clase ya no está disponible.',
  SESSION_NOT_FOUND: 'Esta clase ya no está disponible.',
  BOOKING_NOT_FOUND: 'No pudimos completar la acción. Intenta de nuevo.',
  CATALOG_UNAVAILABLE: 'No pudimos cargar las clases.',
  UNEXPECTED: 'No pudimos completar la acción. Intenta de nuevo.',
};

export const TEXTS = {
  upcomingTitle: 'Próximas clases',
  myBookingsTitle: 'Mis reservas',
  bookingConfirmed: '¡Listo! Tu cupo está reservado',
  bookingCancelled: 'Reserva cancelada. Liberamos tu cupo.',
  noBookings: 'Aún no tienes reservas',
  noUpcomingClasses: 'No hay más clases en los próximos tres días.',
  full: 'Llena',
  book: 'Reservar',
  booked: 'Reservada',
  cancelBooking: 'Cancelar reserva',
  confirmCancelTitle: '¿Cancelar esta reserva?',
  confirmCancelAccept: 'Sí, cancelar',
  confirmCancelDismiss: 'No, mantener',
  cancelRule: 'Puedes cancelar hasta 2 horas antes del inicio.',
  loading: 'Cargando…',
  retry: 'Reintentar',
  dismiss: 'Cerrar',
} as const;

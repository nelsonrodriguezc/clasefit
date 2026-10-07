import type { AppErrorCode } from '@/application/errors';

/**
 * Every text shown to the member, in one place. Messages of RN-01..RN-04 and HU-01..HU-03 are
 * quoted literally from the functional input; the rest are assumption S9 (add-class-booking) or
 * UI-3 (refresh-mobile-ux-ui).
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
  profileTitle: 'Perfil',
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
  back: 'Volver',
  tagline: 'Tu energía, nuestras clases',
  greeting: 'Hola',
  memberActive: 'Miembro activo',
  openProfile: 'Ver perfil',
  description: 'Descripción',
  securityNote: 'Tus reservas se guardan cifradas en este dispositivo.',
  motivationTitle: 'Tu esfuerzo también es un logro',
  motivationText: 'Sigue reservando tus próximas clases.',
} as const;

/** Screen reader labels: the visible word plus the class and its time, to tell similar cards apart. */
export const A11Y = {
  openDetail: (className: string, when: string) => `Ver detalle de ${className}, ${when}`,
  book: (className: string, when: string) => `${TEXTS.book} ${className}, ${when}`,
  cancel: (className: string, when: string) => `${TEXTS.cancelBooking} de ${className}, ${when}`,
} as const;

/** "Sin reservas activas", "1 reserva activa", "2 reservas activas". */
export const activeBookingsLabel = (count: number): string =>
  count === 0 ? 'Sin reservas activas' : count === 1 ? '1 reserva activa' : `${count} reservas activas`;

export interface DisciplineCopy {
  readonly description: string;
  readonly tags: readonly string[];
}

/** Demo copy per discipline (assumption UI-3). The Spinning description quotes the mockup. */
export const DISCIPLINE_COPY: Readonly<Record<string, DisciplineCopy>> = {
  Spinning: {
    description: 'Clase de alta intensidad enfocada en mejorar la resistencia cardiovascular, fuerza y quema de calorías.',
    tags: ['Cardio', 'Fuerza', 'Resistencia'],
  },
  Funcional: {
    description: 'Circuitos con el peso del cuerpo y elementos livianos para ganar fuerza, estabilidad y movilidad.',
    tags: ['Fuerza', 'Movilidad', 'Core'],
  },
  Yoga: {
    description: 'Posturas, respiración y estiramientos para ganar flexibilidad, equilibrio y calma.',
    tags: ['Flexibilidad', 'Equilibrio', 'Respiración'],
  },
  Rumba: {
    description: 'Baile aeróbico con ritmos latinos para moverte, divertirte y quemar energía.',
    tags: ['Cardio', 'Coordinación', 'Ritmo'],
  },
};

/** Used for a class name that has no specific copy. */
export const DEFAULT_DISCIPLINE_COPY: DisciplineCopy = { description: 'Clase grupal del gimnasio.', tags: [] };

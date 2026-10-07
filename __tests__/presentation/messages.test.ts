import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { ERROR_MESSAGES, TEXTS } from '@/presentation/messages';

const insumo = readFileSync(join(__dirname, '..', '..', 'docs', 'insumo', 'insumo_funcional_ClaseFit.md'), 'utf8');

describe('Textos al usuario', () => {
  it('usa literalmente los mensajes de RN-01 a RN-04 del insumo', () => {
    expect(ERROR_MESSAGES.CLASS_FULL).toBe('Esta clase ya no tiene cupos.');
    expect(ERROR_MESSAGES.ALREADY_BOOKED).toBe('Ya reservaste esta clase.');
    expect(ERROR_MESSAGES.DAILY_LIMIT_REACHED).toBe('Solo puedes reservar 2 clases por día.');
    expect(ERROR_MESSAGES.CANCELLATION_WINDOW_CLOSED).toBe('Ya no puedes cancelar: faltan menos de 2 horas.');
  });

  it('usa literalmente los textos de las historias de usuario', () => {
    expect(TEXTS.bookingConfirmed).toBe('¡Listo! Tu cupo está reservado');
    expect(TEXTS.noBookings).toBe('Aún no tienes reservas');
    expect(TEXTS.full).toBe('Llena');
  });

  it('cada texto tomado del insumo aparece tal cual en el documento funcional', () => {
    const fromInsumo = [
      ERROR_MESSAGES.CLASS_FULL,
      ERROR_MESSAGES.ALREADY_BOOKED,
      ERROR_MESSAGES.DAILY_LIMIT_REACHED,
      ERROR_MESSAGES.CANCELLATION_WINDOW_CLOSED,
      TEXTS.bookingConfirmed,
      TEXTS.noBookings,
      TEXTS.full,
    ];
    for (const text of fromInsumo) {
      expect(insumo).toContain(`"${text}"`);
    }
  });

  it('usa los textos nuevos del supuesto S9', () => {
    expect(ERROR_MESSAGES.SESSION_ALREADY_STARTED).toBe('Esta clase ya no está disponible.');
    expect(ERROR_MESSAGES.SESSION_NOT_FOUND).toBe('Esta clase ya no está disponible.');
    expect(ERROR_MESSAGES.CATALOG_UNAVAILABLE).toBe('No pudimos cargar las clases.');
    expect(ERROR_MESSAGES.UNEXPECTED).toBe('No pudimos completar la acción. Intenta de nuevo.');
    expect(TEXTS.bookingCancelled).toBe('Reserva cancelada. Liberamos tu cupo.');
  });
});

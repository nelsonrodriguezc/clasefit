import type { BusinessDate } from '@/domain/time/businessTime';
import { datePartsOf, formatLocalTime, localTimeOf, weekdayOf } from '@/domain/time/businessTime';

const WEEKDAYS = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'] as const;
const MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'] as const;
const RELATIVE_DAYS = ['Hoy', 'Mañana', 'Pasado mañana'] as const;

/** "mié 7 oct" (Spanish, no Intl dependency: same output on every JavaScript engine). */
const shortDate = (date: BusinessDate): string => {
  const { month, day } = datePartsOf(date);
  return `${WEEKDAYS[weekdayOf(date)]} ${day} ${MONTHS[month - 1]}`;
};

/** "Hoy · mar 6 oct", "Mañana · mié 7 oct", "Pasado mañana · jue 8 oct"; otherwise "vie 1 ene". */
export const dayLabel = (daysFromToday: number, date: BusinessDate): string => {
  const relative = RELATIVE_DAYS[daysFromToday];
  return relative ? `${relative} · ${shortDate(date)}` : shortDate(date);
};

/** Start time in Bogota, 24-hour clock: "18:00". */
export const timeLabel = (startsAt: number): string => formatLocalTime(localTimeOf(startsAt));

/** HU-01 format: "5 de 20 cupos". */
export const spotsLabel = (available: number, total: number): string => `${available} de ${total} cupos`;

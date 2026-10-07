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

const capitalize = (text: string): string => text.charAt(0).toUpperCase() + text.slice(1);

/** "Hoy · mar 6 oct", "Mañana · mié 7 oct", "Pasado mañana · jue 8 oct"; otherwise "vie 1 ene". */
export const dayLabel = (daysFromToday: number, date: BusinessDate): string => {
  const relative = RELATIVE_DAYS[daysFromToday];
  return relative ? `${relative} · ${shortDate(date)}` : shortDate(date);
};

/** Day selector button: "Hoy" over "Mar 6 oct" for today; just "Mié 7 oct" for the following days. */
export const dayChipText = (daysFromToday: number, date: BusinessDate): { title: string; subtitle: string | null } =>
  daysFromToday === 0
    ? { title: RELATIVE_DAYS[0], subtitle: capitalize(shortDate(date)) }
    : { title: capitalize(shortDate(date)), subtitle: null };

/** Start time in Bogota, 24-hour clock: "18:00". */
export const timeLabel = (startsAt: number): string => formatLocalTime(localTimeOf(startsAt));

/** HU-01 format: "5 de 20 cupos". */
export const spotsLabel = (available: number, total: number): string => `${available} de ${total} cupos`;

const wordsOf = (fullName: string): string[] => fullName.trim().split(/\s+/).filter(Boolean);

/** "Laura Gómez" → "Laura". */
export const firstNameOf = (fullName: string): string => wordsOf(fullName)[0] ?? '';

/** "Laura Gómez" → "LG" (at most two letters). */
export const initialsOf = (fullName: string): string =>
  wordsOf(fullName)
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join('');

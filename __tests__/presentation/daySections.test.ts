import type { UpcomingClass } from '@/application/views';
import type { BusinessDate } from '@/domain/time/businessTime';
import { dayAtOffset, groupByDay } from '@/presentation/daySections';

import { DAY_AFTER_TOMORROW, TODAY, TOMORROW } from '../support/builders';

const aClass = (sessionId: string, daysFromToday: number, date: BusinessDate): UpcomingClass => ({
  sessionId,
  classId: sessionId.split('@')[0] ?? sessionId,
  name: 'Yoga',
  instructor: 'Valentina Ríos',
  date,
  daysFromToday,
  startsAt: 0,
  durationMin: 60,
  capacity: 12,
  availableSpots: 5,
  isFull: false,
  isBookedByMember: false,
  bookingId: null,
});

describe('Secciones por día de "Próximas clases"', () => {
  it('agrupa las clases por día manteniendo el orden', () => {
    const sections = groupByDay([
      aClass('C-02@2026-10-06', 0, TODAY),
      aClass('C-03@2026-10-06', 0, TODAY),
      aClass('C-05@2026-10-07', 1, TOMORROW),
      aClass('C-09@2026-10-08', 2, DAY_AFTER_TOMORROW),
    ]);

    expect(sections.map((section) => [section.daysFromToday, section.date, section.items.map((item) => item.sessionId)])).toEqual([
      [0, TODAY, ['C-02@2026-10-06', 'C-03@2026-10-06']],
      [1, TOMORROW, ['C-05@2026-10-07']],
      [2, DAY_AFTER_TOMORROW, ['C-09@2026-10-08']],
    ]);
  });

  it('sin clases no hay secciones', () => {
    expect(groupByDay([])).toEqual([]);
  });

  it('el día visible es el de la última sección que ya llegó al borde superior', () => {
    const offsets = new Map([
      [0, 300],
      [1, 900],
      [2, 1500],
    ]);

    expect(dayAtOffset(offsets, 100, null)).toBeNull(); // the greeting is still visible
    expect(dayAtOffset(offsets, 300, null)).toBe(0);
    expect(dayAtOffset(offsets, 1000, null)).toBe(1);
    expect(dayAtOffset(offsets, 5000, null)).toBe(2);
    expect(dayAtOffset(new Map(), 1000, 1)).toBe(1);
  });
});

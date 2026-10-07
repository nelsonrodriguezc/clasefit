import { scheduleSession, scheduleWindow } from '@/domain/schedule/schedule';
import { parseLocalTime } from '@/domain/time/businessTime';

import { aGymClass, at, TODAY } from '../../support/builders';

describe('Programación de sesiones a partir del catálogo', () => {
  it('convierte una clase relativa (diaOffset + hora) en una sesión con fecha e inicio absolutos', () => {
    const gymClass = aGymClass({ id: 'C-07', dayOffset: 1, startTime: parseLocalTime('18:00') });

    const session = scheduleSession(gymClass, TODAY);

    expect(session).toMatchObject({
      id: 'C-07@2026-10-07',
      classId: 'C-07',
      date: '2026-10-07',
      startsAt: at('2026-10-07T18:00:00-05:00'),
      capacity: gymClass.capacity,
      takenByOthers: gymClass.takenByOthers,
    });
  });

  it('Scenario: Clases fuera de la ventana de tres días no aparecen', () => {
    const classes = [0, 1, 2, 3].map((dayOffset) => aGymClass({ id: `C-${dayOffset}`, dayOffset }));

    const sessions = scheduleWindow(classes, TODAY);

    expect(sessions.map((session) => session.date)).toEqual(['2026-10-06', '2026-10-07', '2026-10-08']);
  });
});

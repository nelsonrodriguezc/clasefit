import { createBooking } from '@/domain/model/Booking';

import { aSession, LAURA, TUESDAY_10AM_BOGOTA } from '../../support/builders';

describe('createBooking', () => {
  it('guarda una instantánea de la sesión reservada (sigue siendo válida cuando cambia el día)', () => {
    const session = aSession({ classId: 'C-07', name: 'Yoga', instructor: 'Valentina Ríos' });

    const booking = createBooking({ id: 'B-1', memberId: LAURA.id, session, bookedAt: TUESDAY_10AM_BOGOTA });

    expect(booking).toEqual({
      id: 'B-1',
      memberId: 'S-0001',
      sessionId: session.id,
      classId: 'C-07',
      sessionDate: session.date,
      startsAt: session.startsAt,
      durationMin: session.durationMin,
      className: 'Yoga',
      instructor: 'Valentina Ríos',
      bookedAt: TUESDAY_10AM_BOGOTA,
    });
  });

  it('no incluye el nombre de la socia (minimización de datos)', () => {
    const booking = createBooking({ id: 'B-1', memberId: LAURA.id, session: aSession(), bookedAt: 0 });

    expect(JSON.stringify(booking)).not.toContain(LAURA.name);
  });
});

import type { BookingRepository } from '@/application/ports/BookingRepository';
import { InMemoryBookingRepository } from '@/infrastructure/persistence/InMemoryBookingRepository';

import { aBooking } from '../../support/builders';
import { createSecureStack } from '../../support/secureStack';

// Liskov substitution: every BookingRepository implementation must pass the same contract,
// so use cases can work with any of them without knowing which one they got.
const implementations: [string, () => BookingRepository][] = [
  ['InMemoryBookingRepository', () => new InMemoryBookingRepository()],
  ['PersistentBookingRepository (AsyncStorage cifrado)', () => createSecureStack().repository],
];

describe.each(implementations)('Contrato de BookingRepository · %s', (_name, create) => {
  it('empieza sin reservas', async () => {
    expect(await create().findByMember('S-0001')).toEqual([]);
  });

  it('devuelve las reservas agregadas de la socia', async () => {
    const repository = create();
    const booking = aBooking({ id: 'B-1' });

    await repository.add(booking);

    expect(await repository.findByMember('S-0001')).toEqual([booking]);
  });

  it('filtra por socia', async () => {
    const repository = create();
    await repository.add(aBooking({ id: 'B-1', memberId: 'S-0001' }));
    await repository.add(aBooking({ id: 'B-2', memberId: 'S-0002' }));

    expect((await repository.findByMember('S-0002')).map((booking) => booking.id)).toEqual(['B-2']);
  });

  it('elimina solo los identificadores indicados', async () => {
    const repository = create();
    await repository.add(aBooking({ id: 'B-1' }));
    await repository.add(aBooking({ id: 'B-2' }));
    await repository.add(aBooking({ id: 'B-3' }));

    await repository.remove(['B-1', 'B-3']);

    expect((await repository.findByMember('S-0001')).map((booking) => booking.id)).toEqual(['B-2']);
  });

  it('ignora la eliminación de identificadores inexistentes', async () => {
    const repository = create();
    await repository.add(aBooking({ id: 'B-1' }));

    await repository.remove(['B-404']);

    expect(await repository.findByMember('S-0001')).toHaveLength(1);
  });
});

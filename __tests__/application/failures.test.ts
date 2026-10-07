import { aBooking, aGymClass, TOMORROW } from '../support/builders';
import { BrokenCatalog, FakeBookingRepository, InMemoryCatalog } from '../support/fakes';
import { createUseCases } from '../support/useCaseHarness';

const failingReads = () => {
  const repository = new FakeBookingRepository([aBooking({ id: 'B-1' })]);
  repository.failReads = true;
  return repository;
};

describe('Fallas técnicas: los casos de uso responden UNEXPECTED y registran solo un código', () => {
  it('BookClass con el catálogo no disponible', async () => {
    const { bookClass, logger } = createUseCases({ catalog: new BrokenCatalog() });

    expect(await bookClass.execute('C-07@2026-10-07')).toEqual({ ok: false, error: 'UNEXPECTED' });
    expect(logger.events()).toEqual(['catalog.load_failed']);
  });

  it('BookClass sin poder leer las reservas', async () => {
    const { bookClass, logger } = createUseCases({ repository: failingReads() });

    expect(await bookClass.execute('C-07@2026-10-07')).toEqual({ ok: false, error: 'UNEXPECTED' });
    expect(logger.events()).toEqual(['bookings.read_failed']);
  });

  it('CancelBooking sin poder leer las reservas', async () => {
    const { cancelBooking, logger } = createUseCases({ repository: failingReads() });

    expect(await cancelBooking.execute('B-1')).toEqual({ ok: false, error: 'UNEXPECTED' });
    expect(logger.events()).toEqual(['bookings.read_failed']);
  });

  it('PurgeExpiredBookings sin poder leer las reservas', async () => {
    const { purgeExpiredBookings, logger } = createUseCases({ repository: failingReads() });

    expect(await purgeExpiredBookings.execute()).toEqual({ ok: false, error: 'UNEXPECTED' });
    expect(logger.events()).toEqual(['bookings.read_failed']);
  });
});

describe('Orden estable cuando dos sesiones empiezan a la misma hora', () => {
  it('Próximas clases ordena por nombre y luego por identificador', async () => {
    const catalog = new InMemoryCatalog([
      aGymClass({ id: 'C-32', name: 'Yoga' }),
      aGymClass({ id: 'C-31', name: 'Yoga' }),
      aGymClass({ id: 'C-30', name: 'Funcional' }),
    ]);

    const result = await createUseCases({ catalog }).listUpcomingClasses.execute();

    expect(result.ok && result.value.map((item) => item.classId)).toEqual(['C-30', 'C-31', 'C-32']);
  });

  it('Mis reservas ordena por nombre de la clase', async () => {
    const { listMyBookings } = createUseCases({
      bookings: [
        aBooking({ id: 'B-yoga', className: 'Yoga', sessionDate: TOMORROW }),
        aBooking({ id: 'B-funcional', className: 'Funcional', sessionDate: TOMORROW }),
      ],
    });

    const result = await listMyBookings.execute();

    expect(result.ok && result.value.map((booking) => booking.id)).toEqual(['B-funcional', 'B-yoga']);
  });
});

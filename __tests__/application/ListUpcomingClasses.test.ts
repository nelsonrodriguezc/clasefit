import { aBooking, aGymClass, at, TODAY } from '../support/builders';
import { INSUMO_CLASSES } from '../support/catalogFixture';
import { BrokenCatalog, InMemoryCatalog } from '../support/fakes';
import { createUseCases } from '../support/useCaseHarness';

const ids = (result: { ok: boolean; value?: readonly { classId: string }[] }) =>
  result.ok ? (result.value ?? []).map((item) => item.classId) : [];

describe('ListUpcomingClasses', () => {
  it('Scenario: Clases de tres días ordenadas por fecha y hora', async () => {
    const shuffled = [...INSUMO_CLASSES].reverse();
    const { listUpcomingClasses } = createUseCases({
      now: at('2026-10-06T05:00:00-05:00'),
      catalog: new InMemoryCatalog(shuffled),
    });

    const result = await listUpcomingClasses.execute();

    expect(ids(result)).toEqual(['C-01', 'C-02', 'C-03', 'C-04', 'C-05', 'C-06', 'C-07', 'C-08', 'C-09', 'C-10']);
  });

  it('Scenario: Clases que ya comenzaron no aparecen', async () => {
    const { listUpcomingClasses } = createUseCases({ now: at('2026-10-06T18:30:00-05:00') });

    const visibleToday = ids(await listUpcomingClasses.execute()).filter((id) =>
      ['C-01', 'C-02', 'C-03', 'C-04'].includes(id),
    );

    expect(visibleToday).toEqual(['C-03', 'C-04']);
  });

  it('Scenario: Clase que comienza en este instante no aparece', async () => {
    const { listUpcomingClasses } = createUseCases({ now: at('2026-10-06T19:00:00-05:00') });

    expect(ids(await listUpcomingClasses.execute())).not.toContain('C-03');
  });

  it('Scenario: Clases fuera de la ventana de tres días no aparecen', async () => {
    const catalog = new InMemoryCatalog([aGymClass({ id: 'C-11', dayOffset: 3 }), aGymClass({ id: 'C-12', dayOffset: 2 })]);
    const { listUpcomingClasses } = createUseCases({ catalog });

    expect(ids(await listUpcomingClasses.execute())).toEqual(['C-12']);
  });

  it('expone cupos, estado y días desde hoy de cada sesión', async () => {
    const { listUpcomingClasses } = createUseCases({
      bookings: [aBooking({ classId: 'C-02', sessionDate: TODAY })],
    });

    const result = await listUpcomingClasses.execute();
    if (!result.ok) throw new Error('expected ok');
    const byId = Object.fromEntries(result.value.map((item) => [item.classId, item]));

    expect(byId['C-02']).toMatchObject({
      sessionId: 'C-02@2026-10-06',
      daysFromToday: 0,
      capacity: 15,
      availableSpots: 5,
      isFull: false,
      isBookedByMember: true,
    });
    expect(byId['C-02']?.bookingId).toBe('B-1');
    expect(byId['C-03']).toMatchObject({ availableSpots: 0, isFull: true, isBookedByMember: false, bookingId: null });
    expect(byId['C-07']).toMatchObject({ daysFromToday: 1, availableSpots: 7, instructor: 'Valentina Ríos' });
    expect(byId['C-10']).toMatchObject({ daysFromToday: 2, availableSpots: 1 });
  });

  it('Scenario: Catálogo con estructura inválida (el catálogo no carga → error sin clases)', async () => {
    const { listUpcomingClasses, logger } = createUseCases({ catalog: new BrokenCatalog() });

    expect(await listUpcomingClasses.execute()).toEqual({ ok: false, error: 'CATALOG_UNAVAILABLE' });
    expect(logger.events()).toEqual(['catalog.load_failed']);
  });

  it('devuelve UNEXPECTED si no se pueden leer las reservas', async () => {
    const harness = createUseCases();
    (harness.repository as unknown as { failReads: boolean }).failReads = true;

    expect(await harness.listUpcomingClasses.execute()).toEqual({ ok: false, error: 'UNEXPECTED' });
    expect(harness.logger.events()).toEqual(['bookings.read_failed']);
  });
});

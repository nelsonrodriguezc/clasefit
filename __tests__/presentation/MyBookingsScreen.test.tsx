import { fireEvent, screen, within } from '@testing-library/react-native';

import { err } from '@/domain/shared/Result';
import { HOUR_MS, parseLocalTime, sessionStart } from '@/domain/time/businessTime';

import { aBooking, DAY_AFTER_TOMORROW, TODAY, TOMORROW, TUESDAY_10AM_BOGOTA } from '../support/builders';
import { openTab, renderApp } from '../support/renderApp';

const spinningTomorrow = aBooking({
  id: 'B-spin',
  classId: 'C-05',
  className: 'Spinning',
  instructor: 'Andrés Restrepo',
  sessionDate: TOMORROW,
  startsAt: sessionStart(TOMORROW, parseLocalTime('06:00')),
  durationMin: 45,
});
const yogaDayAfter = aBooking({
  id: 'B-yoga',
  classId: 'C-10',
  className: 'Yoga',
  sessionDate: DAY_AFTER_TOMORROW,
  startsAt: sessionStart(DAY_AFTER_TOMORROW, parseLocalTime('09:00')),
});

describe('Pantalla "Mis reservas"', () => {
  it('Scenario: Sin reservas muestra "Aún no tienes reservas"', async () => {
    await renderApp();
    await openTab('Mis reservas');

    expect(await screen.findByText('Aún no tienes reservas')).toBeOnTheScreen();
  });

  it('muestra las reservas de la más próxima a la más lejana con sus datos', async () => {
    await renderApp({ bookings: [yogaDayAfter, spinningTomorrow] });
    await openTab('Mis reservas');

    const cards = await screen.findAllByTestId(/^booking-/);
    expect(cards.map((element) => element.props.testID)).toEqual(['booking-B-spin', 'booking-B-yoga']);
    const spinning = within(cards[0]!);
    expect(spinning.getByText('Spinning')).toBeOnTheScreen();
    expect(spinning.getByText('Mañana · mié 7 oct · 06:00 · 45 min')).toBeOnTheScreen();
    expect(spinning.getByText('Instructor: Andrés Restrepo')).toBeOnTheScreen();
  });

  it('cancelar pide confirmación y, al confirmar, elimina la reserva y libera el cupo', async () => {
    await renderApp({ bookings: [spinningTomorrow] });
    await openTab('Mis reservas');

    await fireEvent.press(await screen.findByRole('button', { name: /Cancelar reserva de Spinning/ }));
    expect(await screen.findByText('¿Cancelar esta reserva?')).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('button', { name: 'Sí, cancelar' }));

    expect(await screen.findByText('Reserva cancelada. Liberamos tu cupo.')).toBeOnTheScreen();
    expect(screen.queryByTestId('booking-B-spin')).toBeNull();
    expect(screen.getByText('Aún no tienes reservas')).toBeOnTheScreen();

    await openTab('Próximas clases');
    const spinningCard = within(await screen.findByTestId('class-C-05@2026-10-07'));
    expect(await spinningCard.findByText('9 de 20 cupos')).toBeOnTheScreen();
  });

  it('si la socia no confirma, la reserva se mantiene', async () => {
    await renderApp({ bookings: [spinningTomorrow] });
    await openTab('Mis reservas');

    await fireEvent.press(await screen.findByRole('button', { name: /Cancelar reserva de Spinning/ }));
    await fireEvent.press(await screen.findByRole('button', { name: 'No, mantener' }));

    expect(screen.queryByText('¿Cancelar esta reserva?')).toBeNull();
    expect(screen.getByTestId('booking-B-spin')).toBeOnTheScreen();
  });

  it('con menos de 2 horas muestra el mensaje de RN-04 sin pedir confirmación', async () => {
    const soon = aBooking({ id: 'B-soon', classId: 'C-02', className: 'Funcional', sessionDate: TODAY, startsAt: TUESDAY_10AM_BOGOTA + HOUR_MS });
    await renderApp({ bookings: [soon] });
    await openTab('Mis reservas');

    await fireEvent.press(await screen.findByRole('button', { name: /Cancelar reserva de Funcional/ }));

    expect(await screen.findByText('Ya no puedes cancelar: faltan menos de 2 horas.')).toBeOnTheScreen();
    expect(screen.queryByText('¿Cancelar esta reserva?')).toBeNull();
    expect(screen.getByTestId('booking-B-soon')).toBeOnTheScreen();
  });

  it('si no se pueden leer las reservas muestra el error y permite reintentar', async () => {
    await renderApp({ override: { listMyBookings: { execute: async () => err('UNEXPECTED' as const) } } });
    await openTab('Mis reservas');

    expect(screen.getByText('No pudimos completar la acción. Intenta de nuevo.')).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Reintentar' })).toBeOnTheScreen();
  });

  it('si no se puede guardar la cancelación, la reserva se conserva y se informa el error', async () => {
    const harnessFor = await renderApp({ bookings: [spinningTomorrow] });
    const failingCancel = {
      check: harnessFor.cancelBooking.check.bind(harnessFor.cancelBooking),
      execute: async () => err('UNEXPECTED' as const),
    };
    await screen.unmount();
    await renderApp({ bookings: [spinningTomorrow], override: { cancelBooking: failingCancel } });
    await openTab('Mis reservas');

    await fireEvent.press(await screen.findByRole('button', { name: /Cancelar reserva de Spinning/ }));
    await fireEvent.press(await screen.findByRole('button', { name: 'Sí, cancelar' }));

    expect(await screen.findByText('No pudimos completar la acción. Intenta de nuevo.')).toBeOnTheScreen();
    expect(screen.getByTestId('booking-B-spin')).toBeOnTheScreen();
  });
});

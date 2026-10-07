import { fireEvent, screen, within } from '@testing-library/react-native';

import { err } from '@/domain/shared/Result';

import { BrokenCatalog } from '../support/fakes';
import { openTab, renderApp } from '../support/renderApp';

const card = (sessionId: string) => within(screen.getByTestId(`class-${sessionId}`));

describe('Pantalla "Próximas clases"', () => {
  it('muestra nombre, día, hora, instructor y cupos de cada clase', async () => {
    await renderApp();

    const funcional = card('C-02@2026-10-06');
    expect(funcional.getByText('Funcional')).toBeOnTheScreen();
    expect(funcional.getByText('Hoy · mar 6 oct · 18:00 · 60 min')).toBeOnTheScreen();
    expect(funcional.getByText('Instructor: Camila Ospina')).toBeOnTheScreen();
    expect(funcional.getByText('6 de 15 cupos')).toBeOnTheScreen();
    expect(funcional.getByRole('button', { name: /Reservar Funcional/ })).toBeOnTheScreen();
  });

  it('abre el detalle de una clase y permite volver sin perder la lista', async () => {
    await renderApp();

    await fireEvent.press(card('C-02@2026-10-06').getByRole('button', { name: 'Ver detalle de Funcional' }));

    expect(await screen.findByTestId('class-detail')).toBeOnTheScreen();
    expect(screen.getByText('Descripción')).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('button', { name: 'Volver' }));

    expect(screen.queryByTestId('class-detail')).toBeNull();
    expect(screen.getByTestId('class-C-02@2026-10-06')).toBeOnTheScreen();
  });

  it('no muestra las clases que ya comenzaron (Spinning de hoy a las 06:00)', async () => {
    await renderApp();

    expect(screen.queryByTestId('class-C-01@2026-10-06')).toBeNull();
  });

  it('Scenario: Clase sin cupos se muestra como Llena (sin acción de reservar)', async () => {
    await renderApp();

    const yogaHoy = card('C-03@2026-10-06');
    expect(yogaHoy.getByText('Llena')).toBeOnTheScreen();
    expect(yogaHoy.queryByRole('button', { name: /Reservar/ })).toBeNull();
  });

  it('al reservar muestra "¡Listo! Tu cupo está reservado", baja el cupo y marca la clase como Reservada', async () => {
    await renderApp();

    await fireEvent.press(card('C-07@2026-10-07').getByRole('button', { name: /Reservar Yoga/ }));

    expect(await screen.findByText('¡Listo! Tu cupo está reservado')).toBeOnTheScreen();
    expect(card('C-07@2026-10-07').getByText('6 de 12 cupos')).toBeOnTheScreen();
    expect(card('C-07@2026-10-07').getByText('Reservada')).toBeOnTheScreen();
  });

  it('al reservar el último cupo la clase pasa a mostrarse como Llena', async () => {
    await renderApp();

    await fireEvent.press(card('C-06@2026-10-07').getByRole('button', { name: /Reservar Funcional/ }));

    await screen.findByText('¡Listo! Tu cupo está reservado');
    expect(card('C-06@2026-10-07').getByText('Llena')).toBeOnTheScreen();
  });

  it('muestra el mensaje de RN-03 al intentar la tercera reserva del mismo día', async () => {
    await renderApp();

    await fireEvent.press(card('C-05@2026-10-07').getByRole('button', { name: /Reservar/ }));
    await screen.findByText('¡Listo! Tu cupo está reservado');
    await fireEvent.press(card('C-07@2026-10-07').getByRole('button', { name: /Reservar/ }));
    await screen.findByText('¡Listo! Tu cupo está reservado');
    await fireEvent.press(card('C-09@2026-10-08').getByRole('button', { name: /Reservar/ }));
    await screen.findByText('¡Listo! Tu cupo está reservado');
    await fireEvent.press(card('C-06@2026-10-07').getByRole('button', { name: /Reservar/ }));

    expect(await screen.findByText('Solo puedes reservar 2 clases por día.')).toBeOnTheScreen();
  });

  it.each([
    ['CLASS_FULL', 'Esta clase ya no tiene cupos.'],
    ['ALREADY_BOOKED', 'Ya reservaste esta clase.'],
    ['SESSION_ALREADY_STARTED', 'Esta clase ya no está disponible.'],
    ['UNEXPECTED', 'No pudimos completar la acción. Intenta de nuevo.'],
  ] as const)('traduce el rechazo %s al mensaje "%s"', async (code, message) => {
    await renderApp({ override: { bookClass: { execute: async () => err(code) } } });

    await fireEvent.press(card('C-07@2026-10-07').getByRole('button', { name: /Reservar/ }));

    expect(await screen.findByText(message)).toBeOnTheScreen();
  });

  it('al volver a la pestaña no muestra el mensaje de una acción anterior (podría estar desactualizado)', async () => {
    await renderApp();
    await fireEvent.press(card('C-05@2026-10-07').getByRole('button', { name: /Reservar/ }));
    await screen.findByText('¡Listo! Tu cupo está reservado');

    await openTab('Mis reservas');
    await openTab('Próximas clases');

    expect(screen.queryByText('¡Listo! Tu cupo está reservado')).toBeNull();
  });

  it('permite cerrar el mensaje de retroalimentación', async () => {
    await renderApp();
    await fireEvent.press(card('C-07@2026-10-07').getByRole('button', { name: /Reservar/ }));
    await screen.findByText('¡Listo! Tu cupo está reservado');

    await fireEvent.press(screen.getByRole('button', { name: 'Cerrar' }));

    expect(screen.queryByText('¡Listo! Tu cupo está reservado')).toBeNull();
  });

  it('con un catálogo inválido muestra "No pudimos cargar las clases." y permite reintentar', async () => {
    await renderApp({ catalog: new BrokenCatalog() });

    expect(screen.getByText('No pudimos cargar las clases.')).toBeOnTheScreen();
    expect(screen.queryByTestId('upcoming-classes')).toBeNull();
    expect(screen.getByRole('button', { name: 'Reintentar' })).toBeOnTheScreen();
  });
});

import { fireEvent, screen, within } from '@testing-library/react-native';
import { ScrollView } from 'react-native';

import { err } from '@/domain/shared/Result';

import { BrokenCatalog } from '../support/fakes';
import { openTab, renderApp } from '../support/renderApp';

const card = (sessionId: string) => within(screen.getByTestId(`class-${sessionId}`));
const dayButton = (label: string) => screen.getByRole('button', { name: label });

/** Gives the selector and the day sections a layout, as the device does on the first render. */
async function layOutDays() {
  await fireEvent(screen.getByTestId('day-selector'), 'layout', { nativeEvent: { layout: { x: 0, y: 120, width: 360, height: 64 } } });
  for (const [day, y] of [
    [0, 300],
    [1, 900],
    [2, 1500],
  ] as const) {
    await fireEvent(screen.getByTestId(`day-section-${day}`), 'layout', { nativeEvent: { layout: { x: 0, y, width: 360, height: 500 } } });
  }
}

const scrollListTo = (y: number) =>
  fireEvent.scroll(screen.getByTestId('upcoming-list'), {
    nativeEvent: { contentOffset: { x: 0, y }, contentSize: { width: 360, height: 2200 }, layoutMeasurement: { width: 360, height: 700 } },
  });

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

    await fireEvent.press(card('C-02@2026-10-06').getByRole('button', { name: /^Ver detalle de Funcional/ }));

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

  it('el selector de día sigue el desplazamiento de la lista', async () => {
    await renderApp();
    await layOutDays();

    await scrollListTo(900);
    expect(dayButton('Mañana · mié 7 oct')).toBeSelected();

    await scrollListTo(1600);
    expect(dayButton('Pasado mañana · jue 8 oct')).toBeSelected();

    await scrollListTo(0);
    expect(dayButton('Hoy · mar 6 oct')).toBeSelected();
  });

  it('elegir un día desplaza la lista hasta su sección (bajo el selector fijo) sin que el desplazamiento cambie la elección', async () => {
    const scrollTo = jest.spyOn(ScrollView.prototype as unknown as { scrollTo: (options: object) => void }, 'scrollTo');
    await renderApp();
    await layOutDays();

    await fireEvent.press(dayButton('Pasado mañana · jue 8 oct'));
    await scrollListTo(200); // the animated scroll passes over the other days

    expect(scrollTo).toHaveBeenCalledWith({ y: 1500 - 64, animated: true });
    expect(dayButton('Pasado mañana · jue 8 oct')).toBeSelected();
  });

  it('el avatar de la socia lleva al perfil', async () => {
    await renderApp();

    await fireEvent.press(screen.getByRole('button', { name: 'Ver perfil' }));

    expect(await screen.findByTestId('profile')).toBeOnTheScreen();
  });

  it('si no se pueden leer los datos de la socia, saluda sin nombre y sigue mostrando las clases', async () => {
    await renderApp({ override: { getMemberProfile: { execute: async () => err('UNEXPECTED' as const) } } });

    expect(screen.getByText('Hola 👋')).toBeOnTheScreen();
    expect(screen.queryByRole('button', { name: 'Ver perfil' })).toBeNull();
    expect(screen.getByTestId('class-C-02@2026-10-06')).toBeOnTheScreen();
  });

  it('con un catálogo inválido muestra "No pudimos cargar las clases." y permite reintentar', async () => {
    await renderApp({ catalog: new BrokenCatalog() });

    expect(screen.getByText('No pudimos cargar las clases.')).toBeOnTheScreen();
    expect(screen.queryByTestId('upcoming-classes')).toBeNull();
    expect(screen.getByRole('button', { name: 'Reintentar' })).toBeOnTheScreen();
  });
});

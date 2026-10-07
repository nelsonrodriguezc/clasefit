import { fireEvent, screen, waitFor, within } from '@testing-library/react-native';

import { HOUR_MS, parseLocalTime, sessionStart } from '@/domain/time/businessTime';
import { colors } from '@/presentation/theme';

import { aBooking, at, TODAY, TOMORROW } from '../support/builders';
import { BrokenCatalog } from '../support/fakes';
import { openTab, renderApp, startApp, tabButton, tabButtons } from '../support/renderApp';

/**
 * Acceptance suite of the `app-shell` capability: one describe per Requirement and one it per
 * Scenario of openspec/changes/refresh-mobile-ux-ui/specs/app-shell/spec.md (same names).
 * Reference "now" unless stated otherwise: Tuesday 2026-10-06, 10:00 in Bogotá.
 */

const card = (sessionId: string) => within(screen.getByTestId(`class-${sessionId}`));
const detail = () => within(screen.getByTestId('class-detail'));
const dayButton = (label: string) => screen.getByRole('button', { name: label });
const dayButtons = () => screen.getAllByRole('button', { name: /^(Hoy|Mañana|Pasado mañana) · / });

const yogaTomorrow = aBooking({
  id: 'B-yoga',
  classId: 'C-07',
  className: 'Yoga',
  instructor: 'Valentina Ríos',
  sessionDate: TOMORROW,
  startsAt: sessionStart(TOMORROW, parseLocalTime('18:00')),
  durationMin: 60,
});
const spinningTomorrow = aBooking({
  id: 'B-spin',
  classId: 'C-05',
  className: 'Spinning',
  instructor: 'Andrés Restrepo',
  sessionDate: TOMORROW,
  startsAt: sessionStart(TOMORROW, parseLocalTime('06:00')),
  durationMin: 45,
});
const funcionalTomorrow = aBooking({
  id: 'B-func',
  classId: 'C-06',
  className: 'Funcional',
  instructor: 'Camila Ospina',
  sessionDate: TOMORROW,
  startsAt: sessionStart(TOMORROW, parseLocalTime('07:00')),
  durationMin: 60,
});

/** WCAG 2.1 relative luminance and contrast ratio of two "#RRGGBB" colors. */
const luminance = (hex: string): number => {
  const [r, g, b] = [1, 3, 5].map((start) => {
    const channel = parseInt(hex.slice(start, start + 2), 16) / 255;
    return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  }) as [number, number, number];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const contrast = (foreground: string, background: string): number => {
  const [light, dark] = [luminance(foreground), luminance(background)].sort((a, b) => b - a) as [number, number];
  return (light + 0.05) / (dark + 0.05);
};

describe('Pantalla de inicio con la marca', () => {
  it('La marca se ve mientras la app carga', async () => {
    await startApp({ override: { listUpcomingClasses: { execute: () => new Promise(() => undefined) } } });

    const splash = within(screen.getByTestId('brand-splash'));
    expect(splash.getByText('ClaseFit')).toBeOnTheScreen();
    expect(splash.getByText(/^Tu energía,\s+nuestras clases$/)).toBeOnTheScreen();
  });

  it('La pantalla de inicio se quita cuando hay contenido', async () => {
    await startApp();

    await waitFor(() => expect(screen.queryByTestId('brand-splash')).toBeNull());
    expect(screen.getAllByTestId(/^class-C-/).length).toBeGreaterThan(0);
  });

  it('La pantalla de inicio también se quita si la carga falla', async () => {
    await startApp({ catalog: new BrokenCatalog() });

    await waitFor(() => expect(screen.queryByTestId('brand-splash')).toBeNull());
    expect(screen.getByText('No pudimos cargar las clases.')).toBeOnTheScreen();
  });
});

describe('Pestañas en el orden del mockup', () => {
  it('Tres pestañas en orden', async () => {
    await renderApp();

    expect(tabButtons().map((tab) => tab.props.accessibilityLabel)).toEqual([
      'Próximas clases, tab, 1 of 3',
      'Mis reservas, tab, 2 of 3',
      'Perfil, tab, 3 of 3',
    ]);
    expect(tabButton('Próximas clases')).toBeSelected();
  });

  it('Cambiar de pestaña cambia la seleccionada', async () => {
    await renderApp();

    await openTab('Perfil');

    expect(tabButton('Perfil')).toBeSelected();
    expect(tabButton('Próximas clases')).not.toBeSelected();
  });
});

describe('Saludo con los datos de la socia', () => {
  it('Saludo a la socia del insumo', async () => {
    await renderApp();

    expect(await screen.findByText(/^Hola, Laura/)).toBeOnTheScreen();
    expect(screen.getByText('S-0001')).toBeOnTheScreen();
  });

  it('El saludo cambia si cambian los datos', async () => {
    await renderApp({ member: { id: 'S-0042', name: 'Marta Ruiz' } });

    expect(await screen.findByText(/^Hola, Marta/)).toBeOnTheScreen();
    expect(screen.getByText('S-0042')).toBeOnTheScreen();
    expect(screen.queryByText(/Laura/)).toBeNull();
  });
});

describe('Selector de día', () => {
  it('Un botón por cada día con clases', async () => {
    await renderApp();

    expect(screen.getByText('Hoy')).toBeOnTheScreen();
    expect(screen.getByText('Mié 7 oct')).toBeOnTheScreen();
    expect(screen.getByText('Jue 8 oct')).toBeOnTheScreen();
    expect(dayButtons().map((button) => button.props.accessibilityLabel)).toEqual([
      'Hoy · mar 6 oct',
      'Mañana · mié 7 oct',
      'Pasado mañana · jue 8 oct',
    ]);
    expect(dayButton('Hoy · mar 6 oct')).toBeSelected();
  });

  it('Elegir un día no oculta los demás', async () => {
    await renderApp();

    await fireEvent.press(dayButton('Mañana · mié 7 oct'));

    expect(dayButton('Mañana · mié 7 oct')).toBeSelected();
    expect(dayButton('Hoy · mar 6 oct')).not.toBeSelected();
    for (const sessionId of ['C-02@2026-10-06', 'C-05@2026-10-07', 'C-09@2026-10-08']) {
      expect(screen.getByTestId(`class-${sessionId}`)).toBeOnTheScreen();
    }
  });

  it('Sin clases restantes hoy no hay botón "Hoy"', async () => {
    await renderApp({ now: at('2026-10-06T20:30:00-05:00') });

    expect(screen.queryByText('Hoy')).toBeNull();
    const [first] = dayButtons();
    expect(first?.props.accessibilityLabel).toBe('Mañana · mié 7 oct');
    expect(first).toBeSelected();
  });
});

describe('Tarjetas de clase', () => {
  it('Clase con cupos', async () => {
    await renderApp();

    const funcional = card('C-02@2026-10-06');
    expect(funcional.getByText('Funcional')).toBeOnTheScreen();
    expect(funcional.getByText('Hoy · mar 6 oct · 18:00 · 60 min')).toBeOnTheScreen();
    expect(funcional.getByText('Instructor: Camila Ospina')).toBeOnTheScreen();
    expect(funcional.getByText('6 de 15 cupos')).toBeOnTheScreen();
    expect(funcional.getByRole('button', { name: /^Reservar Funcional/ })).toBeOnTheScreen();
  });

  it('Clase llena', async () => {
    await renderApp();

    const yoga = card('C-03@2026-10-06');
    expect(yoga.getByText('Llena')).toBeOnTheScreen();
    expect(yoga.queryByRole('button', { name: /^Reservar/ })).toBeNull();
  });

  it('Clase reservada por la socia', async () => {
    await renderApp({ bookings: [yogaTomorrow] });

    const yoga = card('C-07@2026-10-07');
    expect(yoga.getByText('Reservada')).toBeOnTheScreen();
    expect(yoga.queryByRole('button', { name: /^Reservar/ })).toBeNull();
  });
});

describe('Detalle de clase', () => {
  it('Abrir el detalle desde una tarjeta', async () => {
    await renderApp();

    await fireEvent.press(card('C-05@2026-10-07').getByRole('button', { name: /^Ver detalle de Spinning/ }));

    const spinning = detail();
    expect(spinning.getByText('Spinning')).toBeOnTheScreen();
    expect(spinning.getByText('Instructor: Andrés Restrepo')).toBeOnTheScreen();
    expect(spinning.getByText('9 de 20 cupos')).toBeOnTheScreen();
    expect(spinning.getByText('Descripción')).toBeOnTheScreen();
    for (const tag of ['Cardio', 'Fuerza', 'Resistencia']) expect(spinning.getByText(tag)).toBeOnTheScreen();
  });

  it('Volver desde el detalle conserva la lista', async () => {
    await renderApp();
    await fireEvent.press(card('C-02@2026-10-06').getByRole('button', { name: /^Ver detalle de Funcional/ }));

    await fireEvent.press(detail().getByRole('button', { name: 'Volver' }));

    expect(screen.queryByTestId('class-detail')).toBeNull();
    expect(card('C-02@2026-10-06').getByText('6 de 15 cupos')).toBeOnTheScreen();
    expect(screen.getAllByTestId(/^class-C-/)).toHaveLength(9);
  });
});

describe('Reservar y cancelar desde el detalle', () => {
  it('Reservar desde el detalle', async () => {
    await renderApp();
    await fireEvent.press(card('C-07@2026-10-07').getByRole('button', { name: /^Ver detalle de Yoga/ }));

    await fireEvent.press(detail().getByRole('button', { name: /^Reservar Yoga/ }));

    expect(await detail().findByText('¡Listo! Tu cupo está reservado')).toBeOnTheScreen();
    expect(detail().getByText('Reservada')).toBeOnTheScreen();
    expect(detail().getByText('6 de 12 cupos')).toBeOnTheScreen();
  });

  it('Rechazo de una regla desde el detalle', async () => {
    await renderApp({ bookings: [spinningTomorrow, funcionalTomorrow] });
    await fireEvent.press(card('C-07@2026-10-07').getByRole('button', { name: /^Ver detalle de Yoga/ }));

    await fireEvent.press(detail().getByRole('button', { name: /^Reservar Yoga/ }));

    expect(await detail().findByText('Solo puedes reservar 2 clases por día.')).toBeOnTheScreen();
  });

  it('Cancelar desde el detalle con confirmación', async () => {
    await renderApp({ bookings: [yogaTomorrow] });
    await fireEvent.press(card('C-07@2026-10-07').getByRole('button', { name: /^Ver detalle de Yoga/ }));

    await fireEvent.press(detail().getByRole('button', { name: /^Cancelar reserva de Yoga/ }));
    expect(await screen.findByText('¿Cancelar esta reserva?')).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('button', { name: 'Sí, cancelar' }));

    expect(await detail().findByText('Reserva cancelada. Liberamos tu cupo.')).toBeOnTheScreen();
    expect(detail().getByRole('button', { name: /^Reservar Yoga/ })).toBeOnTheScreen();
    expect(detail().getByText('7 de 12 cupos')).toBeOnTheScreen();
  });

  it('Cancelar desde el detalle con menos de 2 horas', async () => {
    const funcionalToday = aBooking({
      id: 'B-soon',
      classId: 'C-02',
      className: 'Funcional',
      instructor: 'Camila Ospina',
      sessionDate: TODAY,
      startsAt: sessionStart(TODAY, parseLocalTime('18:00')),
    });
    await renderApp({ now: funcionalToday.startsAt - HOUR_MS, bookings: [funcionalToday] });
    await fireEvent.press(card('C-02@2026-10-06').getByRole('button', { name: /^Ver detalle de Funcional/ }));

    await fireEvent.press(detail().getByRole('button', { name: /^Cancelar reserva de Funcional/ }));

    expect(await detail().findByText('Ya no puedes cancelar: faltan menos de 2 horas.')).toBeOnTheScreen();
    expect(screen.queryByText('¿Cancelar esta reserva?')).toBeNull();
  });
});

describe('Mis reservas con el estilo del mockup', () => {
  it('Reservas como tarjetas con el aviso de la regla', async () => {
    await renderApp({ bookings: [spinningTomorrow] });
    await openTab('Mis reservas');

    expect(screen.getByText('Puedes cancelar hasta 2 horas antes del inicio.')).toBeOnTheScreen();
    const spinning = within(screen.getByTestId('booking-B-spin'));
    expect(spinning.getByText('Spinning')).toBeOnTheScreen();
    expect(spinning.getByText('Reservada')).toBeOnTheScreen();
    expect(spinning.getByText('Mañana · mié 7 oct · 06:00 · 45 min')).toBeOnTheScreen();
    expect(spinning.getByText('Instructor: Andrés Restrepo')).toBeOnTheScreen();
    expect(spinning.getByRole('button', { name: /^Cancelar reserva de Spinning/ })).toBeOnTheScreen();
  });

  it('Sin reservas no se muestra el aviso', async () => {
    await renderApp();
    await openTab('Mis reservas');

    expect(await screen.findByText('Aún no tienes reservas')).toBeOnTheScreen();
    expect(screen.queryByText('Puedes cancelar hasta 2 horas antes del inicio.')).toBeNull();
  });
});

describe('Perfil de la socia', () => {
  it('Datos de la socia en el perfil', async () => {
    await renderApp();
    await openTab('Perfil');

    const profile = within(screen.getByTestId('profile'));
    expect(await profile.findByText('Laura Gómez')).toBeOnTheScreen();
    expect(profile.getByText('S-0001')).toBeOnTheScreen();
    expect(profile.getByText('Miembro activo')).toBeOnTheScreen();
  });

  it('Reservas activas y acceso a Mis reservas', async () => {
    await renderApp({ bookings: [spinningTomorrow, yogaTomorrow] });
    await openTab('Perfil');

    expect(await screen.findByText('2 reservas activas')).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('button', { name: /^Mis reservas, 2 reservas activas/ }));

    expect(await screen.findByTestId('my-bookings')).toBeOnTheScreen();
    expect(tabButton('Mis reservas')).toBeSelected();
  });

  it('Sin opciones fuera del alcance', async () => {
    await renderApp();
    await openTab('Perfil');

    await screen.findByText('Laura Gómez');
    for (const outOfScope of ['Cerrar sesión', 'Notificaciones', 'Pagos']) {
      expect(screen.queryByText(outOfScope)).toBeNull();
    }
  });
});

describe('Retroalimentación unificada', () => {
  it('Aviso de éxito al reservar', async () => {
    await renderApp();

    await fireEvent.press(card('C-07@2026-10-07').getByRole('button', { name: /^Reservar Yoga/ }));

    const banner = within(await screen.findByTestId('feedback-success'));
    expect(banner.getByText('¡Listo! Tu cupo está reservado')).toBeOnTheScreen();
    expect(banner.getByRole('button', { name: 'Cerrar' })).toBeOnTheScreen();
  });

  it('Aviso de error al incumplir una regla', async () => {
    await renderApp({ bookings: [spinningTomorrow, funcionalTomorrow] });

    await fireEvent.press(card('C-07@2026-10-07').getByRole('button', { name: /^Reservar Yoga/ }));

    const banner = await screen.findByTestId('feedback-error');
    expect(banner).toHaveProp('accessibilityRole', 'alert');
    expect(within(banner).getByText('Solo puedes reservar 2 clases por día.')).toBeOnTheScreen();
  });
});

describe('Contraste del tema oscuro', () => {
  it('Pares de texto y fondo del tema', () => {
    const textColors = [colors.text, colors.muted, colors.primary, colors.primaryLight, colors.dangerText, colors.warningText];
    const darkBackgrounds = [
      colors.background,
      colors.surface,
      colors.surfaceRaised,
      colors.tabBar,
      colors.successSurface,
      colors.dangerSurface,
      colors.warningSurface,
    ];
    const pairs: [string, string][] = [
      ...textColors.flatMap((text) => darkBackgrounds.map((background): [string, string] => [text, background])),
      [colors.badgeText, colors.badgeSurface],
      [colors.onPrimary, colors.primary],
      [colors.onDanger, colors.dangerStrong],
    ];

    const failing = pairs.filter(([text, background]) => contrast(text, background) < 4.5);

    expect(failing).toEqual([]);
  });
});

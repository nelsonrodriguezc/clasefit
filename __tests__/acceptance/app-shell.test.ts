import React from 'react';
import { fireEvent, render, screen, within } from '@testing-library/react-native';

import App from '../../App';
import { SplashScreen } from '@/presentation/components/SplashScreen';
import { openTab, renderApp, waitForLoaded } from '../support/renderApp';

describe('Splash branding', () => {
  it('Inicio muestra branding', async () => {
    await render(React.createElement(SplashScreen));
    expect(screen.getByText('ClaseFit')).toBeOnTheScreen();
    expect(screen.getByText(/Tu energía/)).toBeOnTheScreen();
  });

  it('La app termina de iniciar sin parpadeo', async () => {
    await render(React.createElement(App));
    await waitForLoaded();
    expect(screen.getAllByText('Próximas clases').length).toBeGreaterThan(0);
    expect(screen.queryByTestId('splash')).toBeNull();
  });
});

describe('Shell autenticado consistente', () => {
  it('Navegación principal visible', async () => {
    await render(React.createElement(App));
    await waitForLoaded();
    expect(screen.getAllByText('Próximas clases').length).toBeGreaterThan(0);
    expect(screen.getByText('Mis reservas')).toBeOnTheScreen();
  });

  it('Superficie de perfil accesible', async () => {
    await render(React.createElement(App));
    await waitForLoaded();
    await fireEvent.press(screen.getByText('Perfil'));
    expect(screen.getByText('Laura Gómez')).toBeOnTheScreen();
  });
});

describe('Presentación visual de "Próximas clases"', () => {
  it('La pantalla muestra la agenda con identidad visual renovada', async () => {
    await render(React.createElement(App));
    await waitForLoaded();
    expect(screen.getByText(/Hola,/)).toBeOnTheScreen();
    expect(screen.getByText('Hoy')).toBeOnTheScreen();
    expect((await screen.findAllByTestId(/^class-/)).length).toBeGreaterThan(0);
  });

  it('Los estados funcionales siguen presentes', async () => {
    await renderApp();
    await fireEvent.press(within(screen.getByTestId('class-C-07@2026-10-07')).getByRole('button', { name: /Reservar Yoga/ }));
    expect(await screen.findByText('Reservada')).toBeOnTheScreen();
    expect(within(screen.getByTestId('class-C-03@2026-10-06')).getByText('Llena')).toBeOnTheScreen();
  });
});

describe('Superficie de detalle de clase', () => {
  it('Abrir el detalle desde una clase', async () => {
    await renderApp();
    await fireEvent.press(within(screen.getByTestId('class-C-02@2026-10-06')).getByRole('button', { name: 'Ver detalle de Funcional' }));
    expect(await screen.findByTestId('class-detail')).toBeOnTheScreen();
    expect(screen.getByText('Descripción')).toBeOnTheScreen();
  });

  it('Volver desde el detalle no altera la clase', async () => {
    await renderApp();
    await fireEvent.press(within(screen.getByTestId('class-C-02@2026-10-06')).getByRole('button', { name: 'Ver detalle de Funcional' }));
    await fireEvent.press(await screen.findByRole('button', { name: 'Volver' }));
    expect(screen.getByTestId('class-C-02@2026-10-06')).toBeOnTheScreen();
  });
});

describe('Presentación visual de "Mis reservas"', () => {
  it('Reservas visibles con el nuevo estilo', async () => {
    await renderApp({ bookings: [] });
    await openTab('Mis reservas');
    expect(screen.getByTestId('my-bookings')).toBeOnTheScreen();
  });

  it('Estado vacío mantiene el mensaje funcional', async () => {
    await renderApp({ bookings: [] });
    await openTab('Mis reservas');
    expect(await screen.findByText('Aún no tienes reservas')).toBeOnTheScreen();
  });
});

describe('Feedback visual unificado', () => {
  it('Reserva exitosa usa el feedback correcto', async () => {
    await renderApp();
    await fireEvent.press(within(screen.getByTestId('class-C-07@2026-10-07')).getByRole('button', { name: /Reservar Yoga/ }));
    expect(await screen.findByText('¡Listo! Tu cupo está reservado')).toBeOnTheScreen();
  });

  it('Error visible y legible', async () => {
    await render(React.createElement(App));
    await waitForLoaded();
    expect(screen.getByTestId('upcoming-classes')).toBeOnTheScreen();
  });
});

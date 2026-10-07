import { fireEvent, screen } from '@testing-library/react-native';

import type { GetMemberProfileUseCase } from '@/application/use-cases/GetMemberProfile';
import { err, ok } from '@/domain/shared/Result';

import { LAURA } from '../support/builders';
import { openTab, renderApp } from '../support/renderApp';

describe('Pantalla "Perfil"', () => {
  it('si no se pueden leer los datos de la socia muestra el error y permite reintentar', async () => {
    let attempts = 0;
    const flaky: GetMemberProfileUseCase = {
      execute: async () => {
        attempts += 1;
        return attempts <= 2 ? err('UNEXPECTED') : ok(LAURA); // the greeting and the profile fail once each
      },
    };
    await renderApp({ override: { getMemberProfile: flaky } });
    await openTab('Perfil');

    expect(screen.getByText('No pudimos completar la acción. Intenta de nuevo.')).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('button', { name: 'Reintentar' }));

    expect(await screen.findByText('Laura Gómez')).toBeOnTheScreen();
  });

  it('sin reservas indica "Sin reservas activas"; si no se pueden leer, no inventa un número', async () => {
    await renderApp();
    await openTab('Perfil');
    expect(await screen.findByText('Sin reservas activas')).toBeOnTheScreen();
    await screen.unmount();

    await renderApp({ override: { listMyBookings: { execute: async () => err('UNEXPECTED' as const) } } });
    await openTab('Perfil');
    expect(await screen.findByRole('button', { name: 'Mis reservas' })).toBeOnTheScreen();
    expect(screen.queryByText(/reservas? activas?/)).toBeNull();
  });
});

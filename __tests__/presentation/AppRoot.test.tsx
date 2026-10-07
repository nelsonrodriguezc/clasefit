import { render, screen, waitFor } from '@testing-library/react-native';

import { AppRoot } from '@/presentation/AppRoot';
import { SPLASH_TIMEOUT_MS } from '@/presentation/startup/StartupSplash';

import { createUseCases } from '../support/useCaseHarness';

describe('AppRoot (pantalla de inicio)', () => {
  it('por defecto espera como máximo 3 s', () => {
    expect(SPLASH_TIMEOUT_MS).toBe(3000);
  });

  it('quita la pantalla de inicio al tiempo máximo aunque el contenido no llegue (nunca bloquea la app)', async () => {
    const never = { execute: () => new Promise<never>(() => undefined) };
    await render(<AppRoot dependencies={{ ...createUseCases(), listUpcomingClasses: never }} splashTimeoutMs={200} />);
    expect(screen.getByTestId('brand-splash')).toBeOnTheScreen();

    await waitFor(() => expect(screen.queryByTestId('brand-splash')).toBeNull());
    expect(screen.getByTestId('loading')).toBeOnTheScreen();
  });
});

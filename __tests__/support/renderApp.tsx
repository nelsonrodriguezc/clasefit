import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';

import { AppRoot } from '@/presentation/AppRoot';
import type { AppDependencies } from '@/presentation/dependencies/DependenciesContext';

import type { HarnessOptions } from './useCaseHarness';
import { createUseCases } from './useCaseHarness';

type AppOptions = HarnessOptions & { override?: Partial<AppDependencies> };

/** Waits until the focused screen finished loading its data. */
export const waitForLoaded = () => waitFor(() => expect(screen.queryByTestId('loading')).toBeNull());

/** Renders the whole app (tabs + screens) with deterministic use cases, without waiting for data. */
export async function startApp(options: AppOptions = {}) {
  const harness = createUseCases(options);
  const dependencies: AppDependencies = { ...harness, ...options.override };
  await render(<AppRoot dependencies={dependencies} />);
  return harness;
}

/** Renders the whole app and waits until "Próximas clases" has its content. */
export async function renderApp(options: AppOptions = {}) {
  const harness = await startApp(options);
  await waitForLoaded();
  return harness;
}

export type TabLabel = 'Próximas clases' | 'Mis reservas' | 'Perfil';

/** The bottom tab buttons, in screen order (on iOS React Navigation labels them "<label>, tab, i of n"). */
export const tabButtons = () => screen.getAllByRole('button', { name: /, tab, \d of \d$/ });

/** The bottom tab button with this label. */
export const tabButton = (label: TabLabel) => screen.getByRole('button', { name: new RegExp(`^${label}, tab, `) });

/** Presses a bottom tab and waits for the screen data. */
export async function openTab(label: TabLabel) {
  await fireEvent.press(tabButton(label));
  await waitForLoaded();
}

import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';

import { AppRoot } from '@/presentation/AppRoot';
import type { AppDependencies } from '@/presentation/dependencies/DependenciesContext';

import type { HarnessOptions } from './useCaseHarness';
import { createUseCases } from './useCaseHarness';

/** Waits until the focused screen finished loading its data. */
export const waitForLoaded = () => waitFor(() => expect(screen.queryByTestId('loading')).toBeNull());

/** Renders the whole app (tabs + screens) with deterministic use cases. */
export async function renderApp(options: HarnessOptions & { override?: Partial<AppDependencies> } = {}) {
  const harness = createUseCases(options);
  const dependencies: AppDependencies = { ...harness, ...options.override };
  await render(<AppRoot dependencies={dependencies} />);
  await waitForLoaded();
  return harness;
}

/** Presses a bottom tab by its visible label and waits for the screen data. */
export async function openTab(label: 'Próximas clases' | 'Mis reservas') {
  const matches = screen.getAllByText(label);
  await fireEvent.press(matches[matches.length - 1]!);
  await waitForLoaded();
}

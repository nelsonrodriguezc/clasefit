import { act, renderHook, waitFor } from '@testing-library/react-native';
import type { ReactNode } from 'react';

import type { AppDependencies } from '@/presentation/dependencies/DependenciesContext';
import { DependenciesProvider } from '@/presentation/dependencies/DependenciesContext';
import { useUpcomingClasses } from '@/presentation/hooks/useUpcomingClasses';

import { createUseCases } from '../support/useCaseHarness';

// The hook is rendered without a navigator: focus effects behave like a mount effect.
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual<object>('@react-navigation/native'),
  useFocusEffect: (effect: () => void) => jest.requireActual<typeof import('react')>('react').useEffect(effect, [effect]),
}));

describe('useUpcomingClasses (view-model)', () => {
  it('ignora un segundo toque mientras la reserva anterior sigue en curso', async () => {
    const harness = createUseCases();
    const dependencies: AppDependencies = harness;
    const wrapper = ({ children }: { children: ReactNode }) => (
      <DependenciesProvider value={dependencies}>{children}</DependenciesProvider>
    );
    const { result } = await renderHook(() => useUpcomingClasses(), { wrapper });
    await waitFor(() => expect(result.current.state.status).toBe('ready'));

    await act(async () => {
      await Promise.all([result.current.book('C-07@2026-10-07'), result.current.book('C-07@2026-10-07')]);
    });

    expect(result.current.feedback).toEqual({ kind: 'success', message: '¡Listo! Tu cupo está reservado' });
    const mine = await harness.listMyBookings.execute();
    expect(mine.ok && mine.value).toHaveLength(1);
  });
});

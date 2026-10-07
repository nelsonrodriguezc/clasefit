import { render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';

import type { AppDependencies } from '@/presentation/dependencies/DependenciesContext';
import { DependenciesProvider, useDependencies } from '@/presentation/dependencies/DependenciesContext';

import { createUseCases } from '../support/useCaseHarness';

function Probe() {
  const dependencies = useDependencies();
  return <Text>{typeof dependencies.bookClass.execute}</Text>;
}

describe('DependenciesProvider', () => {
  it('entrega los casos de uso a la UI por contexto (inversión de dependencias)', async () => {
    const dependencies: AppDependencies = createUseCases();

    await render(
      <DependenciesProvider value={dependencies}>
        <Probe />
      </DependenciesProvider>,
    );

    expect(screen.getByText('function')).toBeOnTheScreen();
  });

  it('falla de forma explícita si una pantalla se usa sin el provider', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => undefined);

    await expect(render(<Probe />)).rejects.toThrow('DependenciesProvider is missing');
  });
});

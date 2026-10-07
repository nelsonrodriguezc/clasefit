import { render, screen } from '@testing-library/react-native';

import App from '../../App';
import { openTab, tabButtons, waitForLoaded } from '../support/renderApp';

const startRealApp = async () => {
  await render(<App />);
  await waitForLoaded();
};

describe('App (composición real sobre los dobles nativos)', () => {
  it('arranca con las tres pestañas, saluda a la socia del catálogo y muestra clases', async () => {
    await startRealApp();

    expect(tabButtons()).toHaveLength(3);
    expect(await screen.findByText(/^Hola, Laura/)).toBeOnTheScreen();
    expect((await screen.findAllByTestId(/^class-/)).length).toBeGreaterThan(0);
  });

  it('el perfil muestra los datos de la socia del catálogo empaquetado', async () => {
    await startRealApp();

    await openTab('Perfil');

    expect(screen.getByTestId('profile')).toBeOnTheScreen();
    expect(screen.getByText('Laura Gómez')).toBeOnTheScreen();
    expect(screen.getByText('S-0001')).toBeOnTheScreen();
  });
});

import { render, screen } from '@testing-library/react-native';

import App from '../../App';
import { waitForLoaded } from '../support/renderApp';

describe('App (composición real sobre los dobles nativos)', () => {
  it('arranca con las pestañas "Próximas clases" y "Mis reservas" y muestra clases del catálogo', async () => {
    await render(<App />);
    await waitForLoaded();

    expect(screen.getAllByText('Próximas clases').length).toBeGreaterThan(0);
    expect(screen.getByText('Mis reservas')).toBeOnTheScreen();
    expect((await screen.findAllByTestId(/^class-/)).length).toBeGreaterThan(0);
  });
});

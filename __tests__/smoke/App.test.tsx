import { render, screen } from '@testing-library/react-native';

import App from '../../App';

describe('App (smoke test de la Fase 1)', () => {
  it('renderiza la pantalla inicial', async () => {
    await render(<App />);
    expect(screen.getByText('ClaseFit')).toBeOnTheScreen();
  });
});

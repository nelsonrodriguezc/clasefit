import { fireEvent, render, screen } from '@testing-library/react-native';

import { BrandMark } from '@/presentation/components/BrandMark';
import { DateChip } from '@/presentation/components/DateChip';
import { FeedbackBanner } from '@/presentation/components/FeedbackBanner';
import { GlassCard } from '@/presentation/components/GlassCard';
import { colors, radius, spacing } from '@/presentation/theme';

describe('Primitivas visuales del shell', () => {
  it('expone tokens de diseño compartidos', () => {
    expect(colors.background).toBe('#081220');
    expect(colors.primary).toBe('#22C55E');
    expect(spacing.xxl).toBe(32);
    expect(radius.xl).toBe(22);
  });

  it('renderiza branding, tarjeta, chip y feedback en sus estados visuales', async () => {
    const onPress = jest.fn();
    await render(
      <GlassCard>
        <BrandMark compact />
        <DateChip label="Hoy" selected onPress={onPress} />
        <FeedbackBanner feedback={{ kind: 'success', message: 'Reserva realizada con éxito' }} onDismiss={jest.fn()} />
        <FeedbackBanner feedback={{ kind: 'error', message: 'No se pudo guardar' }} onDismiss={jest.fn()} />
      </GlassCard>,
    );

    expect(screen.getByText('ClaseFit')).toBeOnTheScreen();
    expect(screen.getByText('Hoy')).toBeOnTheScreen();
    expect(screen.getByText('Reserva realizada con éxito')).toBeOnTheScreen();
    expect(screen.getByText('No se pudo guardar')).toBeOnTheScreen();
    fireEvent.press(screen.getByRole('button', { name: 'Hoy' }));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});

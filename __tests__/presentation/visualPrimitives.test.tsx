import { fireEvent, render, screen } from '@testing-library/react-native';

import { Avatar } from '@/presentation/components/Avatar';
import { Badge } from '@/presentation/components/Badge';
import { BrandMark } from '@/presentation/components/BrandMark';
import { DateChip } from '@/presentation/components/DateChip';
import { FeedbackBanner } from '@/presentation/components/FeedbackBanner';
import { Notice } from '@/presentation/components/Notice';
import { PrimaryButton } from '@/presentation/components/PrimaryButton';
import { failure, success } from '@/presentation/feedback';

describe('Primitivas visuales', () => {
  it('la marca muestra el nombre ClaseFit', async () => {
    await render(<BrandMark />);

    expect(screen.getByText('ClaseFit')).toBeOnTheScreen();
  });

  it('el aviso de éxito no es una alerta; el de error sí, y ambos se pueden cerrar', async () => {
    const onDismiss = jest.fn();
    await render(
      <>
        <FeedbackBanner feedback={success('¡Listo! Tu cupo está reservado')} onDismiss={onDismiss} />
        <FeedbackBanner feedback={failure('Esta clase ya no tiene cupos.')} onDismiss={onDismiss} />
      </>,
    );

    expect(screen.getByTestId('feedback-success')).not.toHaveProp('accessibilityRole', 'alert');
    expect(screen.getByTestId('feedback-error')).toHaveProp('accessibilityRole', 'alert');
    await fireEvent.press(screen.getAllByRole('button', { name: 'Cerrar' })[0]!);
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('el chip de día informa si está seleccionado y responde al toque', async () => {
    const onPress = jest.fn();
    await render(<DateChip title="Hoy" subtitle="Mar 6 oct" selected accessibilityLabel="Hoy · mar 6 oct" onPress={onPress} />);

    const chip = screen.getByRole('button', { name: 'Hoy · mar 6 oct' });
    expect(chip).toBeSelected();
    expect(screen.getByText('Mar 6 oct')).toBeOnTheScreen();
    await fireEvent.press(chip);
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('el avatar muestra las iniciales; es decorativo salvo que tenga acción', async () => {
    const onPress = jest.fn();
    await render(
      <>
        <Avatar name="Laura Gómez" />
        <Avatar name="Marta Ruiz" accessibilityLabel="Ver perfil" onPress={onPress} />
      </>,
    );

    // The decorative one is hidden from screen readers (the name is already next to it).
    expect(screen.getByText('LG', { includeHiddenElements: true })).toBeOnTheScreen();
    expect(screen.queryByText('LG')).toBeNull();
    expect(screen.getByText('MR')).toBeOnTheScreen();
    expect(screen.getAllByRole('button')).toHaveLength(1);
    await fireEvent.press(screen.getByRole('button', { name: 'Ver perfil' }));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('el botón ocupado o deshabilitado no responde y lo anuncia', async () => {
    const onPress = jest.fn();
    await render(
      <>
        <PrimaryButton label="Reservar" busy onPress={onPress} />
        <PrimaryButton label="Cancelar reserva" variant="outlineDanger" icon="close-circle-outline" disabled onPress={onPress} />
      </>,
    );

    const busy = screen.getByRole('button', { name: 'Reservar' });
    expect(busy).toBeBusy();
    expect(busy).toBeDisabled();
    expect(screen.queryByText('Reservar')).toBeNull();
    await fireEvent.press(screen.getByRole('button', { name: 'Cancelar reserva' }));
    expect(onPress).not.toHaveBeenCalled();
  });

  it('las etiquetas y los avisos muestran su texto', async () => {
    await render(
      <>
        <Badge tone="danger" label="Llena" />
        <Notice text="Puedes cancelar hasta 2 horas antes del inicio." />
      </>,
    );

    expect(screen.getByText('Llena')).toBeOnTheScreen();
    expect(screen.getByText('Puedes cancelar hasta 2 horas antes del inicio.')).toBeOnTheScreen();
  });
});

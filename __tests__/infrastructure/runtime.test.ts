import { ExpoIdGenerator } from '@/infrastructure/ids/ExpoIdGenerator';
import { ConsoleLogger } from '@/infrastructure/logging/ConsoleLogger';
import { SystemClock } from '@/infrastructure/time/SystemClock';

describe('SystemClock', () => {
  it('devuelve el instante actual en milisegundos', () => {
    const before = Date.now();
    const now = new SystemClock().now();

    expect(now).toBeGreaterThanOrEqual(before);
    expect(now).toBeLessThanOrEqual(Date.now());
  });
});

describe('ExpoIdGenerator', () => {
  it('genera identificadores UUID v4 distintos', () => {
    const ids = new ExpoIdGenerator();
    const first = ids.next();

    expect(first).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
    expect(ids.next()).not.toBe(first);
  });
});

describe('ConsoleLogger', () => {
  const sink = () => ({ info: jest.fn(), warn: jest.fn(), error: jest.fn() });

  it('en desarrollo escribe solo el código del evento y metadatos primitivos', () => {
    const console = sink();
    new ConsoleLogger(true, console).warn('storage.integrity_failure', { reason: 'decrypt_failed' });

    expect(console.warn).toHaveBeenCalledWith('[clasefit] storage.integrity_failure', { reason: 'decrypt_failed' });
  });

  it('en desarrollo usa el nivel correspondiente para info y error', () => {
    const console = sink();
    const logger = new ConsoleLogger(true, console);

    logger.info('storage.key_created');
    logger.error('bookings.write_failed');

    expect(console.info).toHaveBeenCalledWith('[clasefit] storage.key_created', {});
    expect(console.error).toHaveBeenCalledWith('[clasefit] bookings.write_failed', {});
  });

  it('deshabilitado (producción) no escribe nada', () => {
    const console = sink();
    const logger = new ConsoleLogger(false, console);

    logger.info('storage.key_created');
    logger.warn('storage.integrity_failure');
    logger.error('bookings.write_failed');

    expect(console.info).not.toHaveBeenCalled();
    expect(console.warn).not.toHaveBeenCalled();
    expect(console.error).not.toHaveBeenCalled();
  });
});

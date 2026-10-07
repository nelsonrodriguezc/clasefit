import { err, ok } from '@/domain/shared/Result';

describe('Result', () => {
  it('ok envuelve un valor exitoso', () => {
    expect(ok(42)).toEqual({ ok: true, value: 42 });
  });

  it('err envuelve un código de error sin lanzar excepciones', () => {
    expect(err('CLASS_FULL')).toEqual({ ok: false, error: 'CLASS_FULL' });
  });
});

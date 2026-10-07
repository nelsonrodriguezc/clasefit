import { BrokenMemberSession } from '../support/fakes';
import { createUseCases } from '../support/useCaseHarness';

describe('GetMemberProfile', () => {
  it('devuelve el nombre y el número de la socia autenticada', async () => {
    const { getMemberProfile } = createUseCases({ member: { id: 'S-0042', name: 'Marta Ruiz' } });

    expect(await getMemberProfile.execute()).toEqual({ ok: true, value: { id: 'S-0042', name: 'Marta Ruiz' } });
  });

  it('si los datos de la socia son inválidos devuelve UNEXPECTED y registra solo el código del evento', async () => {
    const { getMemberProfile, logger } = createUseCases({ memberSession: new BrokenMemberSession() });

    expect(await getMemberProfile.execute()).toEqual({ ok: false, error: 'UNEXPECTED' });
    expect(logger.entries).toEqual([{ level: 'error', event: 'member.read_failed', meta: undefined }]);
  });
});

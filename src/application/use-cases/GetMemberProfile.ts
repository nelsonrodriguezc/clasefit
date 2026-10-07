import type { Member } from '@/domain/model/Member';
import type { Result } from '@/domain/shared/Result';
import { err, ok } from '@/domain/shared/Result';

import type { GetMemberProfileError } from '../errors';
import type { Logger } from '../ports/Logger';
import type { MemberSession } from '../ports/MemberSession';

export interface GetMemberProfileUseCase {
  execute(): Promise<Result<Member, GetMemberProfileError>>;
}

interface Dependencies {
  readonly memberSession: MemberSession;
  readonly logger: Logger;
}

/** Read-only: the authenticated member's name and number, for greetings and the profile. */
export class GetMemberProfile implements GetMemberProfileUseCase {
  constructor(private readonly deps: Dependencies) {}

  async execute(): Promise<Result<Member, GetMemberProfileError>> {
    const { memberSession, logger } = this.deps;
    try {
      const member = await memberSession.current();
      return ok({ id: member.id, name: member.name });
    } catch {
      logger.error('member.read_failed');
      return err('UNEXPECTED');
    }
  }
}

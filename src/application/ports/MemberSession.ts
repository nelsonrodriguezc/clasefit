import type { Member } from '@/domain/model/Member';

/** The authenticated member. In the MVP there is no login: a single, already authenticated member. */
export interface MemberSession {
  current(): Promise<Member>;
}

import type { MemberSession } from '@/application/ports/MemberSession';
import type { Member } from '@/domain/model/Member';

import { memberFileSchema } from './catalogSchema';

/** MVP member session: the single, already authenticated member comes from the bundled data. */
export class JsonMemberSession implements MemberSession {
  constructor(private readonly raw: unknown) {}

  async current(): Promise<Member> {
    const parsed = memberFileSchema.safeParse(this.raw);
    if (!parsed.success) throw new Error('Invalid member');
    return { id: parsed.data.socio.id, name: parsed.data.socio.nombre };
  }
}

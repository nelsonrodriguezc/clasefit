import { useCallback, useEffect, useState } from 'react';

import type { Result } from '@/domain/shared/Result';
import type { Member } from '@/domain/model/Member';
import type { GetMemberProfileError } from '@/application/errors';

import { useDependencies } from '../dependencies/DependenciesContext';
import { ERROR_MESSAGES } from '../messages';

export type MemberState =
  | { readonly status: 'loading' }
  | { readonly status: 'ready'; readonly member: Member }
  | { readonly status: 'error'; readonly message: string };

const toState = (result: Result<Member, GetMemberProfileError>): MemberState =>
  result.ok ? { status: 'ready', member: result.value } : { status: 'error', message: ERROR_MESSAGES[result.error] };

/** The authenticated member (name and number) for greetings and the profile; read once per screen. */
export function useMemberProfile() {
  const { getMemberProfile } = useDependencies();
  const [state, setState] = useState<MemberState>({ status: 'loading' });

  useEffect(() => {
    let active = true;
    void getMemberProfile.execute().then((result) => {
      if (active) setState(toState(result));
    });
    return () => {
      active = false;
    };
  }, [getMemberProfile]);

  const reload = useCallback(async () => setState(toState(await getMemberProfile.execute())), [getMemberProfile]);

  return { state, reload };
}

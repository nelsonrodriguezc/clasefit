import { useCallback, useState } from 'react';

import { useDependencies } from '../dependencies/DependenciesContext';
import { useRefreshOnFocus } from './useRefreshOnFocus';

/** How many upcoming bookings the member has (null while unknown or if they cannot be read). */
export function useActiveBookingsCount(): number | null {
  const { listMyBookings } = useDependencies();
  const [count, setCount] = useState<number | null>(null);

  const refresh = useCallback(async () => {
    const result = await listMyBookings.execute();
    setCount(result.ok ? result.value.length : null);
  }, [listMyBookings]);

  useRefreshOnFocus(refresh);

  return count;
}

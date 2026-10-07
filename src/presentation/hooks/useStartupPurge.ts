import { useEffect } from 'react';

import { useDependencies } from '../dependencies/DependenciesContext';

/** Data retention: removes bookings of previous days once, when the app starts. */
export function useStartupPurge(): void {
  const { purgeExpiredBookings } = useDependencies();
  useEffect(() => {
    void purgeExpiredBookings.execute();
  }, [purgeExpiredBookings]);
}

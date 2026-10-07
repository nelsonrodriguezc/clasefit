import { createContext, type ReactNode, useContext } from 'react';

import type { BookClassUseCase } from '@/application/use-cases/BookClass';
import type { CancelBookingUseCase } from '@/application/use-cases/CancelBooking';
import type { GetMemberProfileUseCase } from '@/application/use-cases/GetMemberProfile';
import type { ListMyBookingsUseCase } from '@/application/use-cases/ListMyBookings';
import type { ListUpcomingClassesUseCase } from '@/application/use-cases/ListUpcomingClasses';
import type { PurgeExpiredBookingsUseCase } from '@/application/use-cases/PurgeExpiredBookings';

/** What the UI may use: use case interfaces only, never adapters (dependency inversion). */
export interface AppDependencies {
  readonly listUpcomingClasses: ListUpcomingClassesUseCase;
  readonly bookClass: BookClassUseCase;
  readonly listMyBookings: ListMyBookingsUseCase;
  readonly cancelBooking: CancelBookingUseCase;
  readonly purgeExpiredBookings: PurgeExpiredBookingsUseCase;
  readonly getMemberProfile: GetMemberProfileUseCase;
}

const DependenciesContext = createContext<AppDependencies | null>(null);

export function DependenciesProvider({ value, children }: { value: AppDependencies; children: ReactNode }) {
  return <DependenciesContext.Provider value={value}>{children}</DependenciesContext.Provider>;
}

export function useDependencies(): AppDependencies {
  const dependencies = useContext(DependenciesContext);
  if (!dependencies) throw new Error('DependenciesProvider is missing');
  return dependencies;
}

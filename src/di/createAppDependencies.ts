import { SerialTaskQueue } from '@/application/concurrency/SerialTaskQueue';
import type { Clock } from '@/application/ports/Clock';
import type { Logger } from '@/application/ports/Logger';
import { BookClass } from '@/application/use-cases/BookClass';
import { CancelBooking } from '@/application/use-cases/CancelBooking';
import { ListMyBookings } from '@/application/use-cases/ListMyBookings';
import { ListUpcomingClasses } from '@/application/use-cases/ListUpcomingClasses';
import { PurgeExpiredBookings } from '@/application/use-cases/PurgeExpiredBookings';
import { defaultBookingRules, defaultCancellationRules } from '@/domain/rules/policies';
import rawCatalog from '@/infrastructure/catalog/clases.json';
import { JsonClassCatalog } from '@/infrastructure/catalog/JsonClassCatalog';
import { JsonMemberSession } from '@/infrastructure/catalog/JsonMemberSession';
import { ExpoIdGenerator } from '@/infrastructure/ids/ExpoIdGenerator';
import { ConsoleLogger } from '@/infrastructure/logging/ConsoleLogger';
import { AsyncStorageKeyValueStore } from '@/infrastructure/persistence/AsyncStorageKeyValueStore';
import { EncryptedKeyValueStore } from '@/infrastructure/persistence/EncryptedKeyValueStore';
import { PersistentBookingRepository } from '@/infrastructure/persistence/PersistentBookingRepository';
import { ExpoAesGcmCipher } from '@/infrastructure/security/ExpoAesGcmCipher';
import { ExpoSecretStore } from '@/infrastructure/security/ExpoSecretStore';
import { SecureStoreKeyProvider } from '@/infrastructure/security/SecureStoreKeyProvider';
import { SystemClock } from '@/infrastructure/time/SystemClock';
import type { AppDependencies } from '@/presentation/dependencies/DependenciesContext';

export interface CompositionOverrides {
  readonly clock?: Clock;
  readonly logger?: Logger;
}

/**
 * Composition root: the only place that instantiates adapters and wires them into use cases.
 * Bookings: PersistentBookingRepository → EncryptedKeyValueStore (AES-256-GCM, key in SecureStore)
 * → AsyncStorage. One TaskQueue is shared so bookings and cancellations never interleave.
 */
export function createAppDependencies(overrides: CompositionOverrides = {}): AppDependencies {
  const clock = overrides.clock ?? new SystemClock();
  const logger = overrides.logger ?? new ConsoleLogger(__DEV__);

  const catalog = new JsonClassCatalog(rawCatalog);
  const memberSession = new JsonMemberSession(rawCatalog);
  const keyProvider = new SecureStoreKeyProvider(new ExpoSecretStore(), logger);
  const encryptedStore = new EncryptedKeyValueStore(new AsyncStorageKeyValueStore(), new ExpoAesGcmCipher(keyProvider));
  const bookings = new PersistentBookingRepository(encryptedStore, logger);
  const queue = new SerialTaskQueue();
  const ids = new ExpoIdGenerator();

  return {
    listUpcomingClasses: new ListUpcomingClasses({ catalog, bookings, memberSession, clock, logger }),
    bookClass: new BookClass({
      catalog,
      bookings,
      memberSession,
      clock,
      ids,
      queue,
      logger,
      rules: defaultBookingRules(),
    }),
    listMyBookings: new ListMyBookings({ bookings, memberSession, clock, logger }),
    cancelBooking: new CancelBooking({
      bookings,
      memberSession,
      clock,
      queue,
      logger,
      rules: defaultCancellationRules(),
    }),
    purgeExpiredBookings: new PurgeExpiredBookings({ bookings, memberSession, clock, queue, logger }),
  };
}

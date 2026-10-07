/**
 * Technical events are identified only by a code. The closed union keeps free-form text (and
 * with it personal data) out of the logs; metadata is limited to primitive, non-personal values.
 */
export type LogEvent =
  | 'catalog.load_failed'
  | 'bookings.read_failed'
  | 'bookings.write_failed'
  | 'storage.integrity_failure'
  | 'storage.key_created';

export type LogMeta = Readonly<Record<string, string | number | boolean>>;

export interface Logger {
  info(event: LogEvent, meta?: LogMeta): void;
  warn(event: LogEvent, meta?: LogMeta): void;
  error(event: LogEvent, meta?: LogMeta): void;
}

import type { LogEvent, Logger, LogMeta } from '@/application/ports/Logger';

type ConsoleSink = Pick<Console, 'info' | 'warn' | 'error'>;

/**
 * Writes event codes to the console only when enabled (development builds). Production builds
 * stay silent; this is the extension point for a monitoring service that never receives PII.
 */
export class ConsoleLogger implements Logger {
  constructor(
    private readonly enabled: boolean,
    private readonly sink: ConsoleSink = console,
  ) {}

  info(event: LogEvent, meta?: LogMeta): void {
    if (this.enabled) this.sink.info(`[clasefit] ${event}`, meta ?? {});
  }

  warn(event: LogEvent, meta?: LogMeta): void {
    if (this.enabled) this.sink.warn(`[clasefit] ${event}`, meta ?? {});
  }

  error(event: LogEvent, meta?: LogMeta): void {
    if (this.enabled) this.sink.error(`[clasefit] ${event}`, meta ?? {});
  }
}

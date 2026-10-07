import type { Result } from '../shared/Result';
import { err } from '../shared/Result';
import type { CancellationAttempt, CancellationRule, CancellationViolation } from './CancellationRule';
import { PASSES } from './Rule';

/**
 * RN-04: a booking can be cancelled only while at least `minNoticeMs` remain before the class
 * starts. Exactly the minimum notice is still allowed ("hasta 2 horas antes", assumption S1).
 */
export class CancellationWindowRule implements CancellationRule {
  constructor(private readonly minNoticeMs: number) {}

  check({ booking, now }: CancellationAttempt): Result<void, CancellationViolation> {
    return booking.startsAt - now >= this.minNoticeMs ? PASSES : err('CANCELLATION_WINDOW_CLOSED');
  }
}

import type { Result } from '../shared/Result';
import { ok } from '../shared/Result';

/** A single business rule: it either lets the attempt pass or reports one violation code. */
export interface Rule<TAttempt, TViolation> {
  check(attempt: TAttempt): Result<void, TViolation>;
}

export const PASSES: Result<void, never> = ok(undefined);

/**
 * Evaluates rules in order and returns the first violation. The order of the array is the
 * priority of the messages; adding a rule never requires changing the caller (open/closed).
 */
export function evaluateRules<TAttempt, TViolation>(
  rules: readonly Rule<TAttempt, TViolation>[],
  attempt: TAttempt,
): Result<void, TViolation> {
  for (const rule of rules) {
    const outcome = rule.check(attempt);
    if (!outcome.ok) return outcome;
  }
  return PASSES;
}

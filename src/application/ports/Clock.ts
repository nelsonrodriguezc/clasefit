/** Source of "now". Injected so that every time-dependent rule is deterministic in tests. */
export interface Clock {
  /** Epoch milliseconds. */
  now(): number;
}

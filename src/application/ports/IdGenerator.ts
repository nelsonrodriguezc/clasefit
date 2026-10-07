/** Generates unique, non-guessable identifiers for new bookings. */
export interface IdGenerator {
  next(): string;
}

/** A message shown to the member after an action. */
export interface Feedback {
  readonly kind: 'success' | 'error';
  readonly message: string;
}

export const success = (message: string): Feedback => ({ kind: 'success', message });

export const failure = (message: string): Feedback => ({ kind: 'error', message });

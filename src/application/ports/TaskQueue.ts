/** Runs read-validate-write operations one at a time so concurrent requests cannot bypass the rules. */
export interface TaskQueue {
  run<T>(task: () => Promise<T>): Promise<T>;
}

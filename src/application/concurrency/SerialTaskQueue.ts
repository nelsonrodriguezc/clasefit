import type { TaskQueue } from '../ports/TaskQueue';

/** Promise-chain queue: each task starts when the previous one settled (fulfilled or rejected). */
export class SerialTaskQueue implements TaskQueue {
  private tail: Promise<unknown> = Promise.resolve();

  run<T>(task: () => Promise<T>): Promise<T> {
    const result = this.tail.then(task);
    this.tail = result.catch(() => undefined);
    return result;
  }
}

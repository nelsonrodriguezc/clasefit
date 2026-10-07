import { SerialTaskQueue } from '@/application/concurrency/SerialTaskQueue';

const tick = () => new Promise((resolve) => setTimeout(resolve, 0));

describe('SerialTaskQueue', () => {
  it('ejecuta tareas concurrentes una después de otra, en orden de llegada', async () => {
    const queue = new SerialTaskQueue();
    const log: string[] = [];
    const task = (name: string) => async () => {
      log.push(`${name}:start`);
      await tick();
      log.push(`${name}:end`);
      return name;
    };

    const results = await Promise.all([queue.run(task('A')), queue.run(task('B'))]);

    expect(results).toEqual(['A', 'B']);
    expect(log).toEqual(['A:start', 'A:end', 'B:start', 'B:end']);
  });

  it('una tarea fallida no bloquea las siguientes', async () => {
    const queue = new SerialTaskQueue();

    const failed = queue.run(async () => {
      throw new Error('boom');
    });
    const next = queue.run(async () => 'ok');

    await expect(failed).rejects.toThrow('boom');
    await expect(next).resolves.toBe('ok');
  });
});

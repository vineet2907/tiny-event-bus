import { describe, it, expect } from 'vitest';
import { createEventBus } from '@tiny-event-bus/core';
import { withReplay } from '../with-replay.js';

type TestEvents = {
  foo: string;
  bar: number;
};

describe('withReplay', () => {
  it('emit buffers event as ReplayEntry with timestamp', () => {
    const bus = createEventBus<TestEvents>();
    const replay = withReplay(bus);

    const before = Date.now();
    replay.emit('foo', 'hello');
    const after = Date.now();

    const history = replay.getHistory();
    expect(history).toHaveLength(1);
    expect(history[0].event).toBe('foo');
    expect(history[0].data).toBe('hello');
    expect(history[0].timestamp).toBeGreaterThanOrEqual(before);
    expect(history[0].timestamp).toBeLessThanOrEqual(after);
  });

  it('evicts oldest entries when buffer exceeds maxSize', () => {
    const bus = createEventBus<TestEvents>();
    const replay = withReplay(bus, { maxSize: 3 });

    replay.emit('foo', 'a');
    replay.emit('foo', 'b');
    replay.emit('foo', 'c');
    replay.emit('foo', 'd');

    const history = replay.getHistory();
    expect(history).toHaveLength(3);
    expect(history[0].data).toBe('b');
    expect(history[1].data).toBe('c');
    expect(history[2].data).toBe('d');
  });

  it('buffers event even when a handler throws', () => {
    const bus = createEventBus<TestEvents>();
    const replay = withReplay(bus);

    replay.on('foo', () => {
      throw new Error('boom');
    });
    replay.emit('foo', 'hello');

    const history = replay.getHistory();
    expect(history).toHaveLength(1);
    expect(history[0].data).toBe('hello');
  });
});

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
});

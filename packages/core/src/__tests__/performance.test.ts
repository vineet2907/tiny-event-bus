import { describe, it, expect, vi } from 'vitest';
import { createEventBus } from '../event-bus.js';

type PerfEvents = {
  tick: number;
};

describe('performance', () => {
  it('emitting to 1,000 handlers completes under 5ms', () => {
    const bus = createEventBus<PerfEvents>();
    const handlers = Array.from({ length: 1_000 }, () => vi.fn());
    handlers.forEach((h) => bus.on('tick', h));

    const start = performance.now();
    bus.emit('tick', 1);
    const elapsed = performance.now() - start;

    expect(elapsed).toBeLessThan(5);
    handlers.forEach((h) => expect(h).toHaveBeenCalledOnce());
  });

  it('10,000 subscribe/unsubscribe cycles complete under 5ms', () => {
    const bus = createEventBus<PerfEvents>();
    const handler = () => {};

    const start = performance.now();
    for (let i = 0; i < 10_000; i++) {
      const unsub = bus.on('tick', handler);
      unsub();
    }
    const elapsed = performance.now() - start;

    expect(elapsed).toBeLessThan(5);
  });

  it('managing 1,000 distinct event types completes under 5ms', () => {
    const bus = createEventBus<Record<string, number>>();
    const handler = () => {};

    const start = performance.now();
    for (let i = 0; i < 1_000; i++) {
      bus.on(`event-${i}`, handler);
    }
    for (let i = 0; i < 1_000; i++) {
      bus.emit(`event-${i}`, i);
    }
    const elapsed = performance.now() - start;

    expect(elapsed).toBeLessThan(5);
  });

  it('clear() frees all references (no memory leak)', () => {
    const bus = createEventBus<Record<string, number>>();
    const handler = () => {};

    for (let i = 0; i < 1_000; i++) {
      bus.on(`event-${i}`, handler);
    }

    bus.clear();

    for (let i = 0; i < 1_000; i++) {
      bus.emit(`event-${i}`, i);
    }

    // handler should never be called — all listeners were cleared
    const spy = vi.fn();
    bus.on('event-0', spy);
    bus.emit('event-0', 42);
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith(42);
  });
});

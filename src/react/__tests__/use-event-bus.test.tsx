import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { createEventBus } from '../../event-bus.js';
import { useEventBus } from '../use-event-bus.js';

type TestEvents = {
  ping: void;
  message: string;
};

describe('useEventBus', () => {
  it('returns emit, on, and once functions', () => {
    const bus = createEventBus<TestEvents>();
    const { result } = renderHook(() => useEventBus(bus));

    expect(result.current.emit).toBeTypeOf('function');
    expect(result.current.on).toBeTypeOf('function');
    expect(result.current.once).toBeTypeOf('function');
  });

  it('emit fires events through the bus', () => {
    const bus = createEventBus<TestEvents>();
    const handler = vi.fn();
    bus.on('message', handler);

    const { result } = renderHook(() => useEventBus(bus));
    result.current.emit('message', 'hello from hook');

    expect(handler).toHaveBeenCalledWith('hello from hook');
  });

  it('on subscribes and returns unsubscribe', () => {
    const bus = createEventBus<TestEvents>();
    const handler = vi.fn();

    const { result } = renderHook(() => useEventBus(bus));
    const unsub = result.current.on('message', handler);

    bus.emit('message', 'first');
    expect(handler).toHaveBeenCalledTimes(1);

    unsub();
    bus.emit('message', 'second');
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('returns stable references across re-renders', () => {
    const bus = createEventBus<TestEvents>();
    const { result, rerender } = renderHook(() => useEventBus(bus));

    const first = result.current;
    rerender();
    const second = result.current;

    expect(second.emit).toBe(first.emit);
    expect(second.on).toBe(first.on);
    expect(second.once).toBe(first.once);
  });
});

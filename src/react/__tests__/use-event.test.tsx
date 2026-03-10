import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import type { EventHandler } from '../../types.js';
import { createEventBus } from '../../event-bus.js';
import { useEvent } from '../use-event.js';

type TestEvents = {
  ping: void;
  message: string;
};

type HandlerProps = { handler: EventHandler<string> };

describe('useEvent', () => {
  it('calls handler when event is emitted', () => {
    const bus = createEventBus<TestEvents>();
    const handler = vi.fn();

    renderHook(() => useEvent('message', handler, bus));
    bus.emit('message', 'hello');

    expect(handler).toHaveBeenCalledWith('hello');
  });

  it('cleans up subscription on unmount', () => {
    const bus = createEventBus<TestEvents>();
    const handler = vi.fn();

    const { unmount } = renderHook(() => useEvent('message', handler, bus));
    unmount();
    bus.emit('message', 'after unmount');

    expect(handler).not.toHaveBeenCalled();
  });

  it('always calls the latest handler (no stale closure)', () => {
    const bus = createEventBus<TestEvents>();
    const first = vi.fn();
    const second = vi.fn();

    const { rerender } = renderHook(
      ({ handler }: HandlerProps) => useEvent('message', handler, bus),
      { initialProps: { handler: first } },
    );

    rerender({ handler: second });
    bus.emit('message', 'after rerender');

    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledWith('after rerender');
  });

  it('does not re-subscribe when handler changes', () => {
    const bus = createEventBus<TestEvents>();
    const onSpy = vi.spyOn(bus, 'on');

    const { rerender } = renderHook(
      ({ handler }: HandlerProps) => useEvent('message', handler, bus),
      { initialProps: { handler: vi.fn() } },
    );

    rerender({ handler: vi.fn() });
    rerender({ handler: vi.fn() });

    expect(onSpy).toHaveBeenCalledTimes(1);
  });
});

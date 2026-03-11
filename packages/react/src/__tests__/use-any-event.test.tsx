import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { createEventBus } from '@tiny-event-bus/core';
import { useAnyEvent } from '../use-any-event.js';

type TestEvents = {
  ping: void;
  message: string;
};

describe('useAnyEvent', () => {
  it('handler receives event name and data', () => {
    const bus = createEventBus<TestEvents>();
    const handler = vi.fn();

    renderHook(() => useAnyEvent(handler, bus));
    bus.emit('message', 'hello');

    expect(handler).toHaveBeenCalledWith('message', 'hello');
  });

  it('cleans up on unmount — no leak', () => {
    const bus = createEventBus<TestEvents>();
    const handler = vi.fn();

    const { unmount } = renderHook(() => useAnyEvent(handler, bus));
    unmount();
    bus.emit('message', 'after unmount');

    expect(handler).not.toHaveBeenCalled();
  });

  it('stable handler ref prevents re-subscription on re-render', () => {
    const bus = createEventBus<TestEvents>();
    const onAnySpy = vi.spyOn(bus, 'onAny');

    const { rerender } = renderHook(() => useAnyEvent(vi.fn(), bus));
    rerender();
    rerender();

    expect(onAnySpy).toHaveBeenCalledTimes(1);
  });
});

import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { createEventBus } from '../../event-bus.js';
import { createBusContext } from '../create-bus-context.js';

type TestEvents = {
  greet: string;
  count: number;
};

describe('createBusContext', () => {
  it('useEvent subscribes via context Provider', () => {
    const bus = createEventBus<TestEvents>();
    const { Provider, useEvent } = createBusContext<TestEvents>();

    const handler = vi.fn();
    renderHook(() => useEvent('greet', handler), {
      wrapper: ({ children }) => <Provider bus={bus}>{children}</Provider>,
    });

    act(() => bus.emit('greet', 'hello'));
    expect(handler).toHaveBeenCalledWith('hello');
  });

  it('useEventBus returns emit/on/once bound to context bus', () => {
    const bus = createEventBus<TestEvents>();
    const { Provider, useEventBus } = createBusContext<TestEvents>();

    const { result } = renderHook(() => useEventBus(), {
      wrapper: ({ children }) => <Provider bus={bus}>{children}</Provider>,
    });

    const handler = vi.fn();
    act(() => { result.current.on('count', handler); });
    act(() => { result.current.emit('count', 42); });
    expect(handler).toHaveBeenCalledWith(42);
  });

  it('useAnyEvent subscribes to all events via context', () => {
    const bus = createEventBus<TestEvents>();
    const { Provider, useAnyEvent } = createBusContext<TestEvents>();

    const handler = vi.fn();
    renderHook(() => useAnyEvent(handler), {
      wrapper: ({ children }) => <Provider bus={bus}>{children}</Provider>,
    });

    act(() => bus.emit('greet', 'hi'));
    act(() => bus.emit('count', 7));
    expect(handler).toHaveBeenCalledWith('greet', 'hi');
    expect(handler).toHaveBeenCalledWith('count', 7);
  });

  it('throws when useEvent is called outside Provider', () => {
    const { useEvent } = createBusContext<TestEvents>();
    expect(() => renderHook(() => useEvent('greet', vi.fn()))).toThrow(
      'must be used within a <Provider>',
    );
  });

  it('two Providers with separate buses are isolated', () => {
    const busA = createEventBus<TestEvents>();
    const busB = createEventBus<TestEvents>();
    const { Provider, useEvent } = createBusContext<TestEvents>();

    const handlerA = vi.fn();
    const handlerB = vi.fn();

    renderHook(() => useEvent('greet', handlerA), {
      wrapper: ({ children }) => <Provider bus={busA}>{children}</Provider>,
    });
    renderHook(() => useEvent('greet', handlerB), {
      wrapper: ({ children }) => <Provider bus={busB}>{children}</Provider>,
    });

    act(() => busA.emit('greet', 'from A'));
    expect(handlerA).toHaveBeenCalledWith('from A');
    expect(handlerB).not.toHaveBeenCalled();
  });

  it('unsubscribes on unmount', () => {
    const bus = createEventBus<TestEvents>();
    const { Provider, useEvent } = createBusContext<TestEvents>();

    const handler = vi.fn();
    const { unmount } = renderHook(() => useEvent('greet', handler), {
      wrapper: ({ children }) => <Provider bus={bus}>{children}</Provider>,
    });

    unmount();
    bus.emit('greet', 'after unmount');
    expect(handler).not.toHaveBeenCalled();
  });
});

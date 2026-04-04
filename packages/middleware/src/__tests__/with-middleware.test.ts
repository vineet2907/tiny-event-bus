import { describe, it, expect, vi } from 'vitest';
import { createEventBus } from '@tiny-event-bus/core';
import { withMiddleware } from '../with-middleware.js';

type TestEvents = {
  foo: string;
  bar: number;
};

describe('withMiddleware', () => {
  it('delegates on() to inner bus', () => {
    const inner = createEventBus<TestEvents>();
    const bus = withMiddleware(inner);
    const handler = vi.fn();
    bus.on('foo', handler);
    inner.emit('foo', 'hello');
    expect(handler).toHaveBeenCalledWith('hello');
  });

  it('delegates once() to inner bus', () => {
    const inner = createEventBus<TestEvents>();
    const bus = withMiddleware(inner);
    const handler = vi.fn();
    bus.once('foo', handler);
    inner.emit('foo', 'a');
    expect(handler).toHaveBeenCalledWith('a');
  });

  it('delegates emit() to inner bus', () => {
    const inner = createEventBus<TestEvents>();
    const bus = withMiddleware(inner);
    const handler = vi.fn();
    inner.on('foo', handler);
    bus.emit('foo', 'hello');
    expect(handler).toHaveBeenCalledWith('hello');
  });

  it('delegates clear() to inner bus', () => {
    const inner = createEventBus<TestEvents>();
    const bus = withMiddleware(inner);
    const handler = vi.fn();
    bus.on('foo', handler);
    bus.clear('foo');
    inner.emit('foo', 'hello');
    expect(handler).not.toHaveBeenCalled();
  });

  it('delegates hasListeners() to inner bus', () => {
    const inner = createEventBus<TestEvents>();
    const bus = withMiddleware(inner);
    expect(bus.hasListeners('foo')).toBe(false);
    bus.on('foo', vi.fn());
    expect(bus.hasListeners('foo')).toBe(true);
  });

  it('delegates listenerCount() to inner bus', () => {
    const inner = createEventBus<TestEvents>();
    const bus = withMiddleware(inner);
    expect(bus.listenerCount('foo')).toBe(0);
    bus.on('foo', vi.fn());
    bus.on('foo', vi.fn());
    expect(bus.listenerCount('foo')).toBe(2);
  });

  it('delegates eventNames() to inner bus', () => {
    const inner = createEventBus<TestEvents>();
    const bus = withMiddleware(inner);
    bus.on('foo', vi.fn());
    bus.on('bar', vi.fn());
    expect(bus.eventNames()).toEqual(expect.arrayContaining(['foo', 'bar']));
  });

  it('delegates onAny() to inner bus', () => {
    const inner = createEventBus<TestEvents>();
    const bus = withMiddleware(inner);
    const handler = vi.fn();
    bus.onAny(handler);
    inner.emit('foo', 'hello');
    expect(handler).toHaveBeenCalledWith('foo', 'hello');
  });
});

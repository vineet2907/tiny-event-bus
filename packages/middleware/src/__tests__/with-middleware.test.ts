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
    const spy = vi.spyOn(inner, 'on');
    const bus = withMiddleware(inner);
    const handler = vi.fn();
    bus.on('foo', handler);
    expect(spy).toHaveBeenCalledWith('foo', handler);
  });

  it('delegates once() to inner bus', () => {
    const inner = createEventBus<TestEvents>();
    const spy = vi.spyOn(inner, 'once');
    const bus = withMiddleware(inner);
    const handler = vi.fn();
    bus.once('foo', handler);
    expect(spy).toHaveBeenCalledWith('foo', handler);
  });

  it('delegates emit() to inner bus when no middleware', () => {
    const inner = createEventBus<TestEvents>();
    const spy = vi.spyOn(inner, 'emit');
    const bus = withMiddleware(inner);
    bus.emit('foo', 'hello');
    expect(spy).toHaveBeenCalledWith('foo', 'hello');
  });

  it('delegates clear() to inner bus', () => {
    const inner = createEventBus<TestEvents>();
    const spy = vi.spyOn(inner, 'clear');
    const bus = withMiddleware(inner);
    bus.clear('foo');
    expect(spy).toHaveBeenCalledWith('foo');
  });

  it('delegates hasListeners() to inner bus', () => {
    const inner = createEventBus<TestEvents>();
    const spy = vi.spyOn(inner, 'hasListeners');
    const bus = withMiddleware(inner);
    bus.hasListeners('foo');
    expect(spy).toHaveBeenCalledWith('foo');
  });

  it('delegates listenerCount() to inner bus', () => {
    const inner = createEventBus<TestEvents>();
    const spy = vi.spyOn(inner, 'listenerCount');
    const bus = withMiddleware(inner);
    bus.listenerCount('foo');
    expect(spy).toHaveBeenCalledWith('foo');
  });

  it('delegates eventNames() to inner bus', () => {
    const inner = createEventBus<TestEvents>();
    const spy = vi.spyOn(inner, 'eventNames');
    const bus = withMiddleware(inner);
    bus.eventNames();
    expect(spy).toHaveBeenCalled();
  });

  it('delegates onAny() to inner bus', () => {
    const inner = createEventBus<TestEvents>();
    const spy = vi.spyOn(inner, 'onAny');
    const bus = withMiddleware(inner);
    const handler = vi.fn();
    bus.onAny(handler);
    expect(spy).toHaveBeenCalledWith(handler);
  });
});

describe('emit interception', () => {
  it('calls middleware exactly once with the emitted event and data', () => {
    const inner = createEventBus<TestEvents>();
    let callCount = 0;
    let received: { event: string; data: unknown } | undefined;
    const bus = withMiddleware(inner, [({ event, data }) => { callCount++; received = { event, data }; }]);
    bus.emit('foo', 'hello');
    expect(callCount).toBe(1);
    expect(received).toEqual({ event: 'foo', data: 'hello' });
  });

  it('not calling next() blocks the event from reaching handlers', () => {
    const inner = createEventBus<TestEvents>();
    const bus = withMiddleware(inner, [() => { /* does not call next */ }]);
    const received: string[] = [];
    bus.on('foo', (data) => received.push(data));
    bus.emit('foo', 'hello');
    expect(received).toEqual([]);
  });

  it('middleware can mutate data before passing to next()', () => {
    const inner = createEventBus<TestEvents>();
    const bus = withMiddleware(inner, [({ event, data }, next) => {
      if (event === 'foo') next({ event, data: data + '!' }); // data is string here ✅
      else next({ event, data });
    }]);
    const received: string[] = [];
    bus.on('foo', (data) => received.push(data));
    bus.emit('foo', 'hello');
    expect(received).toEqual(['hello!']);
  });

  it('changing event name in next() throws an error', () => {
    const inner = createEventBus<TestEvents>();
    const bus = withMiddleware(inner, [(_payload, next) => next({ event: 'bar', data: 42 })]);
    expect(() => bus.emit('foo', 'hello')).toThrow(
      '[middleware] Cannot change event name. Expected "foo", got "bar".',
    );
  });

  it('middleware is called for each emit independently', () => {
    const inner = createEventBus<TestEvents>();
    const received: string[] = [];
    const bus = withMiddleware(inner, [(payload, next) => {
      if (payload.event === 'foo') received.push(payload.data);
      next(payload);
    }]);
    bus.emit('foo', 'first');
    bus.emit('foo', 'second');
    expect(received).toEqual(['first', 'second']);
  });

  it('multiple middlewares execute in insertion order', () => {
    const inner = createEventBus<TestEvents>();
    const order: number[] = [];
    const bus = withMiddleware(inner, [
      (payload, next) => { order.push(1); next(payload); },
      (payload, next) => { order.push(2); next(payload); },
      (payload, next) => { order.push(3); next(payload); },
    ]);
    bus.emit('foo', 'hello');
    expect(order).toEqual([1, 2, 3]);
  });

});

describe('error propagation', () => {
  it('throwing middleware propagates the error to the caller', () => {
    const inner = createEventBus<TestEvents>();
    const bus = withMiddleware(inner, [() => { throw new Error('boom'); }]);
    expect(() => bus.emit('foo', 'hello')).toThrow('boom');
  });

  it('throwing middleware stops the chain — subsequent middlewares and handlers do not run', () => {
    const inner = createEventBus<TestEvents>();
    const reached: string[] = [];
    const bus = withMiddleware(inner, [
      () => { throw new Error('boom'); },
      (payload, next) => { reached.push('mw2'); next(payload); },
    ]);
    bus.on('foo', () => reached.push('handler'));
    expect(() => bus.emit('foo', 'hello')).toThrow('boom');
    expect(reached).toEqual([]);
  });

  it('blocking mid-chain stops subsequent middlewares and handlers', () => {
    const inner = createEventBus<TestEvents>();
    const reached: string[] = [];
    const bus = withMiddleware(inner, [
      (payload, next) => { reached.push('mw1'); next(payload); },
      () => { reached.push('mw2'); /* does not call next */ },
      (payload, next) => { reached.push('mw3'); next(payload); },
    ]);
    bus.on('foo', () => reached.push('handler'));
    bus.emit('foo', 'hello');
    expect(reached).toEqual(['mw1', 'mw2']);
  });
});

import { describe, it, expect, vi } from 'vitest';
import { EventBus, createEventBus } from '../event-bus.js';

type TestEvents = {
  ping: void;
  message: string;
};

describe('EventBus', () => {
  it('calls handler when event is emitted', () => {
    const bus = new EventBus<TestEvents>();
    const handler = vi.fn();

    bus.on('ping', handler);
    bus.emit('ping', undefined as void);

    expect(handler).toHaveBeenCalledOnce();
  });

  it('passes correct data to handler', () => {
    const bus = new EventBus<TestEvents>();
    const handler = vi.fn();

    bus.on('message', handler);
    bus.emit('message', 'hello');

    expect(handler).toHaveBeenCalledWith('hello');
  });

  it('calls all handlers for the same event', () => {
    const bus = new EventBus<TestEvents>();
    const handler1 = vi.fn();
    const handler2 = vi.fn();

    bus.on('ping', handler1);
    bus.on('ping', handler2);
    bus.emit('ping', undefined as void);

    expect(handler1).toHaveBeenCalledOnce();
    expect(handler2).toHaveBeenCalledOnce();
  });

  it('does not throw when emitting with no listeners', () => {
    const bus = new EventBus<TestEvents>();

    expect(() => bus.emit('ping', undefined as void)).not.toThrow();
  });

  it('createEventBus factory returns a working instance', () => {
    const bus = createEventBus<TestEvents>();
    const handler = vi.fn();

    bus.on('message', handler);
    bus.emit('message', 'factory works');

    expect(handler).toHaveBeenCalledWith('factory works');
  });

  it('unsubscribe removes the handler', () => {
    const bus = new EventBus<TestEvents>();
    const handler = vi.fn();

    const unsub = bus.on('ping', handler);
    unsub();
    bus.emit('ping', undefined as void);

    expect(handler).not.toHaveBeenCalled();
  });

  it('calling unsubscribe twice does not throw', () => {
    const bus = new EventBus<TestEvents>();
    const unsub = bus.on('ping', vi.fn());

    unsub();
    expect(() => unsub()).not.toThrow();
  });

  it('unsubscribed handler does not fire on subsequent emits', () => {
    const bus = new EventBus<TestEvents>();
    const handler = vi.fn();

    const unsub = bus.on('ping', handler);
    bus.emit('ping', undefined as void);
    unsub();
    bus.emit('ping', undefined as void);
    bus.emit('ping', undefined as void);

    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('once fires handler exactly once then auto-unsubscribes', () => {
    const bus = new EventBus<TestEvents>();
    const handler = vi.fn();

    bus.once('message', handler);
    bus.emit('message', 'first');
    bus.emit('message', 'second');

    expect(handler).toHaveBeenCalledOnce();
    expect(handler).toHaveBeenCalledWith('first');
  });

  it('once unsubscribe cancels before first emit', () => {
    const bus = new EventBus<TestEvents>();
    const handler = vi.fn();

    const unsub = bus.once('ping', handler);
    unsub();
    bus.emit('ping', undefined as void);

    expect(handler).not.toHaveBeenCalled();
  });

  it('clear(event) removes all listeners for that event', () => {
    const bus = new EventBus<TestEvents>();
    const handler1 = vi.fn();
    const handler2 = vi.fn();
    const messageHandler = vi.fn();

    bus.on('ping', handler1);
    bus.on('ping', handler2);
    bus.on('message', messageHandler);

    bus.clear('ping');
    bus.emit('ping', undefined as void);
    bus.emit('message', 'still works');

    expect(handler1).not.toHaveBeenCalled();
    expect(handler2).not.toHaveBeenCalled();
    expect(messageHandler).toHaveBeenCalledWith('still works');
  });

  it('clear() with no args removes all listeners for all events', () => {
    const bus = new EventBus<TestEvents>();
    const pingHandler = vi.fn();
    const messageHandler = vi.fn();

    bus.on('ping', pingHandler);
    bus.on('message', messageHandler);

    bus.clear();
    bus.emit('ping', undefined as void);
    bus.emit('message', 'gone');

    expect(pingHandler).not.toHaveBeenCalled();
    expect(messageHandler).not.toHaveBeenCalled();
  });

  it('throwing handler does not prevent other handlers from firing', () => {
    const bus = new EventBus<TestEvents>();
    const badHandler = vi.fn(() => {
      throw new Error('boom');
    });
    const goodHandler = vi.fn();

    bus.on('ping', badHandler);
    bus.on('ping', goodHandler);
    bus.emit('ping', undefined as void);

    expect(badHandler).toHaveBeenCalledOnce();
    expect(goodHandler).toHaveBeenCalledOnce();
  });

  it('emit does not throw even when a handler throws', () => {
    const bus = new EventBus<TestEvents>();
    bus.on('ping', () => {
      throw new Error('boom');
    });

    expect(() => bus.emit('ping', undefined as void)).not.toThrow();
  });

  it('handler added mid-emit does not fire in current cycle', () => {
    const bus = new EventBus<TestEvents>();
    const lateHandler = vi.fn();

    bus.on('ping', () => {
      bus.on('ping', lateHandler);
    });
    bus.emit('ping', undefined as void);

    expect(lateHandler).not.toHaveBeenCalled();

    bus.emit('ping', undefined as void);
    expect(lateHandler).toHaveBeenCalledOnce();
  });

  it('handler removed mid-emit still fires in current cycle', () => {
    const bus = new EventBus<TestEvents>();
    const handler2 = vi.fn();
    let unsub2: () => void;

    bus.on('ping', () => {
      unsub2();
    });
    unsub2 = bus.on('ping', handler2);

    bus.emit('ping', undefined as void);

    expect(handler2).toHaveBeenCalledOnce();
  });

  it('re-entrant emit does not cause infinite loop', () => {
    const bus = new EventBus<TestEvents>();
    let count = 0;

    bus.on('ping', () => {
      count++;
      if (count === 1) {
        bus.emit('ping', undefined as void);
      }
    });
    bus.emit('ping', undefined as void);

    expect(count).toBe(2);
  });
});

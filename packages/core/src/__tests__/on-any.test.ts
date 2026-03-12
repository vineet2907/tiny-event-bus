import { describe, it, expect, vi } from 'vitest';
import { EventBus } from '../event-bus.js';

type TestEvents = {
  ping: void;
  message: string;
};

describe('onAny', () => {
  it('handler receives event name and data on emit', () => {
    const bus = new EventBus<TestEvents>();
    const handler = vi.fn();

    bus.onAny(handler);
    bus.emit('message', 'hello');

    expect(handler).toHaveBeenCalledWith('message', 'hello');
  });

  it('fires for all event types', () => {
    const bus = new EventBus<TestEvents>();
    const handler = vi.fn();

    bus.onAny(handler);
    bus.emit('ping', undefined as void);
    bus.emit('message', 'hi');

    expect(handler).toHaveBeenCalledTimes(2);
    expect(handler).toHaveBeenCalledWith('ping', undefined);
    expect(handler).toHaveBeenCalledWith('message', 'hi');
  });

  it('unsubscribe removes the handler', () => {
    const bus = new EventBus<TestEvents>();
    const handler = vi.fn();

    const unsub = bus.onAny(handler);
    unsub();
    bus.emit('message', 'gone');

    expect(handler).not.toHaveBeenCalled();
  });

  it('calling unsubscribe twice does not throw', () => {
    const bus = new EventBus<TestEvents>();
    const unsub = bus.onAny(vi.fn());

    unsub();
    expect(() => unsub()).not.toThrow();
  });

  it('multiple onAny handlers all fire', () => {
    const bus = new EventBus<TestEvents>();
    const handler1 = vi.fn();
    const handler2 = vi.fn();

    bus.onAny(handler1);
    bus.onAny(handler2);
    bus.emit('message', 'both');

    expect(handler1).toHaveBeenCalledWith('message', 'both');
    expect(handler2).toHaveBeenCalledWith('message', 'both');
  });

  it('onAny handler error does not break other handlers', () => {
    const bus = new EventBus<TestEvents>();
    const badHandler = vi.fn(() => {
      throw new Error('boom');
    });
    const goodHandler = vi.fn();

    bus.onAny(badHandler);
    bus.onAny(goodHandler);
    bus.emit('ping', undefined as void);

    expect(badHandler).toHaveBeenCalledOnce();
    expect(goodHandler).toHaveBeenCalledOnce();
  });

  it('onAny handler error does not break event-specific handlers', () => {
    const bus = new EventBus<TestEvents>();
    const anyHandler = vi.fn(() => {
      throw new Error('boom');
    });
    const specificHandler = vi.fn();

    bus.on('message', specificHandler);
    bus.onAny(anyHandler);
    bus.emit('message', 'hello');

    expect(specificHandler).toHaveBeenCalledWith('hello');
    expect(anyHandler).toHaveBeenCalledOnce();
  });

  it('clear() removes onAny handlers', () => {
    const bus = new EventBus<TestEvents>();
    const handler = vi.fn();

    bus.onAny(handler);
    bus.clear();
    bus.emit('message', 'gone');

    expect(handler).not.toHaveBeenCalled();
  });

  it('clear(event) does NOT remove onAny handlers', () => {
    const bus = new EventBus<TestEvents>();
    const handler = vi.fn();

    bus.onAny(handler);
    bus.clear('message');
    bus.emit('message', 'still here');

    expect(handler).toHaveBeenCalledWith('message', 'still here');
  });

  it('listenerCount() includes onAny handlers in total', () => {
    const bus = new EventBus<TestEvents>();
    bus.on('ping', vi.fn());
    bus.onAny(vi.fn());

    expect(bus.listenerCount()).toBe(2);
  });

  it('listenerCount(event) does NOT include onAny handlers', () => {
    const bus = new EventBus<TestEvents>();
    bus.on('ping', vi.fn());
    bus.onAny(vi.fn());

    expect(bus.listenerCount('ping')).toBe(1);
  });

  it('onAny handler added mid-emit does not fire in current cycle', () => {
    const bus = new EventBus<TestEvents>();
    const lateHandler = vi.fn();

    bus.onAny(() => {
      bus.onAny(lateHandler);
    });
    bus.emit('ping', undefined as void);

    expect(lateHandler).not.toHaveBeenCalled();

    bus.emit('ping', undefined as void);
    expect(lateHandler).toHaveBeenCalledOnce();
  });

  it('onAny fires after event-specific handlers', () => {
    const bus = new EventBus<TestEvents>();
    const order: string[] = [];

    bus.on('message', () => order.push('specific'));
    bus.onAny(() => order.push('any'));
    bus.emit('message', 'hello');

    expect(order).toEqual(['specific', 'any']);
  });
});

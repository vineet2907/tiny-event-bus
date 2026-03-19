import { describe, it, expect, vi } from 'vitest';
import { createEventBus } from '../event-bus.js';

type TestEvents = {
  ping: void;
  message: string;
};

describe('introspection', () => {
  it('hasListeners returns false for event with no subscribers', () => {
    const bus = createEventBus<TestEvents>();

    expect(bus.hasListeners('ping')).toBe(false);
  });

  it('hasListeners returns true after on(), false after unsubscribe', () => {
    const bus = createEventBus<TestEvents>();
    const unsub = bus.on('ping', vi.fn());

    expect(bus.hasListeners('ping')).toBe(true);

    unsub();
    expect(bus.hasListeners('ping')).toBe(false);
  });

  it('hasListeners returns false after clear(event)', () => {
    const bus = createEventBus<TestEvents>();
    bus.on('ping', vi.fn());
    bus.on('ping', vi.fn());

    bus.clear('ping');
    expect(bus.hasListeners('ping')).toBe(false);
  });

  it('listenerCount(event) returns correct count after multiple on() calls', () => {
    const bus = createEventBus<TestEvents>();
    bus.on('ping', vi.fn());
    bus.on('ping', vi.fn());
    bus.on('ping', vi.fn());

    expect(bus.listenerCount('ping')).toBe(3);
  });

  it('listenerCount(event) decrements after unsubscribe', () => {
    const bus = createEventBus<TestEvents>();
    const unsub1 = bus.on('ping', vi.fn());
    bus.on('ping', vi.fn());

    expect(bus.listenerCount('ping')).toBe(2);

    unsub1();
    expect(bus.listenerCount('ping')).toBe(1);
  });

  it('listenerCount() with no arg returns total across all events', () => {
    const bus = createEventBus<TestEvents>();
    bus.on('ping', vi.fn());
    bus.on('ping', vi.fn());
    bus.on('message', vi.fn());

    expect(bus.listenerCount()).toBe(3);
  });

  it('listenerCount() returns 0 after clear()', () => {
    const bus = createEventBus<TestEvents>();
    bus.on('ping', vi.fn());
    bus.on('message', vi.fn());

    bus.clear();
    expect(bus.listenerCount()).toBe(0);
  });

  it('eventNames() returns empty array on fresh bus', () => {
    const bus = createEventBus<TestEvents>();

    expect(bus.eventNames()).toEqual([]);
  });

  it('eventNames() returns only events with active listeners', () => {
    const bus = createEventBus<TestEvents>();
    bus.on('ping', vi.fn());
    bus.on('message', vi.fn());

    expect(bus.eventNames()).toEqual(['ping', 'message']);
  });

  it('eventNames() excludes event after all its listeners unsubscribe', () => {
    const bus = createEventBus<TestEvents>();
    const unsub1 = bus.on('ping', vi.fn());
    const unsub2 = bus.on('ping', vi.fn());
    bus.on('message', vi.fn());

    unsub1();
    unsub2();

    expect(bus.eventNames()).toEqual(['message']);
  });

  it('once handler is reflected in count before firing, absent after', () => {
    const bus = createEventBus<TestEvents>();
    bus.once('ping', vi.fn());

    expect(bus.listenerCount('ping')).toBe(1);
    expect(bus.hasListeners('ping')).toBe(true);

    bus.emit('ping', undefined as void);

    expect(bus.listenerCount('ping')).toBe(0);
    expect(bus.hasListeners('ping')).toBe(false);
    expect(bus.eventNames()).toEqual([]);
  });
});

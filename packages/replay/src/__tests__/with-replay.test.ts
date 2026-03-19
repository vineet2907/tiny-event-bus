import { describe, it, expect, vi } from 'vitest';
import { createEventBus } from '@tiny-event-bus/core';
import { withReplay } from '../with-replay.js';

type TestEvents = {
  foo: string;
  bar: number;
};

describe('withReplay', () => {
  it('emit buffers event as ReplayEntry with timestamp', () => {
    const bus = createEventBus<TestEvents>();
    const replay = withReplay(bus);

    const before = Date.now();
    replay.emit('foo', 'hello');
    const after = Date.now();

    const history = replay.getHistory();
    expect(history).toHaveLength(1);
    expect(history[0].event).toBe('foo');
    expect(history[0].data).toBe('hello');
    expect(history[0].timestamp).toBeGreaterThanOrEqual(before);
    expect(history[0].timestamp).toBeLessThanOrEqual(after);
  });

  it('evicts oldest entries when buffer exceeds maxSize', () => {
    const bus = createEventBus<TestEvents>();
    const replay = withReplay(bus, { maxSize: 3 });

    replay.emit('foo', 'a');
    replay.emit('foo', 'b');
    replay.emit('foo', 'c');
    replay.emit('foo', 'd');

    const history = replay.getHistory();
    expect(history).toHaveLength(3);
    expect(history[0].data).toBe('b');
    expect(history[1].data).toBe('c');
    expect(history[2].data).toBe('d');
  });

  it('buffers event even when a handler throws', () => {
    const bus = createEventBus<TestEvents>();
    const replay = withReplay(bus);

    replay.on('foo', () => {
      throw new Error('boom');
    });
    replay.emit('foo', 'hello');

    const history = replay.getHistory();
    expect(history).toHaveLength(1);
    expect(history[0].data).toBe('hello');
  });

  it('on() replays buffered events for that event type to new subscriber', () => {
    const bus = createEventBus<TestEvents>();
    const replay = withReplay(bus);

    replay.emit('foo', 'a');
    replay.emit('bar', 42);
    replay.emit('foo', 'b');

    const received: string[] = [];
    replay.on('foo', (data) => received.push(data));

    expect(received).toEqual(['a', 'b']);
  });

  it('once() replays first buffered event and is satisfied', () => {
    const bus = createEventBus<TestEvents>();
    const replay = withReplay(bus);

    replay.emit('foo', 'a');
    replay.emit('foo', 'b');

    const received: string[] = [];
    replay.once('foo', (data) => received.push(data));

    // Should only get the first buffered event
    expect(received).toEqual(['a']);

    // Future emits should not reach this handler (it's satisfied)
    replay.emit('foo', 'c');
    expect(received).toEqual(['a']);
  });

  it('onAny() replays all buffered events in chronological order', () => {
    const bus = createEventBus<TestEvents>();
    const replay = withReplay(bus);

    replay.emit('foo', 'a');
    replay.emit('bar', 42);
    replay.emit('foo', 'b');

    const received: Array<{ event: string; data: unknown }> = [];
    replay.onAny((event, data) =>
      received.push({ event: String(event), data }),
    );

    expect(received).toEqual([
      { event: 'foo', data: 'a' },
      { event: 'bar', data: 42 },
      { event: 'foo', data: 'b' },
    ]);
  });

  it('autoReplay: false disables replay on on(), once(), and onAny()', () => {
    const bus = createEventBus<TestEvents>();
    const replay = withReplay(bus, { autoReplay: false });

    replay.emit('foo', 'a');
    replay.emit('bar', 42);

    const onReceived: string[] = [];
    replay.on('foo', (data) => onReceived.push(data));
    expect(onReceived).toEqual([]);

    const onceReceived: string[] = [];
    replay.once('foo', (data) => onceReceived.push(data));
    expect(onceReceived).toEqual([]);

    const anyReceived: Array<{ event: string; data: unknown }> = [];
    replay.onAny((event, data) =>
      anyReceived.push({ event: String(event), data }),
    );
    expect(anyReceived).toEqual([]);

    // Events still buffered for getHistory
    expect(replay.getHistory()).toHaveLength(2);
  });

  it('getHistory(event) returns only entries for that event type', () => {
    const bus = createEventBus<TestEvents>();
    const replay = withReplay(bus);

    replay.emit('foo', 'a');
    replay.emit('bar', 42);
    replay.emit('foo', 'b');

    const fooHistory = replay.getHistory('foo');
    expect(fooHistory).toEqual([
      { event: 'foo', data: 'a', timestamp: expect.any(Number) },
      { event: 'foo', data: 'b', timestamp: expect.any(Number) },
    ]);

    const barHistory = replay.getHistory('bar');
    expect(barHistory).toEqual([
      { event: 'bar', data: 42, timestamp: expect.any(Number) },
    ]);
  });

  it('clearHistory(event) removes only entries for that event type', () => {
    const bus = createEventBus<TestEvents>();
    const replay = withReplay(bus);

    replay.emit('foo', 'a');
    replay.emit('bar', 42);
    replay.emit('foo', 'b');

    replay.clearHistory('foo');

    expect(replay.getHistory()).toEqual([
      { event: 'bar', data: 42, timestamp: expect.any(Number) },
    ]);
  });

  it('clear() removes listeners but does NOT clear history', () => {
    const bus = createEventBus<TestEvents>();
    const replay = withReplay(bus);

    replay.emit('foo', 'a');
    replay.emit('bar', 42);

    replay.clear();

    expect(replay.getHistory()).toHaveLength(2);
  });

  it('getHistory() returns all entries as a defensive copy', () => {
    const bus = createEventBus<TestEvents>();
    const replay = withReplay(bus);

    replay.emit('foo', 'a');
    replay.emit('bar', 42);

    const history = replay.getHistory();
    expect(history).toHaveLength(2);
    expect(history[0]).toEqual({ event: 'foo', data: 'a', timestamp: expect.any(Number) });
    expect(history[1]).toEqual({ event: 'bar', data: 42, timestamp: expect.any(Number) });

    // Mutating returned array does not affect buffer
    history.length = 0;
    expect(replay.getHistory()).toHaveLength(2);
  });

  it('clearHistory() removes all entries', () => {
    const bus = createEventBus<TestEvents>();
    const replay = withReplay(bus);

    replay.emit('foo', 'a');
    replay.emit('bar', 42);
    expect(replay.getHistory()).toHaveLength(2);

    replay.clearHistory();
    expect(replay.getHistory()).toHaveLength(0);
  });

  it('getHistory(event) returns empty array when event not in buffer', () => {
    const bus = createEventBus<TestEvents>();
    const replay = withReplay(bus);

    replay.emit('foo', 'a');

    expect(replay.getHistory('bar')).toEqual([]);
  });

  it('clearHistory(event) is a no-op when event not in buffer', () => {
    const bus = createEventBus<TestEvents>();
    const replay = withReplay(bus);

    replay.emit('foo', 'a');

    replay.clearHistory('bar');
    expect(replay.getHistory()).toHaveLength(1);
  });

  it('hasListeners() delegates to inner bus', () => {
    const bus = createEventBus<TestEvents>();
    const spy = vi.spyOn(bus, 'hasListeners');
    const replay = withReplay(bus);

    replay.hasListeners('foo');
    expect(spy).toHaveBeenCalledWith('foo');
  });

  it('listenerCount() delegates to inner bus', () => {
    const bus = createEventBus<TestEvents>();
    const spy = vi.spyOn(bus, 'listenerCount');
    const replay = withReplay(bus);

    replay.listenerCount('foo');
    expect(spy).toHaveBeenCalledWith('foo');
  });

  it('eventNames() delegates to inner bus', () => {
    const bus = createEventBus<TestEvents>();
    const spy = vi.spyOn(bus, 'eventNames');
    const replay = withReplay(bus);

    replay.eventNames();
    expect(spy).toHaveBeenCalled();
  });

  it('on() replay swallows handler errors', () => {
    const bus = createEventBus<TestEvents>();
    const replay = withReplay(bus);

    replay.emit('foo', 'a');
    replay.emit('foo', 'b');

    const received: string[] = [];
    replay.on('foo', (data) => {
      if (data === 'a') throw new Error('boom');
      received.push(data);
    });

    expect(received).toEqual(['b']);
  });

  it('once() replay swallows handler error', () => {
    const bus = createEventBus<TestEvents>();
    const replay = withReplay(bus);

    replay.emit('foo', 'a');

    expect(() => {
      replay.once('foo', () => {
        throw new Error('boom');
      });
    }).not.toThrow();
  });

  it('onAny() replay swallows handler errors', () => {
    const bus = createEventBus<TestEvents>();
    const replay = withReplay(bus);

    replay.emit('foo', 'a');
    replay.emit('bar', 42);

    const received: Array<{ event: string; data: unknown }> = [];
    replay.onAny((event, data) => {
      if (event === 'foo') throw new Error('boom');
      received.push({ event: String(event), data });
    });

    expect(received).toEqual([{ event: 'bar', data: 42 }]);
  });
});

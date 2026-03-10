import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, renderHook } from '@testing-library/react';
import { createElement } from 'react';
import { createEventBus } from '../../event-bus.js';
import { useEvent } from '../use-event.js';
import { useEventBus } from '../use-event-bus.js';

type AppEvents = {
  'toast:show': string;
  'counter:increment': number;
};

describe('integration', () => {
  it('producer component communicates with consumer component', () => {
    const bus = createEventBus<AppEvents>();
    const handler = vi.fn();

    function Consumer() {
      useEvent('toast:show', handler, bus);
      return null;
    }

    function Producer() {
      const { emit } = useEventBus(bus);
      return createElement('button', {
        onClick: () => emit('toast:show', 'hello'),
      }, 'Send');
    }

    render(createElement('div', null,
      createElement(Producer),
      createElement(Consumer),
    ));

    fireEvent.click(screen.getByText('Send'));

    expect(handler).toHaveBeenCalledWith('hello');
  });

  it('multiple consumers all receive the same event', () => {
    const bus = createEventBus<AppEvents>();
    const handlerA = vi.fn();
    const handlerB = vi.fn();
    const handlerC = vi.fn();

    function ConsumerA() { useEvent('toast:show', handlerA, bus); return null; }
    function ConsumerB() { useEvent('toast:show', handlerB, bus); return null; }
    function ConsumerC() { useEvent('toast:show', handlerC, bus); return null; }

    render(createElement('div', null,
      createElement(ConsumerA),
      createElement(ConsumerB),
      createElement(ConsumerC),
    ));

    bus.emit('toast:show', 'broadcast');

    expect(handlerA).toHaveBeenCalledWith('broadcast');
    expect(handlerB).toHaveBeenCalledWith('broadcast');
    expect(handlerC).toHaveBeenCalledWith('broadcast');
  });

  it('unmounting one consumer does not affect others', () => {
    const bus = createEventBus<AppEvents>();
    const stayHandler = vi.fn();
    const leaveHandler = vi.fn();

    function Stayer() { useEvent('toast:show', stayHandler, bus); return null; }
    function Leaver() { useEvent('toast:show', leaveHandler, bus); return null; }

    const { rerender } = render(createElement('div', null,
      createElement(Stayer),
      createElement(Leaver),
    ));

    rerender(createElement('div', null,
      createElement(Stayer),
    ));

    bus.emit('toast:show', 'after unmount');

    expect(stayHandler).toHaveBeenCalledWith('after unmount');
    expect(leaveHandler).not.toHaveBeenCalled();
  });

  it('different events are isolated from each other', () => {
    const bus = createEventBus<AppEvents>();
    const toastHandler = vi.fn();
    const counterHandler = vi.fn();

    function ToastConsumer() { useEvent('toast:show', toastHandler, bus); return null; }
    function CounterConsumer() { useEvent('counter:increment', counterHandler, bus); return null; }

    render(createElement('div', null,
      createElement(ToastConsumer),
      createElement(CounterConsumer),
    ));

    bus.emit('toast:show', 'hello');

    expect(toastHandler).toHaveBeenCalledWith('hello');
    expect(counterHandler).not.toHaveBeenCalled();
  });

  it('separate bus instances are fully isolated', () => {
    const busA = createEventBus<AppEvents>();
    const busB = createEventBus<AppEvents>();
    const handlerA = vi.fn();
    const handlerB = vi.fn();

    function ConsumerA() { useEvent('toast:show', handlerA, busA); return null; }
    function ConsumerB() { useEvent('toast:show', handlerB, busB); return null; }

    render(createElement('div', null,
      createElement(ConsumerA),
      createElement(ConsumerB),
    ));

    busA.emit('toast:show', 'only A');

    expect(handlerA).toHaveBeenCalledWith('only A');
    expect(handlerB).not.toHaveBeenCalled();
  });

  it('once subscriber and regular subscriber coexist correctly', () => {
    const bus = createEventBus<AppEvents>();
    const onceHandler = vi.fn();
    const regularHandler = vi.fn();

    const { result } = renderHook(() => useEventBus(bus));

    result.current.once('toast:show', onceHandler);
    result.current.on('toast:show', regularHandler);

    bus.emit('toast:show', 'first');
    bus.emit('toast:show', 'second');

    expect(onceHandler).toHaveBeenCalledTimes(1);
    expect(onceHandler).toHaveBeenCalledWith('first');
    expect(regularHandler).toHaveBeenCalledTimes(2);
  });

  it('useEventBus.emit delivers to useEvent consumers across components', () => {
    const bus = createEventBus<AppEvents>();
    const handler = vi.fn();
    let emitFromHook: (event: 'toast:show', data: string) => void;

    function Producer() {
      const { emit } = useEventBus(bus);
      emitFromHook = emit;
      return null;
    }

    function Consumer() {
      useEvent('toast:show', handler, bus);
      return null;
    }

    render(createElement('div', null,
      createElement(Producer),
      createElement(Consumer),
    ));

    emitFromHook!('toast:show', 'from useEventBus');

    expect(handler).toHaveBeenCalledWith('from useEventBus');
  });

  it('rapid mount/unmount cycles do not leak subscriptions', () => {
    const bus = createEventBus<AppEvents>();
    const handler = vi.fn();

    function Consumer() { useEvent('toast:show', handler, bus); return null; }

    const { unmount, rerender } = render(createElement(Consumer));

    for (let i = 0; i < 10; i++) {
      rerender(createElement(Consumer));
    }
    unmount();

    bus.emit('toast:show', 'after cycles');

    expect(handler).not.toHaveBeenCalled();
  });
});

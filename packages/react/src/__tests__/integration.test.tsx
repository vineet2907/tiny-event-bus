import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, renderHook } from '@testing-library/react';
import { createEventBus } from '@tiny-event-bus/core';
import { useEvent } from '../use-event.js';
import { useEventBus } from '../use-event-bus.js';
import { useAnyEvent } from '../use-any-event.js';
import { createBusContext } from '../create-bus-context.js';

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
      return <button onClick={() => emit('toast:show', 'hello')}>Send</button>;
    }

    render(<div><Producer /><Consumer /></div>);

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

    render(<div><ConsumerA /><ConsumerB /><ConsumerC /></div>);

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

    const { rerender } = render(<div><Stayer /><Leaver /></div>);

    rerender(<div><Stayer /></div>);

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

    render(<div><ToastConsumer /><CounterConsumer /></div>);

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

    render(<div><ConsumerA /><ConsumerB /></div>);

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

    render(<div><Producer /><Consumer /></div>);

    emitFromHook!('toast:show', 'from useEventBus');

    expect(handler).toHaveBeenCalledWith('from useEventBus');
  });

  it('rapid mount/unmount cycles do not leak subscriptions', () => {
    const bus = createEventBus<AppEvents>();
    const handler = vi.fn();

    function Consumer() { useEvent('toast:show', handler, bus); return null; }

    const { unmount, rerender } = render(<Consumer />);

    for (let i = 0; i < 10; i++) {
      rerender(<Consumer />);
    }
    unmount();

    bus.emit('toast:show', 'after cycles');

    expect(handler).not.toHaveBeenCalled();
  });

  it('useAnyEvent and useEvent both fire on the same emit', () => {
    const bus = createEventBus<AppEvents>();
    const specificHandler = vi.fn();
    const anyHandler = vi.fn();

    function SpecificConsumer() { useEvent('toast:show', specificHandler, bus); return null; }
    function AnyConsumer() { useAnyEvent(anyHandler, bus); return null; }

    render(<div><SpecificConsumer /><AnyConsumer /></div>);

    bus.emit('toast:show', 'dual');

    expect(specificHandler).toHaveBeenCalledWith('dual');
    expect(anyHandler).toHaveBeenCalledWith('toast:show', 'dual');
  });

  it('createBusContext Provider isolates from direct-bus consumers', () => {
    const contextBus = createEventBus<AppEvents>();
    const directBus = createEventBus<AppEvents>();
    const { Provider, useEvent: useCtxEvent } = createBusContext<AppEvents>();

    const contextHandler = vi.fn();
    const directHandler = vi.fn();

    function ContextConsumer() { useCtxEvent('toast:show', contextHandler); return null; }
    function DirectConsumer() { useEvent('toast:show', directHandler, directBus); return null; }

    render(
      <div>
        <Provider bus={contextBus}><ContextConsumer /></Provider>
        <DirectConsumer />
      </div>
    );

    contextBus.emit('toast:show', 'from context');

    expect(contextHandler).toHaveBeenCalledWith('from context');
    expect(directHandler).not.toHaveBeenCalled();
  });
});

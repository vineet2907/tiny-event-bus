# Type System

How types flow through the tiny-event-bus packages.

## Layer 1 — Your Events

You define an event map: a plain object type where each key is an event name and each value is the payload type.

```ts
type ShopEvents = {
  'cart:add': { productId: string; quantity: number };
  'toast:show': { message: string };
};
```

Everything else is derived from this single type.

## Layer 2 — Core Types

**`EventMap`** — Base constraint. All event maps must be `Record<string, any>`. Your `ShopEvents` satisfies this automatically.

**`EventKey<T>`** — Shorthand for `keyof T & string`. The `& string` is needed because TypeScript's `keyof` can include `number | symbol`, but event names are always strings. Used everywhere a method accepts an event name.

**`EventHandler<T[K]>`** — A callback `(data: T[K]) => void`. When you subscribe to `'cart:add'`, the handler receives `{ productId: string; quantity: number }` — fully typed.

**`IEventBus<T>`** — The interface returned by `createEventBus<T>()`. Every method is generic over `K extends EventKey<T>`, so the event name and payload are always type-checked:

```ts
const bus = createEventBus<ShopEvents>();

bus.emit('cart:add', { productId: 'abc', quantity: 1 }); // ✅
bus.emit('cart:add', { wrong: true }); // ❌ type error
bus.emit('nonexistent', {}); // ❌ type error
```

## Layer 3 — Replay Plugin

`withReplay(bus)` wraps an `IEventBus<T>` and returns a `ReplayBus<T>` that adds two methods:

- `getHistory(event?)` — returns `ReplayEntry<T>[]` (each entry has typed `event` and `data`)
- `clearHistory(event?)` — clears the buffer

The original `emit`, `on`, `once`, etc. are all preserved with full typing.

## Layer 4 — React Hooks

**`useEvent(event, handler, bus)`** — Subscribes to one event. Generic over `<T, K>`, so the handler is fully typed.

**`useAnyEvent(handler, bus)`** — Subscribes to all events. Handler receives `(event: EventKey<T>, data)`.

**`useEventBus(bus)`** — Returns `BusMethods<B>`: a mapped type that extracts every function from the bus object. Works with plain buses and decorated buses alike.

**`createBusContext<T>()`** — Returns a React context `{ Provider, useEvent, useEventBus, useAnyEvent }` pre-typed to `T`. No bus argument needed in hooks — they read from context.

## Why `useEventBus` Uses `B extends IEventBus<any>`

You might expect `useEventBus<B extends IEventBus<EventMap>>`, but `IEventBus<T>` is **invariant** in `T` — the type parameter `T` appears in both input positions (like `emit(event, data: T[K])`) and output positions (like handler callbacks). This means `IEventBus<ShopEvents>` is **not** assignable to `IEventBus<EventMap>`, even though `ShopEvents` extends `EventMap`.

Using `IEventBus<any>` sidesteps invariance because `any` is both a top and bottom type — every `IEventBus<T>` is assignable to `IEventBus<any>`. The constraint still ensures only bus objects are accepted (not arbitrary objects), and the `BusMethods<B>` mapped type preserves full static typing for every method on whatever bus you pass in — no type information is lost.

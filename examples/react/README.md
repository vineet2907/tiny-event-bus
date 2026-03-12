# Shopping Cart Demo — State vs Event Bus

A live React app showing **when to use React state** vs **when to use an event bus**, side by side.

## The Core Idea

Clicking **"Add to Cart"** does two things simultaneously:

1. **React state** → `addItem()` updates the cart → CartSidebar re-renders with the new item
2. **Event bus** → `emit('toast:show', ...)` → toast appears, analytics logs — no re-render triggered

Same user action, two paths, zero coupling between them.

## When to Use What

| Scenario                       | Use                   | Why                                                           |
| ------------------------------ | --------------------- | ------------------------------------------------------------- |
| Cart items, totals, quantities | React state (Context) | Data drives the UI — must trigger re-renders                  |
| Toast notifications            | Event bus             | Ephemeral signal — producer doesn't know or care who shows it |
| Analytics tracking             | Event bus (onAny)     | Catch-all listener logs every event — no explicit emit needed |
| Search modal toggle (⌘K)       | Event bus             | DOM event → bus signal → any subscriber can respond           |
| Theme, user preferences        | React state (Context) | Shared data consumed by many components for rendering         |

**Rule of thumb**: if a component needs to _render_ data, use React state. If something needs to _react to a signal_, use the event bus.

## Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│  App                                                             │
│                                                                  │
│  <ShopBusProvider bus={bus}>   ← scoped context via              │
│                                  createBusContext<ShopEvents>()  │
│                                                                  │
│  ┌──── STATE PATH ────┐     ┌──── BUS PATH ─────────────────┐    │
│  │                     │    │                               │    │
│  │  CartContext         │   │  bus (createEventBus)         │    │
│  │  ├─ items[]         │    │  ├─ toast:show                │    │
│  │  ├─ addItem()       │    │  └─ shortcut:search           │    │
│  │  └─ removeItem()    │    │                               │    │
│  │                     │    │  Scoped hooks (no bus arg):   │    │
│  └──────┬──────────────┘    │  useShopEvent, useShopEventBus│    │
│         │                   │  useShopAnyEvent              │    │
│         │                   └──────┬────────────────────────┘    │
│  ┌──────▼──────────┐  ┌────────────▼──────────────────────┐      │
│  │ ProductCatalog   │  │ ToastContainer (useShopEvent)     │     │
│  │ (uses BOTH)      │  │ AnalyticsLogger (useShopAnyEvent) │     │
│  │ CartSidebar      │  │ SearchModal (useShopEvent)        │     │
│  │ (uses BOTH)      │  │ BusInspector (bus prop)           │     │
│  └──────────────────┘  └─────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
```

## Component Breakdown

| Component           | State | Bus | Role                                                                                                                                    |
| ------------------- | ----- | --- | --------------------------------------------------------------------------------------------------------------------------------------- |
| **CartContext**     | ✓     | —   | Manages cart items via `useState`. Pure React state.                                                                                    |
| **ProductCatalog**  | ✓     | ✓   | Calls `addItem()` (state) + emits `toast:show` (bus) via `useShopEventBus()`                                                            |
| **CartSidebar**     | ✓     | ✓   | Reads cart from context (state) + emits on remove/checkout (bus) via `useShopEventBus()`                                                |
| **ToastContainer**  | —     | ✓   | Listens to `toast:show` via `useShopEvent`. Pure bus consumer.                                                                          |
| **AnalyticsLogger** | —     | ✓   | Listens to **all events** via `useShopAnyEvent`. Logs every bus event with timestamp and payload.                                       |
| **SearchModal**     | —     | ✓   | Listens to `shortcut:search` via `useShopEvent`. DOM → bus → UI.                                                                        |
| **BusInspector**    | —     | ✓   | Receives `bus` as prop. Calls `bus.eventNames()`, `bus.listenerCount()`, `bus.hasListeners()` directly. Demonstrates introspection API. |

## Setup

From the project root (pnpm workspace):

```bash
pnpm install
pnpm run example
```

Or directly:

```bash
cd examples/react
pnpm install
pnpm run dev
```

## Things to Try

1. **Add items to cart** — watch the cart sidebar update (state) while toasts appear and analytics log (bus)
2. **Remove items** — same dual-path pattern
3. **Press ⌘K / Ctrl+K** — search modal opens via bus event, add products from search
4. **Click "Refresh" on Bus Inspector** — see live listener counts and active event names
5. **Checkout** — toast fires, cart state unchanged (deliberate: no clear on checkout in this demo)

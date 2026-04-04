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
│  <ShopBusProvider bus={shopBus}>                                 │
│    <ActivityBusProvider bus={activityBus}>                       │
│      shopBus    = withMiddleware(createEventBus<ShopEvents>())   │
│      activityBus = withReplay(createEventBus<ActivityEvents>())  │
│                                                                  │
│  ┌──── STATE PATH ────┐     ┌──── BUS PATH ────────────────┐    │
│  │                     │    │                              │    │
│  │  CartContext         │   │  shopBus (ShopEvents)        │    │
│  │  ├─ items[]         │    │  ├─ toast:show               │    │
│  │  ├─ addItem()       │    │  └─ shortcut:search          │    │
│  │  └─ removeItem()    │    │                              │    │
│  │                     │    │  activityBus (ActivityEvents) │    │
│  │                     │    │  └─ activity:log (w/ replay)  │    │
│  └──────┬──────────────┘    └──────┬───────────────────────┘    │
│         │                          │                            │
│  ┌──────▼──────────┐  ┌───────────▼──────────────────────┐      │
│  │ ProductCatalog   │  │ ToastContainer (ShopBus)         │     │
│  │ (uses BOTH)      │  │ AnalyticsLogger (ActivityBus)    │     │
│  │ CartSidebar      │  │ SearchModal (ShopBus)            │     │
│  │ (uses BOTH)      │  │ NotificationCenter (replay)      │     │
│  └──────────────────┘  │ BusInspector (both buses)        │     │
│                        └──────────────────────────────────┘     │
└──────────────────────────────────────────────────────────────────┘
```

## Component Breakdown

| Component              | State | Bus | Role                                                                                                                |
| ---------------------- | ----- | --- | ------------------------------------------------------------------------------------------------------------------- |
| **CartContext**        | ✓     | —   | Manages cart items via `useState`. Pure React state.                                                                |
| **ProductCatalog**     | ✓     | ✓   | Calls `addItem()` (state) + emits `toast:show` (ShopBus) + `activity:log` (ActivityBus) via scoped hooks            |
| **CartSidebar**        | ✓     | ✓   | Reads cart from context (state) + emits on remove/checkout via both buses                                           |
| **ToastContainer**     | —     | ✓   | Listens to `toast:show` via `useShopEvent`. Pure bus consumer.                                                      |
| **AnalyticsLogger**    | —     | ✓   | Listens to **all activity events** via `useActivityAnyEvent`. Logs every ActivityBus event.                         |
| **SearchModal**        | —     | ✓   | Listens to `shortcut:search` via `useShopEvent`. Emits `activity:log` on add.                                       |
| **NotificationCenter** | —     | ✓   | Bell icon with badge. Replays activity history on mount via `getHistory()`. Live updates via `useActivityAnyEvent`. |
| **BusInspector**       | —     | ✓   | Receives both buses as props. Shows listener tables for each + replay history from ActivityBus `getHistory()`.      |

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

1. **Add items to cart** — watch the cart sidebar update (state) while toasts appear with emoji prefix (✅) and analytics log (bus)
2. **Remove items** — toast shows ℹ️ prefix via middleware
3. **Press ⌘K / Ctrl+K** — search modal opens via bus event, add products from search
4. **Click the 🔔 bell icon** — notification panel shows activity history replayed from `getHistory()`
5. **Click "Refresh" on Bus Inspector** — see live listener counts for both ShopBus and ActivityBus, plus replay history
6. **Checkout** — toast fires with ✅ prefix, activity logged, cart state unchanged (deliberate: no clear on checkout in this demo)

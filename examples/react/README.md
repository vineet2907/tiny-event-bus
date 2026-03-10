# Shopping Cart Demo — State vs Event Bus

A live React app showing **when to use React state** vs **when to use an event bus**, side by side.

## The Core Idea

Clicking **"Add to Cart"** does two things simultaneously:

1. **React state** → `addItem()` updates the cart → CartSidebar re-renders with the new item
2. **Event bus** → `emit('toast:show', ...)` and `emit('analytics:track', ...)` → toast appears, analytics logs — no re-render triggered

Same user action, two paths, zero coupling between them.

## When to Use What

| Scenario | Use | Why |
|----------|-----|-----|
| Cart items, totals, quantities | React state (Context) | Data drives the UI — must trigger re-renders |
| Toast notifications | Event bus | Ephemeral signal — producer doesn't know or care who shows it |
| Analytics tracking | Event bus | Fire-and-forget side-effect — no UI coupling |
| Search modal toggle (⌘K) | Event bus | DOM event → bus signal → any subscriber can respond |
| Theme, user preferences | React state (Context) | Shared data consumed by many components for rendering |

**Rule of thumb**: if a component needs to *render* data, use React state. If something needs to *react to a signal*, use the event bus.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  App                                                        │
│                                                             │
│  ┌──── STATE PATH ────┐     ┌──── BUS PATH ─────────────┐  │
│  │                     │     │                            │  │
│  │  CartContext         │     │  bus (createEventBus)      │  │
│  │  ├─ items[]         │     │  ├─ toast:show             │  │
│  │  ├─ addItem()       │     │  ├─ analytics:track        │  │
│  │  └─ removeItem()    │     │  └─ shortcut:search        │  │
│  │                     │     │                            │  │
│  └──────┬──────────────┘     └──────┬─────────────────────┘  │
│         │                           │                        │
│  ┌──────▼──────────┐  ┌────────────▼──────────────────┐     │
│  │ ProductCatalog   │  │ ToastContainer (useEvent)     │     │
│  │ (uses BOTH)      │  │ AnalyticsLogger (useEvent)    │     │
│  │ CartSidebar      │  │ SearchModal (useEvent)        │     │
│  │ (uses BOTH)      │  │ BusInspector (bus.eventNames) │     │
│  └──────────────────┘  └─────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Component Breakdown

| Component | State | Bus | Role |
|-----------|-------|-----|------|
| **CartContext** | ✓ | — | Manages cart items via `useState`. Pure React state. |
| **ProductCatalog** | ✓ | ✓ | Calls `addItem()` (state) + emits `toast:show` and `analytics:track` (bus) |
| **CartSidebar** | ✓ | ✓ | Reads cart from context (state) + emits on remove/checkout (bus) |
| **ToastContainer** | — | ✓ | Listens to `toast:show` via `useEvent`. Pure bus consumer. |
| **AnalyticsLogger** | — | ✓ | Listens to `analytics:track` via `useEvent`. Pure bus consumer. |
| **SearchModal** | — | ✓ | Listens to `shortcut:search` via `useEvent`. DOM → bus → UI. |
| **BusInspector** | — | ✓ | Calls `bus.eventNames()`, `bus.listenerCount()`, `bus.hasListeners()` directly. Demonstrates introspection API. |

## Setup

```bash
cd examples/react
npm install
npm run dev
```

Or from the project root:

```bash
npm run example
```

## Things to Try

1. **Add items to cart** — watch the cart sidebar update (state) while toasts appear and analytics log (bus)
2. **Remove items** — same dual-path pattern
3. **Press ⌘K / Ctrl+K** — search modal opens via bus event, add products from search
4. **Click "Refresh" on Bus Inspector** — see live listener counts and active event names
5. **Checkout** — toast + analytics fire, cart state unchanged (deliberate: no clear on checkout in this demo)

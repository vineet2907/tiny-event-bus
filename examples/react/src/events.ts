import { createEventBus } from '@tiny-event-bus/core';
import { createBusContext } from '@tiny-event-bus/react';
import { withReplay } from '@tiny-event-bus/replay';

export type ShopEvents = {
  'toast:show': { message: string; severity: 'info' | 'success' | 'error' };
  'shortcut:search': void;
};

export type ActivityEvents = {
  'activity:log': { action: string; detail?: string };
};

export const shopBus = createEventBus<ShopEvents>();
export const activityBus = withReplay(createEventBus<ActivityEvents>());

export const {
  Provider: ShopBusProvider,
  useEvent: useShopEvent,
  useEventBus: useShopEventBus,
  useAnyEvent: useShopAnyEvent,
} = createBusContext<ShopEvents>();

export const {
  Provider: ActivityBusProvider,
  useEventBus: useActivityEventBus,
  useAnyEvent: useActivityAnyEvent,
} = createBusContext<ActivityEvents>();

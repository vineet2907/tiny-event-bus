import { createEventBus } from '@tiny-event-bus/core';
import { createBusContext } from '@tiny-event-bus/react';

export type ShopEvents = {
  'toast:show': { message: string; severity: 'info' | 'success' | 'error' };
  'shortcut:search': void;
};

export const bus = createEventBus<ShopEvents>();

export const {
  Provider: ShopBusProvider,
  useEvent: useShopEvent,
  useEventBus: useShopEventBus,
  useAnyEvent: useShopAnyEvent,
} = createBusContext<ShopEvents>();

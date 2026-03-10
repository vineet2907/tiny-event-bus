import { createEventBus } from 'tiny-event-bus';

export type ShopEvents = {
  'toast:show': { message: string; severity: 'info' | 'success' | 'error' };
  'analytics:track': { action: string; payload?: Record<string, unknown> };
  'shortcut:search': void;
};

export const bus = createEventBus<ShopEvents>();

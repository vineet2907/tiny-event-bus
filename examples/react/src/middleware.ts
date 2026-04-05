import { type Middleware } from '@tiny-event-bus/middleware';
import { type ShopEvents } from './events.js';

const SEVERITY_ICON = { success: '✅', info: 'ℹ️', error: '❌' } as const;

export const toastFormatter: Middleware<ShopEvents> = (payload, next) => {
  if (payload.event === 'toast:show') {
    const { event, data } = payload;
    next({
      event,
      data: {
        ...data,
        message: `${SEVERITY_ICON[data.severity]} ${data.message}`,
      },
    });
  } else {
    next(payload);
  }
};

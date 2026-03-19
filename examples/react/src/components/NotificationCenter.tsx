import { useState, useCallback } from 'react';
import {
  activityBus,
  useActivityAnyEvent,
  type ActivityEvents,
} from '../events';

type Notification = { timestamp: string; action: string; detail?: string };

function toNotification(data: ActivityEvents['activity:log']): Notification {
  return {
    timestamp: new Date().toLocaleTimeString(),
    action: data.action,
    detail: data.detail,
  };
}

export default function NotificationCenter() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Notification[]>(() =>
    activityBus
      .getHistory('activity:log')
      .map((entry) =>
        toNotification(entry.data as ActivityEvents['activity:log']),
      ),
  );

  useActivityAnyEvent(
    useCallback(
      (
        _event: keyof ActivityEvents,
        data: ActivityEvents[keyof ActivityEvents],
      ) => {
        setItems((prev) =>
          [
            ...prev,
            toNotification(data as ActivityEvents['activity:log']),
          ].slice(-50),
        );
      },
      [],
    ),
  );

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button
        onClick={() => setOpen((prev) => !prev)}
        style={{
          fontSize: 20,
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          position: 'relative',
        }}
        aria-label="Notifications"
      >
        🔔
        {items.length > 0 && (
          <span
            style={{
              position: 'absolute',
              top: -4,
              right: -4,
              background: '#f44336',
              color: '#fff',
              fontSize: 11,
              borderRadius: '50%',
              width: 18,
              height: 18,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {items.length}
          </span>
        )}
      </button>

      {open && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            width: 320,
            maxHeight: 300,
            overflowY: 'auto',
            background: '#fff',
            border: '1px solid #ddd',
            borderRadius: 8,
            boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
            zIndex: 1000,
            padding: '0.5rem',
          }}
        >
          <h3 style={{ margin: '0 0 0.5rem', fontSize: 14 }}>
            Activity ({items.length})
          </h3>
          {items.length === 0 ? (
            <p style={{ color: '#999', fontSize: 13, margin: 0 }}>
              No activity yet
            </p>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {[...items].reverse().map((item, i) => (
                <li
                  key={i}
                  style={{
                    padding: '4px 0',
                    borderBottom: '1px solid #eee',
                    fontSize: 13,
                  }}
                >
                  <span style={{ color: '#888' }}>[{item.timestamp}]</span>{' '}
                  <strong>{item.action}</strong>
                  {item.detail && (
                    <span style={{ color: '#666' }}> — {item.detail}</span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

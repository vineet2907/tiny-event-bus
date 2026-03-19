import { useState, useCallback } from 'react';
import { useActivityAnyEvent, type ActivityEvents } from '../events';

type LogEntry = { timestamp: string; event: string; payload: unknown };

export default function AnalyticsLogger() {
  const [logs, setLogs] = useState<LogEntry[]>([]);

  useActivityAnyEvent(
    useCallback(
      (
        event: keyof ActivityEvents,
        data: ActivityEvents[keyof ActivityEvents],
      ) => {
        setLogs((prev) =>
          [
            {
              timestamp: new Date().toLocaleTimeString(),
              event: String(event),
              payload: data,
            },
            ...prev,
          ].slice(0, 50),
        );
      },
      [],
    ),
  );

  return (
    <section>
      <h2>
        Analytics Log{' '}
        <span style={{ fontSize: 12, fontWeight: 'normal', color: '#888' }}>
          (ActivityBus — useAnyEvent catches all activity events)
        </span>
      </h2>
      <div
        style={{
          background: '#1e1e1e',
          color: '#d4d4d4',
          borderRadius: 8,
          padding: '0.75rem',
          fontFamily: 'monospace',
          fontSize: 13,
          maxHeight: 200,
          overflowY: 'auto',
        }}
      >
        {logs.length === 0 ? (
          <p style={{ color: '#666', margin: 0 }}>
            No events yet — try adding items to cart
          </p>
        ) : (
          logs.map((log, i) => (
            <div key={i} style={{ padding: '2px 0' }}>
              <span style={{ color: '#888' }}>[{log.timestamp}]</span>{' '}
              <span style={{ color: '#9cdcfe' }}>{log.event}</span>
              {log.payload != null && (
                <span style={{ color: '#ce9178' }}>
                  {' '}
                  {JSON.stringify(log.payload)}
                </span>
              )}
            </div>
          ))
        )}
      </div>
    </section>
  );
}

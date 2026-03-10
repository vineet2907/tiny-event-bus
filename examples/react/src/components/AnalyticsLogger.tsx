import { useState, useCallback } from 'react';
import { useEvent } from 'tiny-event-bus/react';
import { bus, type ShopEvents } from '../events';

type LogEntry = { timestamp: string; action: string; payload?: Record<string, unknown> };

export default function AnalyticsLogger() {
  const [logs, setLogs] = useState<LogEntry[]>([]);

  useEvent('analytics:track', useCallback((data: ShopEvents['analytics:track']) => {
    setLogs((prev) => [
      { timestamp: new Date().toLocaleTimeString(), action: data.action, payload: data.payload },
      ...prev,
    ].slice(0, 50));
  }, []), bus);

  return (
    <section>
      <h2>Analytics Log</h2>
      <div style={{ background: '#1e1e1e', color: '#d4d4d4', borderRadius: 8, padding: '0.75rem', fontFamily: 'monospace', fontSize: 13, maxHeight: 200, overflowY: 'auto' }}>
        {logs.length === 0 ? (
          <p style={{ color: '#666', margin: 0 }}>No events yet — try adding items to cart</p>
        ) : (
          logs.map((log, i) => (
            <div key={i} style={{ padding: '2px 0' }}>
              <span style={{ color: '#888' }}>[{log.timestamp}]</span>{' '}
              <span style={{ color: '#9cdcfe' }}>{log.action}</span>
              {log.payload && <span style={{ color: '#ce9178' }}> {JSON.stringify(log.payload)}</span>}
            </div>
          ))
        )}
      </div>
    </section>
  );
}

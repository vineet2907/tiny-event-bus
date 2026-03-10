import { useState } from 'react';
import { bus } from '../events';

export default function BusInspector() {
  const [, setTick] = useState(0);
  const refresh = () => setTick((t) => t + 1);

  const names = bus.eventNames();
  const totalCount = bus.listenerCount();

  return (
    <section style={{ marginTop: '2rem', padding: '1rem', background: '#f5f5f5', borderRadius: 8, fontSize: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
        <h2 style={{ margin: 0 }}>Bus Inspector</h2>
        <button onClick={refresh} style={{ fontSize: 13 }}>Refresh</button>
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ textAlign: 'left', borderBottom: '1px solid #ddd' }}>
            <th style={{ padding: '4px 8px' }}>Event</th>
            <th style={{ padding: '4px 8px' }}>Listeners</th>
            <th style={{ padding: '4px 8px' }}>Has Listeners</th>
          </tr>
        </thead>
        <tbody>
          {names.map((name) => (
            <tr key={String(name)} style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '4px 8px', fontFamily: 'monospace' }}>{String(name)}</td>
              <td style={{ padding: '4px 8px' }}>{bus.listenerCount(name)}</td>
              <td style={{ padding: '4px 8px' }}>{bus.hasListeners(name) ? '✓' : '✗'}</td>
            </tr>
          ))}
          {names.length === 0 && (
            <tr>
              <td colSpan={3} style={{ padding: '4px 8px', color: '#999' }}>No active listeners</td>
            </tr>
          )}
        </tbody>
      </table>
      <p style={{ margin: '0.5rem 0 0', color: '#666' }}>
        Total listeners: {totalCount} · Active events: {names.length}
      </p>
    </section>
  );
}

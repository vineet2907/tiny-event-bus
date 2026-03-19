import { useState } from 'react';
import type { IEventBus } from '@tiny-event-bus/core';
import type { ShopEvents } from '../events';

export default function BusInspector({ bus }: { bus: IEventBus<ShopEvents> }) {
  const [, setTick] = useState(0);
  const refresh = () => setTick((t) => t + 1);

  const names = bus.eventNames();
  const totalCount = bus.listenerCount();
  const perEventCount = names.reduce(
    (sum, name) => sum + bus.listenerCount(name),
    0,
  );
  const anyCount = totalCount - perEventCount;

  return (
    <section
      style={{
        marginTop: '2rem',
        padding: '1rem',
        background: '#f5f5f5',
        borderRadius: 8,
        fontSize: 14,
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '0.75rem',
        }}
      >
        <h2 style={{ margin: 0 }}>Bus Inspector</h2>
        <button onClick={refresh} style={{ fontSize: 13 }}>
          Refresh
        </button>
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
              <td style={{ padding: '4px 8px', fontFamily: 'monospace' }}>
                {String(name)}
              </td>
              <td style={{ padding: '4px 8px' }}>{bus.listenerCount(name)}</td>
              <td style={{ padding: '4px 8px' }}>
                {bus.hasListeners(name) ? '✓' : '✗'}
              </td>
            </tr>
          ))}
          {names.length === 0 && anyCount === 0 && (
            <tr>
              <td colSpan={3} style={{ padding: '4px 8px', color: '#999' }}>
                No active listeners
              </td>
            </tr>
          )}
          {anyCount > 0 && (
            <tr
              style={{ borderBottom: '1px solid #eee', background: '#ede7f6' }}
            >
              <td
                style={{
                  padding: '4px 8px',
                  fontFamily: 'monospace',
                  fontStyle: 'italic',
                }}
              >
                * (onAny)
              </td>
              <td style={{ padding: '4px 8px' }}>{anyCount}</td>
              <td style={{ padding: '4px 8px' }}>✓</td>
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

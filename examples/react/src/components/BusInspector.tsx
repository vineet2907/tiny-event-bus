import { useState } from 'react';
import type { IEventBus } from '@tiny-event-bus/core';
import type { ReplayBus } from '@tiny-event-bus/replay';
import type { ShopEvents, ActivityEvents } from '../events';

function BusTable({ label, bus }: { label: string; bus: IEventBus<any> }) {
  const names = bus.eventNames();
  const totalCount = bus.listenerCount();
  const perEventCount = names.reduce(
    (sum, name) => sum + bus.listenerCount(name),
    0,
  );
  const anyCount = totalCount - perEventCount;

  return (
    <div style={{ marginBottom: '1rem' }}>
      <h3 style={{ margin: '0 0 0.5rem', fontSize: 14 }}>{label}</h3>
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
      <p style={{ margin: '0.25rem 0 0', color: '#666', fontSize: 13 }}>
        Total listeners: {totalCount} · Active events: {names.length}
      </p>
    </div>
  );
}

export default function BusInspector({
  shopBus,
  activityBus,
}: {
  shopBus: IEventBus<ShopEvents>;
  activityBus: ReplayBus<ActivityEvents>;
}) {
  const [, setTick] = useState(0);
  const refresh = () => setTick((t) => t + 1);

  const history = activityBus.getHistory();

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

      <BusTable label="ShopBus" bus={shopBus} />
      <BusTable label="ActivityBus (replay)" bus={activityBus} />

      <h3 style={{ margin: '0.5rem 0 0.25rem', fontSize: 14 }}>
        Replay History ({history.length})
      </h3>
      <div
        style={{
          background: '#1e1e1e',
          color: '#d4d4d4',
          borderRadius: 8,
          padding: '0.5rem',
          fontFamily: 'monospace',
          fontSize: 12,
          maxHeight: 150,
          overflowY: 'auto',
        }}
      >
        {history.length === 0 ? (
          <p style={{ color: '#666', margin: 0 }}>No buffered events</p>
        ) : (
          history.map((entry, i) => (
            <div key={i} style={{ padding: '2px 0' }}>
              <span style={{ color: '#888' }}>
                [{new Date(entry.timestamp).toLocaleTimeString()}]
              </span>{' '}
              <span style={{ color: '#9cdcfe' }}>{String(entry.event)}</span>{' '}
              <span style={{ color: '#ce9178' }}>
                {JSON.stringify(entry.data)}
              </span>
            </div>
          ))
        )}
      </div>
    </section>
  );
}

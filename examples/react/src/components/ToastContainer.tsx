import { useState, useCallback, useEffect } from 'react';
import { useEvent } from 'tiny-event-bus/react';
import { bus, type ShopEvents } from '../events';

type Toast = ShopEvents['toast:show'] & { id: number };

let nextId = 0;

export default function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEvent('toast:show', useCallback((data: ShopEvents['toast:show']) => {
    const id = nextId++;
    setToasts((prev) => [...prev, { ...data, id }]);
  }, []), bus);

  useEffect(() => {
    if (toasts.length === 0) return;
    const timer = setTimeout(() => {
      setToasts((prev) => prev.slice(1));
    }, 3000);
    return () => clearTimeout(timer);
  }, [toasts]);

  const colors = { info: '#2196f3', success: '#4caf50', error: '#f44336' };

  return (
    <div style={{ position: 'fixed', top: 16, right: 16, display: 'flex', flexDirection: 'column', gap: 8, zIndex: 1000 }}>
      {toasts.map((toast) => (
        <div key={toast.id} style={{ background: colors[toast.severity], color: '#fff', padding: '0.75rem 1rem', borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.15)', minWidth: 250 }}>
          {toast.message}
        </div>
      ))}
    </div>
  );
}

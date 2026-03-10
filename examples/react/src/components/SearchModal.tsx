import { useState, useCallback, useEffect } from 'react';
import { useEvent } from 'tiny-event-bus/react';
import { useEventBus } from 'tiny-event-bus/react';
import { bus } from '../events';
import { useCart } from '../context/CartContext';
import { products, type Product } from '../data/products';

export default function SearchModal() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const { addItem } = useCart();
  const { emit } = useEventBus(bus);

  useEvent('shortcut:search', useCallback(() => {
    setOpen((prev) => !prev);
    setQuery('');
  }, []), bus);

  useEffect(() => {
    if (!open) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open]);

  function handleAdd(product: Product) {
    addItem(product);
    emit('toast:show', { message: `${product.name} added to cart!`, severity: 'success' });
    emit('analytics:track', { action: 'add_to_cart_from_search', payload: { productId: product.id, name: product.name } });
    setOpen(false);
  }

  if (!open) return null;

  const results = query.trim()
    ? products.filter((p) => p.name.toLowerCase().includes(query.toLowerCase()))
    : products;

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: '20vh', zIndex: 2000 }} onClick={() => setOpen(false)}>
      <div style={{ background: '#fff', borderRadius: 12, padding: '1.5rem', width: 400, boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }} onClick={(e) => e.stopPropagation()}>
        <input
          autoFocus
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search products..."
          style={{ width: '100%', padding: '0.75rem', fontSize: 16, border: '1px solid #ddd', borderRadius: 8, boxSizing: 'border-box' }}
        />
        <ul style={{ listStyle: 'none', padding: 0, margin: '0.75rem 0 0' }}>
          {results.map((product) => (
            <li key={product.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderBottom: '1px solid #eee' }}>
              <span>{product.name} <span style={{ color: '#999' }}>${product.price.toFixed(2)}</span></span>
              <button onClick={() => handleAdd(product)} style={{ fontSize: 13 }}>Add</button>
            </li>
          ))}
          {results.length === 0 && (
            <li style={{ color: '#999', padding: '0.5rem 0' }}>No products found</li>
          )}
        </ul>
        <p style={{ color: '#999', fontSize: 13, marginTop: '0.5rem' }}>
          Press <kbd>Esc</kbd> or click outside to close
        </p>
      </div>
    </div>
  );
}

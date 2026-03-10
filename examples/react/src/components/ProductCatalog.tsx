import { useCart } from '../context/CartContext';
import { useEventBus } from 'tiny-event-bus/react';
import { bus } from '../events';
import { products, type Product } from '../data/products';

export default function ProductCatalog() {
  const { addItem } = useCart();
  const { emit } = useEventBus(bus);

  function handleAdd(product: Product) {
    // STATE path — updates cart UI, triggers re-render
    addItem(product);

    // BUS path — fire-and-forget signals, no re-render
    emit('toast:show', { message: `${product.name} added to cart!`, severity: 'success' });
  }

  return (
    <section>
      <h2>Products</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
        {products.map((product) => (
          <div key={product.id} style={{ border: '1px solid #ddd', borderRadius: 8, padding: '1rem' }}>
            <h3 style={{ margin: '0 0 0.5rem' }}>{product.name}</h3>
            <p style={{ margin: '0 0 1rem', color: '#666' }}>${product.price.toFixed(2)}</p>
            <button onClick={() => handleAdd(product)}>Add to Cart</button>
          </div>
        ))}
      </div>
    </section>
  );
}

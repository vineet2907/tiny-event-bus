import { useCart } from '../context/CartContext';
import { useShopEventBus } from '../events';

export default function CartSidebar() {
  const { items, removeItem, total } = useCart();
  const { emit } = useShopEventBus();

  function handleRemove(id: number, name: string) {
    // STATE path — updates cart UI
    removeItem(id);

    // BUS path — fire-and-forget
    emit('toast:show', { message: `${name} removed from cart`, severity: 'info' });
  }

  function handleCheckout() {
    emit('toast:show', { message: 'Order placed! 🎉', severity: 'success' });
  }

  return (
    <section>
      <h2>Cart ({items.length})</h2>
      {items.length === 0 ? (
        <p style={{ color: '#999' }}>Your cart is empty</p>
      ) : (
        <>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {items.map((item) => (
              <li key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderBottom: '1px solid #eee' }}>
                <span>{item.name} × {item.quantity}</span>
                <span>
                  ${(item.price * item.quantity).toFixed(2)}{' '}
                  <button onClick={() => handleRemove(item.id, item.name)} style={{ marginLeft: '0.5rem' }}>✕</button>
                </span>
              </li>
            ))}
          </ul>
          <p style={{ fontWeight: 'bold', marginTop: '1rem' }}>Total: ${total.toFixed(2)}</p>
          <button onClick={handleCheckout}>Checkout</button>
        </>
      )}
    </section>
  );
}

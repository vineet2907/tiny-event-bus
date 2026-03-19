import { useEffect } from 'react';
import { CartProvider } from './context/CartContext';
import ProductCatalog from './components/ProductCatalog';
import CartSidebar from './components/CartSidebar';
import ToastContainer from './components/ToastContainer';
import AnalyticsLogger from './components/AnalyticsLogger';
import SearchModal from './components/SearchModal';
import BusInspector from './components/BusInspector';
import NotificationCenter from './components/NotificationCenter';
import {
  shopBus,
  activityBus,
  ShopBusProvider,
  ActivityBusProvider,
  useShopEventBus,
} from './events';

function KeyboardShortcuts() {
  const { emit } = useShopEventBus();

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        emit('shortcut:search', undefined as void);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [emit]);

  return null;
}

export default function App() {
  return (
    <ShopBusProvider bus={shopBus}>
      <ActivityBusProvider bus={activityBus}>
        <CartProvider>
          <KeyboardShortcuts />
          <div
            style={{
              maxWidth: 900,
              margin: '0 auto',
              padding: '1rem',
              fontFamily: 'system-ui, sans-serif',
            }}
          >
            <h1>tiny-event-bus — Shopping Cart Demo</h1>
            <p style={{ color: '#666', marginBottom: '2rem' }}>
              State vs Event Bus, side by side. Click "Add to Cart" — the cart
              updates via React state, while toasts and analytics fire via the
              event bus. Press <kbd>⌘K</kbd> to open search via the event bus.
            </p>
            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                marginBottom: '1rem',
              }}
            >
              <NotificationCenter />
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '2fr 1fr',
                gap: '2rem',
              }}
            >
              <ProductCatalog />
              <CartSidebar />
            </div>
            <div style={{ marginTop: '2rem' }}>
              <AnalyticsLogger />
            </div>
            <BusInspector shopBus={shopBus} activityBus={activityBus} />
          </div>
          <ToastContainer />
          <SearchModal />
        </CartProvider>
      </ActivityBusProvider>
    </ShopBusProvider>
  );
}

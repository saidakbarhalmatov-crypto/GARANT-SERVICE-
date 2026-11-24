import { useCallback, useEffect, useRef, useState } from 'react';
import { AdminModal } from './components/AdminModal';
import { BookingForm } from './components/BookingForm';
import { ContactCard } from './components/ContactCard';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { ReviewsSection } from './components/ReviewsSection';
import { Toast } from './components/Toast';
import { useTheme } from './hooks/useTheme';
import { fetchOrders, fetchReviews } from './services/firebase';
import type { ConnectionState, Order, Review } from './types';

export function App() {
  const { theme, setTheme } = useTheme();
  const [connectionState, setConnectionState] = useState<ConnectionState>('checking');
  const [approvedReviews, setApprovedReviews] = useState<Array<[string, Review]>>([]);
  const [pendingReviews, setPendingReviews] = useState<Array<[string, Review]>>([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);

  const [orders, setOrders] = useState<Array<[string, Order]>>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [adminActive, setAdminActive] = useState(false);

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimerRef = useRef<number | null>(null);

  const showToast = useCallback((message: string) => {
    setToastMessage(message);
    if (toastTimerRef.current !== null) {
      window.clearTimeout(toastTimerRef.current);
    }
    toastTimerRef.current = window.setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current !== null) {
        window.clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  const syncAllData = useCallback(async () => {
    try {
      const reviewsMap = await fetchReviews();
      setConnectionState('connected');
      setReviewsLoading(false);

      const entries = Object.entries(reviewsMap || {}).filter(
        (pair): pair is [string, Review] => Boolean(pair[1])
      );

      const approved = entries
        .filter(([, r]) => r.status === 'approved')
        .sort((a, b) => (b[1].createdAt || 0) - (a[1].createdAt || 0));
      setApprovedReviews(approved);

      if (adminActive) {
        const pending = entries
          .filter(([, r]) => r.status === 'pending')
          .sort((a, b) => (b[1].createdAt || 0) - (a[1].createdAt || 0));
        setPendingReviews(pending);
      }
    } catch {
      setConnectionState('disconnected');
      setReviewsLoading(false);
    }

    if (adminActive) {
      try {
        const ordersMap = await fetchOrders();
        const sortedOrders = Object.entries(ordersMap || {})
          .filter((pair): pair is [string, Order] => Boolean(pair[1]))
          .sort((a, b) => (b[1].createdAt || 0) - (a[1].createdAt || 0));
        setOrders(sortedOrders);
        setOrdersError(null);
      } catch {
        setOrdersError('Ошибка загрузки заявок. Проверьте правила Firebase.');
      } finally {
        setOrdersLoading(false);
      }
    }
  }, [adminActive]);

  useEffect(() => {
    void syncAllData();
    const intervalId = window.setInterval(() => {
      void syncAllData();
    }, 5000);
    return () => {
      window.clearInterval(intervalId);
    };
  }, [syncAllData]);

  const handleLoginSuccess = () => {
    setOrdersLoading(true);
    setAdminActive(true);
  };

  const handleLogout = () => {
    setAdminActive(false);
    setOrders([]);
    setPendingReviews([]);
    setOrdersError(null);
    showToast('Вы вышли из панели.');
  };

  return (
    <>
      <Header
        theme={theme}
        onThemeChange={setTheme}
        onOpenAdmin={() => setModalOpen(true)}
      />
      <main className="wrap">
        <Hero connectionState={connectionState} />
        <section className="grid-layout">
          <BookingForm
            onToast={showToast}
            onOrderCreated={() => {
              void syncAllData();
            }}
          />
          <ReviewsSection
            reviews={approvedReviews}
            loading={reviewsLoading}
            onToast={showToast}
            onReviewSubmitted={() => {
              void syncAllData();
            }}
          />
          <ContactCard />
        </section>
      </main>
      <footer className="gs-footer">
        <div className="wrap footer-row">
          <span>© {new Date().getFullYear()} Garant Service. Все права защищены.</span>
          <button
            className="btn ghost"
            type="button"
            onClick={() => setModalOpen(true)}
          >
            Для разработчика
          </button>
        </div>
      </footer>

      <AdminModal
        isOpen={modalOpen}
        adminActive={adminActive}
        orders={orders}
        ordersLoading={ordersLoading}
        ordersError={ordersError}
        pendingReviews={pendingReviews}
        onClose={() => setModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        onLogout={handleLogout}
        onSync={() => {
          void syncAllData();
        }}
        onToast={showToast}
      />

      <Toast message={toastMessage} />
    </>
  );
}

export default App;

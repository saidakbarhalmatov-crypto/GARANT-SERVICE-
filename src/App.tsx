import { useCallback, useEffect, useRef, useState } from 'react';
import { CalendarCheck, Info, MessageSquare, Wrench } from 'lucide-react';
import { AboutAndContact } from './components/AboutAndContact';
import { AdminModal } from './components/AdminModal';
import { BookingForm } from './components/BookingForm';
import { Header, type SectionTab } from './components/Header';
import { Hero } from './components/Hero';
import { ReviewsSection } from './components/ReviewsSection';
import { ServicesSection } from './components/ServicesSection';
import { Toast } from './components/Toast';
import { fetchOrders, fetchReviews } from './services/firebase';
import type { ConnectionState, Order, Review } from './types';

const SECTION_TABS: Array<{ id: SectionTab; label: string; Icon: typeof Wrench }> = [
  { id: 'services', label: 'Услуги', Icon: Wrench },
  { id: 'booking', label: 'Онлайн-запись', Icon: CalendarCheck },
  { id: 'reviews', label: 'Отзывы', Icon: MessageSquare },
  { id: 'about', label: 'О нас и Контакты', Icon: Info },
];

export function App() {
  const [connectionState, setConnectionState] = useState<ConnectionState>('checking');
  const [allReviews, setAllReviews] = useState<Array<[string, Review]>>([]);
  const [approvedReviews, setApprovedReviews] = useState<Array<[string, Review]>>([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);

  const [orders, setOrders] = useState<Array<[string, Order]>>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState<string | null>(null);

  const [activeSection, setActiveSection] = useState<SectionTab>('services');
  const [selectedService, setSelectedService] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [adminActive, setAdminActive] = useState(false);

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimerRef = useRef<number | null>(null);
  const sectionTabsRef = useRef<HTMLDivElement | null>(null);

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

      const entries = Object.entries(reviewsMap || {})
        .filter((pair): pair is [string, Review] => Boolean(pair[1]))
        .sort((a, b) => (b[1].createdAt || 0) - (a[1].createdAt || 0));

      setAllReviews(entries);
      setApprovedReviews(entries.filter(([, r]) => r.status === 'approved'));
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

  const handleNavigate = (target: 'hero' | SectionTab) => {
    if (target === 'hero') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setActiveSection(target);
    window.setTimeout(() => {
      sectionTabsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 30);
  };

  const handleSelectService = (serviceName: string) => {
    setSelectedService(serviceName);
    setActiveSection('booking');
    window.setTimeout(() => {
      sectionTabsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 30);
  };

  const handleLoginSuccess = () => {
    setOrdersLoading(true);
    setAdminActive(true);
  };

  const handleLogout = () => {
    setAdminActive(false);
    setOrders([]);
    setOrdersError(null);
    showToast('Вы вышли из панели.');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#08090B] text-[#F1F0EC] overflow-x-hidden">
      <Header
        activeSection={activeSection}
        onNavigate={handleNavigate}
        onOpenAdmin={() => setModalOpen(true)}
      />

      <main className="flex-1">
        <Hero
          connectionState={connectionState}
          approvedReviews={approvedReviews}
          onNavigate={handleNavigate}
        />

        {/* Compact Section Tabs ("Отделы") */}
        <div
          ref={sectionTabsRef}
          id="sections-nav"
          className="bg-[#111317] border-b border-white/[0.08] scroll-mt-16"
        >
          <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3">
            <div
              className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2"
              role="tablist"
              aria-label="Разделы сервиса"
            >
              {SECTION_TABS.map(({ id, label, Icon }) => {
                const isActive = activeSection === id;
                const badgeCount =
                  id === 'reviews' && approvedReviews.length > 0
                    ? ` (${approvedReviews.length})`
                    : '';

                return (
                  <button
                    key={id}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => setActiveSection(id)}
                    className={`px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap flex items-center justify-center sm:justify-start gap-2 transition-all ${
                      isActive ? 'glass-btn-gold text-[#F1F0EC]' : 'glass-btn text-[#96989D]'
                    }`}
                  >
                    <Icon className="w-4 h-4 text-[#B69A67] shrink-0" strokeWidth={1.75} />
                    <span className="truncate">
                      {label}
                      {badgeCount}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Active Section Panel */}
        <div className="bg-[#111317]">
          {activeSection === 'services' && (
            <ServicesSection onSelectService={handleSelectService} />
          )}
          {activeSection === 'booking' && (
            <BookingForm
              selectedService={selectedService}
              onServiceChange={setSelectedService}
              onToast={showToast}
              onOrderCreated={() => {
                void syncAllData();
              }}
            />
          )}
          {activeSection === 'reviews' && (
            <ReviewsSection
              reviews={approvedReviews}
              loading={reviewsLoading}
              onToast={showToast}
              onReviewSubmitted={() => {
                void syncAllData();
              }}
            />
          )}
          {activeSection === 'about' && (
            <AboutAndContact onGoToBooking={() => handleNavigate('booking')} />
          )}
        </div>
      </main>

      <footer className="bg-[#08090B] border-t border-white/[0.08] py-7">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs sm:text-sm text-[#96989D]">
          <span>
            © <span className="font-mono-num">{new Date().getFullYear()}</span> Garant Service. Все
            права защищены.
          </span>
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="glass-btn px-4 py-2 rounded-xl text-xs font-medium"
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
        allReviews={allReviews}
        onClose={() => setModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        onLogout={handleLogout}
        onSync={() => {
          void syncAllData();
        }}
        onToast={showToast}
      />

      <Toast message={toastMessage} />
    </div>
  );
}

export default App;

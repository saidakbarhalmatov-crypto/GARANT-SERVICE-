import { useMemo, useState, type FormEvent } from 'react';
import {
  BarChart3,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  LogOut,
  MessageSquare,
  Search,
  Star,
  Trash2,
  Users,
  X,
} from 'lucide-react';
import { SERVICE_NAMES } from '../data/services';
import {
  deleteOrder,
  deleteReview,
  moderateReview,
  replyToReview,
  updateOrderStatus,
} from '../services/firebase';
import type { Order, OrderStatus, Review } from '../types';

const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = '202';
const ORDER_STATUSES: OrderStatus[] = ['Новая', 'Подтверждена', 'Выполнено', 'Отменена'];
const WEEKDAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

type AdminTab = 'stats' | 'orders' | 'calendar' | 'clients' | 'reviews';
type ReviewFilter = 'pending' | 'approved' | 'rejected';

interface AdminModalProps {
  isOpen: boolean;
  adminActive: boolean;
  orders: Array<[string, Order]>;
  ordersLoading: boolean;
  ordersError: string | null;
  allReviews: Array<[string, Review]>;
  onClose: () => void;
  onLoginSuccess: () => void;
  onLogout: () => void;
  onSync: () => void;
  onToast: (message: string) => void;
}

function formatDateRu(ts?: number): string {
  if (!ts) return '—';
  try {
    return new Intl.DateTimeFormat('ru-RU', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(new Date(ts));
  } catch {
    return '—';
  }
}

function getTodayIso(): string {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
}

export function AdminModal({
  isOpen,
  adminActive,
  orders,
  ordersLoading,
  ordersError,
  allReviews,
  onClose,
  onLoginSuccess,
  onLogout,
  onSync,
  onToast,
}: AdminModalProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState<AdminTab>('stats');

  // Orders search & filters
  const [orderSearch, setOrderSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'Все' | OrderStatus>('Все');
  const [serviceFilter, setServiceFilter] = useState<string>('Все');
  const [confirmDeleteOrderId, setConfirmDeleteOrderId] = useState<string | null>(null);

  // Calendar state
  const now = new Date();
  const [calYear, setCalYear] = useState(now.getFullYear());
  const [calMonth, setCalMonth] = useState(now.getMonth());
  const [selectedDate, setSelectedDate] = useState(getTodayIso());

  // Clients search
  const [clientSearch, setClientSearch] = useState('');

  // Reviews filter & inline admin replies
  const [reviewFilter, setReviewFilter] = useState<ReviewFilter>('pending');
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
  const [replySavingId, setReplySavingId] = useState<string | null>(null);
  const [confirmDeleteReviewId, setConfirmDeleteReviewId] = useState<string | null>(null);

  // Real statistics computed strictly from Firebase orders & reviews
  const stats = useMemo(() => {
    const total = orders.length;
    const byStatus: Record<OrderStatus, number> = {
      Новая: 0,
      Подтверждена: 0,
      Выполнено: 0,
      Отменена: 0,
    };
    const byService: Record<string, number> = {};

    for (const [, o] of orders) {
      const st = (ORDER_STATUSES.includes(o.status as OrderStatus)
        ? o.status
        : 'Новая') as OrderStatus;
      byStatus[st] += 1;
      const svc = o.service || 'Другое';
      byService[svc] = (byService[svc] || 0) + 1;
    }

    const approved = allReviews.filter(([, r]) => r.status === 'approved');
    const pending = allReviews.filter(([, r]) => r.status === 'pending');
    const avgRating =
      approved.length > 0
        ? (
            approved.reduce((acc, [, r]) => acc + Math.max(1, Math.min(5, Number(r.rating) || 0)), 0) /
            approved.length
          ).toFixed(1)
        : '—';

    return {
      total,
      activeCount: byStatus['Новая'] + byStatus['Подтверждена'],
      completedCount: byStatus['Выполнено'],
      byStatus,
      byService,
      approvedCount: approved.length,
      pendingCount: pending.length,
      avgRating,
    };
  }, [orders, allReviews]);

  const filteredOrders = useMemo(() => {
    const q = orderSearch.trim().toLowerCase();
    return orders.filter(([, o]) => {
      if (statusFilter !== 'Все' && (o.status || 'Новая') !== statusFilter) return false;
      if (serviceFilter !== 'Все' && o.service !== serviceFilter) return false;
      if (!q) return true;
      return (
        (o.name || '').toLowerCase().includes(q) ||
        (o.phone || '').toLowerCase().includes(q) ||
        (o.car || '').toLowerCase().includes(q) ||
        (o.comment || '').toLowerCase().includes(q)
      );
    });
  }, [orders, orderSearch, statusFilter, serviceFilter]);

  const calendarData = useMemo(() => {
    const countsByDate: Record<string, Array<[string, Order]>> = {};
    for (const pair of orders) {
      const d = pair[1].date;
      if (!d) continue;
      if (!countsByDate[d]) countsByDate[d] = [];
      countsByDate[d].push(pair);
    }

    const firstDay = new Date(calYear, calMonth, 1);
    const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
    const startOffset = (firstDay.getDay() + 6) % 7; // Monday = 0

    const cells: Array<{ iso: string; day: number } | null> = [];
    for (let i = 0; i < startOffset; i += 1) cells.push(null);
    for (let day = 1; day <= daysInMonth; day += 1) {
      const mm = String(calMonth + 1).padStart(2, '0');
      const dd = String(day).padStart(2, '0');
      cells.push({ iso: `${calYear}-${mm}-${dd}`, day });
    }

    const monthTitle = new Intl.DateTimeFormat('ru-RU', {
      month: 'long',
      year: 'numeric',
    }).format(firstDay);

    return { cells, countsByDate, monthTitle };
  }, [orders, calYear, calMonth]);

  const clientsList = useMemo(() => {
    interface ClientRecord {
      key: string;
      name: string;
      phone: string;
      cars: Set<string>;
      services: Set<string>;
      visits: number;
      lastDate: string;
      lastCreatedAt: number;
    }

    const map = new Map<string, ClientRecord>();
    for (const [, o] of orders) {
      const normPhone = (o.phone || '').replace(/\D/g, '');
      const key = normPhone || (o.name || 'unknown').trim().toLowerCase();
      const existing = map.get(key);
      if (!existing) {
        map.set(key, {
          key,
          name: o.name || 'Клиент',
          phone: o.phone || '—',
          cars: new Set(o.car ? [o.car] : []),
          services: new Set(o.service ? [o.service] : []),
          visits: 1,
          lastDate: o.date || '',
          lastCreatedAt: o.createdAt || 0,
        });
      } else {
        existing.visits += 1;
        if (o.car) existing.cars.add(o.car);
        if (o.service) existing.services.add(o.service);
        if ((o.createdAt || 0) > existing.lastCreatedAt) {
          existing.lastCreatedAt = o.createdAt || 0;
          existing.lastDate = o.date || existing.lastDate;
          if (o.name) existing.name = o.name;
        }
      }
    }

    const q = clientSearch.trim().toLowerCase();
    return Array.from(map.values())
      .sort((a, b) => b.lastCreatedAt - a.lastCreatedAt)
      .filter((c) => {
        if (!q) return true;
        return (
          c.name.toLowerCase().includes(q) ||
          c.phone.toLowerCase().includes(q) ||
          Array.from(c.cars).some((car) => car.toLowerCase().includes(q))
        );
      });
  }, [orders, clientSearch]);

  const filteredReviews = useMemo(() => {
    return allReviews.filter(([, r]) => r.status === reviewFilter);
  }, [allReviews, reviewFilter]);

  if (!isOpen) return null;

  const handleLogin = (e: FormEvent) => {
    e.preventDefault();
    if (username.trim() === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      setUsername('');
      setPassword('');
      onLoginSuccess();
      onToast('Панель открыта.');
    } else {
      onToast('Неверный логин или пароль.');
      setPassword('');
    }
  };

  const handleOrderStatus = async (id: string, status: OrderStatus) => {
    try {
      await updateOrderStatus(id, status);
      onToast('Статус заявки обновлён.');
      onSync();
    } catch {
      onToast('Не удалось изменить статус.');
    }
  };

  const handleOrderDelete = async (id: string) => {
    try {
      await deleteOrder(id);
      setConfirmDeleteOrderId(null);
      onToast('Заявка удалена.');
      onSync();
    } catch {
      onToast('Не удалось удалить заявку.');
    }
  };

  const handleModerateReview = async (id: string, status: 'approved' | 'rejected') => {
    try {
      await moderateReview(id, status);
      onToast(status === 'approved' ? 'Отзыв опубликован.' : 'Отзыв отклонён.');
      onSync();
    } catch {
      onToast(
        status === 'approved'
          ? 'Не удалось одобрить отзыв.'
          : 'Не удалось отклонить отзыв.'
      );
    }
  };

  const handleSaveReply = async (id: string, fallbackExisting?: string) => {
    const draft = (replyDrafts[id] ?? fallbackExisting ?? '').trim();
    if (!draft) {
      onToast('Введите текст ответа.');
      return;
    }
    setReplySavingId(id);
    try {
      await replyToReview(id, draft);
      onToast('Ответ администрации сохранён.');
      onSync();
    } catch {
      onToast('Не удалось сохранить ответ.');
    } finally {
      setReplySavingId(null);
    }
  };

  const handleDeleteReview = async (id: string) => {
    try {
      await deleteReview(id);
      setConfirmDeleteReviewId(null);
      onToast('Отзыв удалён.');
      onSync();
    } catch {
      onToast('Не удалось удалить отзыв.');
    }
  };

  const prevMonth = () => {
    if (calMonth === 0) {
      setCalMonth(11);
      setCalYear((y) => y - 1);
    } else {
      setCalMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (calMonth === 11) {
      setCalMonth(0);
      setCalYear((y) => y + 1);
    } else {
      setCalMonth((m) => m + 1);
    }
  };

  const maxServiceCount = Math.max(1, ...Object.values(stats.byService));
  const selectedDayOrders = (calendarData.countsByDate[selectedDate] || []).sort((a, b) =>
    (a[1].time || '').localeCompare(b[1].time || '')
  );

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="adminTitle"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={`glass-surface rounded-2xl w-full ${
          adminActive ? 'max-w-5xl' : 'max-w-md'
        } max-h-[90vh] flex flex-col overflow-hidden`}
      >
        {/* Modal Header */}
        <div className="px-5 sm:px-7 py-4 border-b border-white/[0.08] flex items-center justify-between gap-4">
          <div>
            <p className="text-[11px] tracking-[0.2em] text-[#B69A67] font-semibold">
              GARANT SERVICE
            </p>
            <h2 id="adminTitle" className="font-display font-bold text-xl text-[#F1F0EC]">
              Панель администратора
            </h2>
          </div>

          <div className="flex items-center gap-2">
            {adminActive && (
              <button
                type="button"
                onClick={onLogout}
                className="glass-btn px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap"
              >
                <LogOut className="w-3.5 h-3.5 text-[#B69A67]" />
                <span>Выйти</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="Закрыть панель"
              className="glass-btn w-9 h-9 rounded-xl p-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Body */}
        {!adminActive ? (
          <div className="p-6 sm:p-7">
            <p className="text-sm text-[#96989D] mb-5">
              Введите учётные данные для доступа к статистике, заявкам, календарю и модерации
              отзывов.
            </p>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label
                  htmlFor="adminUsername"
                  className="block text-xs font-semibold text-[#96989D] mb-1.5"
                >
                  Логин
                </label>
                <input
                  id="adminUsername"
                  type="text"
                  autoComplete="username"
                  required
                  className="glass-input text-sm"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
              <div>
                <label
                  htmlFor="adminPassword"
                  className="block text-xs font-semibold text-[#96989D] mb-1.5"
                >
                  Пароль
                </label>
                <input
                  id="adminPassword"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="glass-input text-sm"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <button
                type="submit"
                className="glass-btn-gold w-full py-3 rounded-xl text-sm font-semibold mt-2"
              >
                Войти в панель
              </button>
            </form>
          </div>
        ) : (
          <>
            {/* Navigation Tabs */}
            <div className="px-5 sm:px-7 py-3 border-b border-white/[0.08] bg-[#111317]/60 flex items-center gap-2 overflow-x-auto luxury-scroll">
              {[
                { id: 'stats', label: 'Статистика', Icon: BarChart3 },
                { id: 'orders', label: `Заявки (${orders.length})`, Icon: ClipboardList },
                { id: 'calendar', label: 'Календарь', Icon: CalendarDays },
                { id: 'clients', label: `Клиенты (${clientsList.length})`, Icon: Users },
                {
                  id: 'reviews',
                  label: `Отзывы (${stats.pendingCount})`,
                  Icon: MessageSquare,
                },
              ].map(({ id, label, Icon }) => {
                const active = activeTab === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setActiveTab(id as AdminTab)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap shrink-0 flex items-center gap-2 transition-all ${
                      active ? 'glass-btn-gold text-[#F1F0EC]' : 'glass-btn text-[#96989D]'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 text-[#B69A67]" />
                    <span>{label}</span>
                  </button>
                );
              })}
            </div>

            {/* Tab Content */}
            <div className="p-5 sm:p-7 overflow-y-auto luxury-scroll flex-1 space-y-6">
              {ordersError && (
                <div className="rounded-xl border border-[#E06C75]/45 bg-[#E06C75]/10 px-4 py-3 text-xs sm:text-sm text-[#F1F0EC]">
                  {ordersError}
                </div>
              )}

              {/* TAB 1: STATS & CHARTS */}
              {activeTab === 'stats' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                    <div className="rounded-xl border border-white/[0.08] bg-[#08090B]/70 p-4">
                      <p className="text-xs text-[#96989D]">Всего заявок</p>
                      <p className="font-mono-num text-2xl sm:text-3xl font-semibold text-[#F1F0EC] mt-1">
                        {ordersLoading ? '…' : stats.total}
                      </p>
                    </div>
                    <div className="rounded-xl border border-white/[0.08] bg-[#08090B]/70 p-4">
                      <p className="text-xs text-[#96989D]">Новые и в работе</p>
                      <p className="font-mono-num text-2xl sm:text-3xl font-semibold text-[#B69A67] mt-1">
                        {ordersLoading ? '…' : stats.activeCount}
                      </p>
                    </div>
                    <div className="rounded-xl border border-white/[0.08] bg-[#08090B]/70 p-4">
                      <p className="text-xs text-[#96989D]">Выполнено</p>
                      <p className="font-mono-num text-2xl sm:text-3xl font-semibold text-[#F1F0EC] mt-1">
                        {ordersLoading ? '…' : stats.completedCount}
                      </p>
                    </div>
                    <div className="rounded-xl border border-white/[0.08] bg-[#08090B]/70 p-4">
                      <p className="text-xs text-[#96989D]">Средний рейтинг</p>
                      <div className="flex items-baseline gap-2 mt-1">
                        <span className="font-mono-num text-2xl sm:text-3xl font-semibold text-[#B69A67]">
                          {stats.avgRating}
                        </span>
                        <span className="text-xs text-[#96989D] font-mono-num">
                          ({stats.approvedCount} отз.)
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Charts Row */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Chart 1: Status Breakdown */}
                    <div className="rounded-xl border border-white/[0.08] bg-[#08090B]/70 p-5">
                      <h3 className="font-display font-semibold text-sm text-[#F1F0EC] mb-4">
                        Распределение заявок по статусам
                      </h3>
                      <div className="space-y-3.5">
                        {ORDER_STATUSES.map((st) => {
                          const count = stats.byStatus[st];
                          const pct = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
                          return (
                            <div key={st}>
                              <div className="flex justify-between text-xs mb-1.5">
                                <span className="text-[#F1F0EC]">{st}</span>
                                <span className="font-mono-num text-[#96989D]">
                                  {count} ({pct}%)
                                </span>
                              </div>
                              <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
                                <div
                                  className="h-full rounded-full bg-[#B69A67] transition-all duration-300"
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Chart 2: Service Popularity */}
                    <div className="rounded-xl border border-white/[0.08] bg-[#08090B]/70 p-5">
                      <h3 className="font-display font-semibold text-sm text-[#F1F0EC] mb-4">
                        Востребованность услуг
                      </h3>
                      {Object.keys(stats.byService).length === 0 ? (
                        <p className="text-xs text-[#96989D]">Нет данных для построения графика.</p>
                      ) : (
                        <div className="space-y-3.5">
                          {Object.entries(stats.byService)
                            .sort((a, b) => b[1] - a[1])
                            .map(([serviceName, count]) => {
                              const pct = Math.round((count / maxServiceCount) * 100);
                              return (
                                <div key={serviceName}>
                                  <div className="flex justify-between text-xs mb-1.5 gap-2">
                                    <span className="text-[#F1F0EC] truncate">{serviceName}</span>
                                    <span className="font-mono-num text-[#B69A67] shrink-0">
                                      {count}
                                    </span>
                                  </div>
                                  <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
                                    <div
                                      className="h-full rounded-full bg-gradient-to-r from-[#B69A67]/60 to-[#B69A67] transition-all duration-300"
                                      style={{ width: `${pct}%` }}
                                    />
                                  </div>
                                </div>
                              );
                            })}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: ORDERS LIST + SEARCH + FILTERS */}
              {activeTab === 'orders' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                    <div className="md:col-span-6 relative">
                      <Search className="w-4 h-4 text-[#96989D] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="search"
                        placeholder="Поиск по имени, телефону или авто…"
                        className="glass-input text-xs sm:text-sm pl-10"
                        value={orderSearch}
                        onChange={(e) => setOrderSearch(e.target.value)}
                      />
                    </div>
                    <div className="md:col-span-6">
                      <select
                        aria-label="Фильтр по услуге"
                        className="glass-input text-xs sm:text-sm"
                        value={serviceFilter}
                        onChange={(e) => setServiceFilter(e.target.value)}
                      >
                        <option value="Все">Все услуги</option>
                        {SERVICE_NAMES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {(['Все', ...ORDER_STATUSES] as const).map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => setStatusFilter(st)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
                          statusFilter === st ? 'glass-btn-gold' : 'glass-btn text-[#96989D]'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>

                  {ordersLoading ? (
                    <p className="text-sm text-[#96989D]">Загрузка заявок…</p>
                  ) : filteredOrders.length === 0 ? (
                    <p className="text-sm text-[#96989D]">Заявок по выбранным фильтрам нет.</p>
                  ) : (
                    <div className="space-y-3">
                      {filteredOrders.map(([id, o]) => (
                        <div
                          key={id}
                          className="rounded-xl border border-white/[0.08] bg-[#08090B]/70 p-4 space-y-3"
                        >
                          <div className="flex flex-wrap items-start justify-between gap-2">
                            <div>
                              <h4 className="font-display font-semibold text-base text-[#F1F0EC]">
                                {o.name || 'Без имени'} ·{' '}
                                <span className="text-[#B69A67]">{o.car || 'Авто не указано'}</span>
                              </h4>
                              <p className="text-xs text-[#96989D] mt-0.5 font-mono-num">
                                {o.phone || '—'} · {o.service || '—'} · {o.date || '—'} {o.time || ''}
                              </p>
                            </div>
                            <span className="text-xs font-semibold text-[#B69A67]">
                              {o.status || 'Новая'}
                            </span>
                          </div>

                          {o.comment && (
                            <p className="text-xs sm:text-sm text-[#F1F0EC]/80 border-t border-white/[0.06] pt-2.5">
                              {o.comment}
                            </p>
                          )}

                          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/[0.06]">
                            <div className="flex flex-wrap gap-1.5">
                              {ORDER_STATUSES.map((st) => (
                                <button
                                  key={st}
                                  type="button"
                                  onClick={() => handleOrderStatus(id, st)}
                                  className={`px-2.5 py-1.5 rounded-lg text-xs ${
                                    (o.status || 'Новая') === st
                                      ? 'glass-btn-gold text-[#F1F0EC]'
                                      : 'glass-btn text-[#96989D]'
                                  }`}
                                >
                                  {st}
                                </button>
                              ))}
                            </div>

                            {confirmDeleteOrderId === id ? (
                              <div className="flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => handleOrderDelete(id)}
                                  className="px-2.5 py-1.5 rounded-lg text-xs border border-[#E06C75]/50 bg-[#E06C75]/20 text-[#F1F0EC]"
                                >
                                  Подтвердить
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setConfirmDeleteOrderId(null)}
                                  className="glass-btn px-2.5 py-1.5 rounded-lg text-xs"
                                >
                                  Отмена
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setConfirmDeleteOrderId(id)}
                                className="glass-btn px-2.5 py-1.5 rounded-lg text-xs text-[#E06C75]"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Удалить</span>
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: CALENDAR */}
              {activeTab === 'calendar' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                  <div className="lg:col-span-7 rounded-xl border border-white/[0.08] bg-[#08090B]/70 p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-display font-semibold text-base capitalize text-[#F1F0EC]">
                        {calendarData.monthTitle}
                      </h3>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={prevMonth}
                          aria-label="Предыдущий месяц"
                          className="glass-btn w-8 h-8 rounded-lg p-0"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={nextMonth}
                          aria-label="Следующий месяц"
                          className="glass-btn w-8 h-8 rounded-lg p-0"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-7 gap-1.5 text-center text-[11px] text-[#96989D] mb-2">
                      {WEEKDAYS.map((wd) => (
                        <div key={wd} className="py-1">
                          {wd}
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-7 gap-1.5">
                      {calendarData.cells.map((cell, idx) => {
                        if (!cell) return <div key={`empty-${idx}`} />;
                        const dayBookings = calendarData.countsByDate[cell.iso] || [];
                        const isSelected = selectedDate === cell.iso;

                        return (
                          <button
                            key={cell.iso}
                            type="button"
                            onClick={() => setSelectedDate(cell.iso)}
                            className={`h-12 rounded-xl flex flex-col items-center justify-center text-xs font-mono-num transition-all ${
                              isSelected
                                ? 'glass-btn-gold text-[#F1F0EC] font-semibold'
                                : dayBookings.length > 0
                                  ? 'glass-btn border-[#B69A67]/30 text-[#F1F0EC]'
                                  : 'bg-white/[0.02] border border-white/[0.05] text-[#96989D] hover:border-white/20'
                            }`}
                          >
                            <span>{cell.day}</span>
                            {dayBookings.length > 0 && (
                              <span className="text-[10px] text-[#B69A67] leading-none mt-0.5">
                                {dayBookings.length} зап.
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="lg:col-span-5 rounded-xl border border-white/[0.08] bg-[#08090B]/70 p-4 flex flex-col">
                    <h3 className="font-display font-semibold text-sm text-[#F1F0EC] mb-3">
                      Расписание на <span className="font-mono-num text-[#B69A67]">{selectedDate}</span>
                    </h3>
                    {selectedDayOrders.length === 0 ? (
                      <p className="text-xs text-[#96989D]">На выбранную дату записей нет.</p>
                    ) : (
                      <div className="space-y-2.5 overflow-y-auto max-h-80 luxury-scroll">
                        {selectedDayOrders.map(([id, o]) => (
                          <div
                            key={id}
                            className="rounded-xl border border-white/[0.08] bg-[#111317] p-3 text-xs space-y-1"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-mono-num font-semibold text-[#B69A67]">
                                {o.time || '—'}
                              </span>
                              <span className="text-[#96989D]">{o.status || 'Новая'}</span>
                            </div>
                            <p className="font-semibold text-[#F1F0EC]">{o.name}</p>
                            <p className="text-[#96989D]">
                              {o.car} · {o.service}
                            </p>
                            <p className="font-mono-num text-[#96989D]">{o.phone}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 4: CLIENTS */}
              {activeTab === 'clients' && (
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="w-4 h-4 text-[#96989D] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="search"
                      placeholder="Поиск клиента по имени, телефону или марке автомобиля…"
                      className="glass-input text-xs sm:text-sm pl-10"
                      value={clientSearch}
                      onChange={(e) => setClientSearch(e.target.value)}
                    />
                  </div>

                  {clientsList.length === 0 ? (
                    <p className="text-sm text-[#96989D]">Клиенты по данным заявок не найдены.</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {clientsList.map((client) => (
                        <div
                          key={client.key}
                          className="rounded-xl border border-white/[0.08] bg-[#08090B]/70 p-4 space-y-2"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h4 className="font-display font-semibold text-base text-[#F1F0EC]">
                                {client.name}
                              </h4>
                              <p className="text-xs font-mono-num text-[#B69A67]">{client.phone}</p>
                            </div>
                            <span className="text-xs font-mono-num text-[#96989D]">
                              Визитов: {client.visits}
                            </span>
                          </div>
                          <p className="text-xs text-[#F1F0EC]/85">
                            Авто: {Array.from(client.cars).join(', ') || '—'}
                          </p>
                          <p className="text-xs text-[#96989D]">
                            Услуги: {Array.from(client.services).join(', ') || '—'}
                          </p>
                          {client.lastDate && (
                            <p className="text-[11px] font-mono-num text-[#96989D]">
                              Последняя запись: {client.lastDate}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 5: REVIEWS MODERATION & ADMIN REPLIES */}
              {activeTab === 'reviews' && (
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {[
                      { id: 'pending', label: 'На проверке' },
                      { id: 'approved', label: 'Опубликованные' },
                      { id: 'rejected', label: 'Отклонённые' },
                    ].map((rf) => (
                      <button
                        key={rf.id}
                        type="button"
                        onClick={() => setReviewFilter(rf.id as ReviewFilter)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
                          reviewFilter === rf.id ? 'glass-btn-gold' : 'glass-btn text-[#96989D]'
                        }`}
                      >
                        {rf.label}
                      </button>
                    ))}
                  </div>

                  {filteredReviews.length === 0 ? (
                    <p className="text-sm text-[#96989D]">Отзывов в этой категории нет.</p>
                  ) : (
                    <div className="space-y-3">
                      {filteredReviews.map(([id, r]) => {
                        const count = Math.max(0, Math.min(5, Number(r.rating) || 0));
                        const draftValue = replyDrafts[id] ?? r.adminReply ?? '';

                        return (
                          <div
                            key={id}
                            className="rounded-xl border border-white/[0.08] bg-[#08090B]/70 p-4 space-y-3"
                          >
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <div>
                                <strong className="font-display text-sm sm:text-base text-[#F1F0EC]">
                                  {r.name || 'Клиент'}
                                </strong>
                                <span className="ml-2 text-xs font-mono-num text-[#96989D]">
                                  {formatDateRu(r.createdAt)}
                                </span>
                              </div>
                              <div className="flex items-center gap-0.5">
                                {[1, 2, 3, 4, 5].map((s) => (
                                  <Star
                                    key={s}
                                    className={`w-3.5 h-3.5 ${
                                      s <= count
                                        ? 'text-[#B69A67] fill-[#B69A67]'
                                        : 'text-[#96989D]/30'
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>

                            <p className="text-xs sm:text-sm text-[#F1F0EC]/90">{r.text || ''}</p>

                            {/* Admin Reply Editor */}
                            <div className="pt-2 border-t border-white/[0.06] space-y-2">
                              <label
                                htmlFor={`reply-${id}`}
                                className="block text-[11px] font-semibold text-[#B69A67]"
                              >
                                Ответ администрации
                              </label>
                              <div className="flex flex-col sm:flex-row gap-2">
                                <input
                                  id={`reply-${id}`}
                                  type="text"
                                  maxLength={500}
                                  placeholder="Напишите официальный ответ от Garant Service…"
                                  className="glass-input text-xs py-2"
                                  value={draftValue}
                                  onChange={(e) =>
                                    setReplyDrafts((prev) => ({ ...prev, [id]: e.target.value }))
                                  }
                                />
                                <button
                                  type="button"
                                  disabled={replySavingId === id}
                                  onClick={() => handleSaveReply(id, r.adminReply)}
                                  className="glass-btn-gold px-4 py-2 rounded-xl text-xs font-medium whitespace-nowrap shrink-0"
                                >
                                  {replySavingId === id ? 'Сохраняем…' : 'Сохранить ответ'}
                                </button>
                              </div>
                            </div>

                            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/[0.06]">
                              <div className="flex flex-wrap gap-1.5">
                                {r.status !== 'approved' && (
                                  <button
                                    type="button"
                                    onClick={() => handleModerateReview(id, 'approved')}
                                    className="glass-btn-gold px-3 py-1.5 rounded-lg text-xs"
                                  >
                                    Одобрить
                                  </button>
                                )}
                                {r.status !== 'rejected' && (
                                  <button
                                    type="button"
                                    onClick={() => handleModerateReview(id, 'rejected')}
                                    className="glass-btn px-3 py-1.5 rounded-lg text-xs"
                                  >
                                    Отклонить
                                  </button>
                                )}
                              </div>

                              {confirmDeleteReviewId === id ? (
                                <div className="flex items-center gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteReview(id)}
                                    className="px-2.5 py-1.5 rounded-lg text-xs border border-[#E06C75]/50 bg-[#E06C75]/20 text-[#F1F0EC]"
                                  >
                                    Подтвердить
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setConfirmDeleteReviewId(null)}
                                    className="glass-btn px-2.5 py-1.5 rounded-lg text-xs"
                                  >
                                    Отмена
                                  </button>
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => setConfirmDeleteReviewId(id)}
                                  className="glass-btn px-2.5 py-1.5 rounded-lg text-xs text-[#E06C75]"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  <span>Удалить</span>
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

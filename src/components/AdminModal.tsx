import { useState, type FormEvent } from 'react';
import {
  deleteOrder,
  deleteReview,
  moderateReview,
  updateOrderStatus,
} from '../services/firebase';
import type { Order, OrderStatus, Review } from '../types';

const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = '202';
const ORDER_STATUSES: OrderStatus[] = ['Новая', 'Подтверждена', 'Выполнено', 'Отменена'];

interface AdminModalProps {
  isOpen: boolean;
  adminActive: boolean;
  orders: Array<[string, Order]>;
  ordersLoading: boolean;
  ordersError: string | null;
  pendingReviews: Array<[string, Review]>;
  onClose: () => void;
  onLoginSuccess: () => void;
  onLogout: () => void;
  onSync: () => void;
  onToast: (message: string) => void;
}

export function AdminModal({
  isOpen,
  adminActive,
  orders,
  ordersLoading,
  ordersError,
  pendingReviews,
  onClose,
  onLoginSuccess,
  onLogout,
  onSync,
  onToast,
}: AdminModalProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

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

  const handleDeleteReview = async (id: string) => {
    try {
      await deleteReview(id);
      onToast('Отзыв удалён.');
      onSync();
    } catch {
      onToast('Не удалось удалить отзыв.');
    }
  };

  return (
    <div
      className={`modal ${isOpen ? 'show' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="adminTitle"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modalbox">
        <div className="modalhead">
          <h2 id="adminTitle">Панель разработчика</h2>
          <button className="btn" type="button" onClick={onClose}>
            Закрыть
          </button>
        </div>

        {!adminActive ? (
          <div>
            <p className="muted">Введите данные для входа в панель управления.</p>
            <form onSubmit={handleLogin}>
              <label className="gs-label" htmlFor="adminUsername">
                Логин
              </label>
              <input
                className="gs-input"
                id="adminUsername"
                type="text"
                autoComplete="username"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              <label className="gs-label" htmlFor="adminPassword">
                Пароль
              </label>
              <input
                className="gs-input"
                id="adminPassword"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button className="btn primary admin-submit" type="submit">
                Войти
              </button>
            </form>
          </div>
        ) : (
          <div>
            <div className="admin-header-bar">
              <p className="muted">Панель управления</p>
              <button className="btn" type="button" onClick={onLogout}>
                Выйти
              </button>
            </div>

            <h3>Заявки</h3>
            <div className="admin-list">
              {ordersLoading ? (
                'Загрузка…'
              ) : ordersError ? (
                ordersError
              ) : orders.length === 0 ? (
                'Заявок пока нет.'
              ) : (
                orders.map(([id, o]) => (
                  <div className="admin-item" key={id}>
                    <strong>
                      {o.name || 'Без имени'} · {o.car || 'Авто не указано'}
                    </strong>
                    <p>
                      {o.phone || ''} | {o.service || ''} | {o.date || ''} {o.time || ''}
                    </p>
                    <p className="status">Статус: {o.status || 'Новая'}</p>
                    {o.comment ? <p className="muted">{o.comment}</p> : null}
                    {ORDER_STATUSES.map((st) => (
                      <button
                        key={st}
                        className="btn"
                        type="button"
                        onClick={() => handleOrderStatus(id, st)}
                      >
                        {st}
                      </button>
                    ))}
                    <button
                      className="btn"
                      type="button"
                      onClick={() => handleOrderDelete(id)}
                    >
                      Удалить
                    </button>
                  </div>
                ))
              )}
            </div>

            <h3>Отзывы на проверке</h3>
            <div className="admin-list">
              {pendingReviews.length === 0 ? (
                'Отзывов на проверке нет.'
              ) : (
                pendingReviews.map(([id, r]) => {
                  const count = Math.max(0, Math.min(5, Number(r.rating) || 0));
                  return (
                    <div className="admin-item" key={id}>
                      <strong>
                        {r.name || 'Клиент'} · {'★'.repeat(count)}
                      </strong>
                      <p>{r.text || ''}</p>
                      <button
                        className="btn"
                        type="button"
                        onClick={() => handleModerateReview(id, 'approved')}
                      >
                        Одобрить
                      </button>
                      <button
                        className="btn"
                        type="button"
                        onClick={() => handleModerateReview(id, 'rejected')}
                      >
                        Отклонить
                      </button>
                      <button
                        className="btn"
                        type="button"
                        onClick={() => handleDeleteReview(id)}
                      >
                        Удалить
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

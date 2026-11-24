import { useState, type FormEvent } from 'react';
import { createOrder } from '../services/firebase';

const SERVICES = [
  'Замена масла',
  'Замена фильтров',
  'Диагностика',
  'Техническое обслуживание',
  'Другое',
];

const TIME_SLOTS = [
  '09:00',
  '10:00',
  '11:00',
  '12:00',
  '13:00',
  '14:00',
  '15:00',
  '16:00',
  '17:00',
  '18:00',
];

function todayLocal(): string {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
}

interface BookingFormProps {
  onToast: (message: string) => void;
  onOrderCreated: () => void;
}

export function BookingForm({ onToast, onOrderCreated }: BookingFormProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [car, setCar] = useState('');
  const [service, setService] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const minDate = todayLocal();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const order = {
      name: name.trim(),
      phone: phone.trim(),
      car: car.trim(),
      service,
      date,
      time,
      comment: comment.trim(),
      status: 'Новая' as const,
      createdAt: Date.now(),
    };

    if (!order.name || !order.phone || !order.car || !order.service || !order.date || !order.time) {
      onToast('Заполните все обязательные поля.');
      return;
    }

    setSubmitting(true);
    try {
      await createOrder(order);
      setName('');
      setPhone('');
      setCar('');
      setService('');
      setDate('');
      setTime('');
      setComment('');
      onToast('Заявка отправлена! Мы свяжемся с вами для подтверждения.');
      onOrderCreated();
    } catch {
      onToast('Firebase отклонил запись или нет сети. Проверьте правила базы данных.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="card" id="booking">
      <div className="eyebrow">ОНЛАЙН-ЗАПИСЬ</div>
      <h2>Записаться на обслуживание</h2>
      <p className="muted">Заполните данные — заявка отправится в нашу базу.</p>
      <form onSubmit={handleSubmit}>
        <label className="gs-label" htmlFor="clientName">
          Ваше имя
        </label>
        <input
          className="gs-input"
          id="clientName"
          maxLength={70}
          required
          autoComplete="name"
          placeholder="Ваше имя"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <div className="row">
          <div>
            <label className="gs-label" htmlFor="phone">
              Телефон
            </label>
            <input
              className="gs-input"
              id="phone"
              required
              maxLength={25}
              autoComplete="tel"
              placeholder="+996 …"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          <div>
            <label className="gs-label" htmlFor="car">
              Марка и модель
            </label>
            <input
              className="gs-input"
              id="car"
              required
              maxLength={80}
              placeholder="Toyota Camry"
              value={car}
              onChange={(e) => setCar(e.target.value)}
            />
          </div>
        </div>

        <label className="gs-label" htmlFor="service">
          Услуга
        </label>
        <select
          className="gs-select"
          id="service"
          required
          value={service}
          onChange={(e) => setService(e.target.value)}
        >
          <option value="">Выберите услугу</option>
          {SERVICES.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>

        <div className="row">
          <div>
            <label className="gs-label" htmlFor="date">
              Дата
            </label>
            <input
              className="gs-input"
              id="date"
              type="date"
              min={minDate}
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <div>
            <label className="gs-label" htmlFor="time">
              Время
            </label>
            <select
              className="gs-select"
              id="time"
              required
              value={time}
              onChange={(e) => setTime(e.target.value)}
            >
              <option value="">Выберите время</option>
              {TIME_SLOTS.map((slot) => (
                <option key={slot} value={slot}>
                  {slot}
                </option>
              ))}
            </select>
          </div>
        </div>

        <label className="gs-label" htmlFor="comment">
          Комментарий (необязательно)
        </label>
        <textarea
          className="gs-textarea"
          id="comment"
          rows={3}
          maxLength={500}
          placeholder="Дополнительная информация"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />

        <div className="form-actions">
          <button className="btn primary" type="submit" disabled={submitting}>
            {submitting ? 'Отправляем…' : 'Отправить заявку'}
          </button>
        </div>
        <div className="notice">
          Отправляя форму, вы соглашаетесь на обработку указанных данных для связи по заявке.
        </div>
      </form>
    </div>
  );
}

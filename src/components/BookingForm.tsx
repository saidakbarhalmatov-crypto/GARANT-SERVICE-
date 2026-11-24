import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Calendar, CheckCircle2, Clock, Send, ShieldCheck } from 'lucide-react';
import { SERVICE_NAMES } from '../data/services';
import { createOrder } from '../services/firebase';

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

function formatDateOffset(daysOffset: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
}

function isValidPhone(raw: string): boolean {
  const digits = raw.replace(/\D/g, '');
  return digits.length >= 9 && digits.length <= 15;
}

interface BookingFormProps {
  selectedService: string;
  onServiceChange: (service: string) => void;
  onToast: (message: string) => void;
  onOrderCreated: () => void;
}

export function BookingForm({
  selectedService,
  onServiceChange,
  onToast,
  onOrderCreated,
}: BookingFormProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [car, setCar] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successOrder, setSuccessOrder] = useState<{
    name: string;
    date: string;
    time: string;
    service: string;
  } | null>(null);

  const submitLockRef = useRef(false);

  useEffect(() => {
    if (selectedService) {
      setErrorMsg(null);
    }
  }, [selectedService]);

  const minDate = formatDateOffset(0);
  const quickDates = [
    { label: 'Сегодня', value: formatDateOffset(0) },
    { label: 'Завтра', value: formatDateOffset(1) },
    { label: 'Послезавтра', value: formatDateOffset(2) },
  ];

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (submitLockRef.current || submitting) return;

    const trimmedName = name.trim();
    const trimmedPhone = phone.trim();
    const trimmedCar = car.trim();
    const trimmedComment = comment.trim();

    if (!trimmedName || !trimmedPhone || !trimmedCar || !selectedService || !date || !time) {
      const msg = 'Пожалуйста, заполните все обязательные поля и выберите дату со временем.';
      setErrorMsg(msg);
      onToast(msg);
      return;
    }

    if (!isValidPhone(trimmedPhone)) {
      const msg = 'Проверьте номер телефона (минимум 9 цифр, например +996 552 202 215).';
      setErrorMsg(msg);
      onToast(msg);
      return;
    }

    if (date < minDate) {
      const msg = 'Выберите сегодняшнюю или будущую дату.';
      setErrorMsg(msg);
      onToast(msg);
      return;
    }

    setErrorMsg(null);
    submitLockRef.current = true;
    setSubmitting(true);

    try {
      await createOrder({
        name: trimmedName,
        phone: trimmedPhone,
        car: trimmedCar,
        service: selectedService,
        date,
        time,
        comment: trimmedComment,
        status: 'Новая',
        createdAt: Date.now(),
      });

      setSuccessOrder({
        name: trimmedName,
        date,
        time,
        service: selectedService,
      });

      setName('');
      setPhone('');
      setCar('');
      onServiceChange('');
      setDate('');
      setTime('');
      setComment('');
      onToast('Заявка отправлена! Мы свяжемся с вами для подтверждения.');
      onOrderCreated();
    } catch {
      const msg = 'Firebase отклонил запись или нет сети. Проверьте соединение.';
      setErrorMsg(msg);
      onToast(msg);
    } finally {
      setSubmitting(false);
      window.setTimeout(() => {
        submitLockRef.current = false;
      }, 1200);
    }
  };

  return (
    <section id="booking" className="py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-start">
          <div className="lg:col-span-5">
            <p className="text-xs tracking-[0.2em] text-[#B69A67] font-semibold mb-1.5">
              ОНЛАЙН-ЗАПИСЬ
            </p>
            <h2 className="font-display font-bold text-2xl sm:text-3xl text-[#F1F0EC] mb-3">
              Запись на обслуживание
            </h2>
            <p className="text-xs sm:text-sm text-[#96989D] leading-relaxed mb-5">
              Укажите марку вашего автомобиля, выберите удобную дату и время — администратор
              подтвердит запись по телефону или WhatsApp.
            </p>

            <div className="glass-surface rounded-2xl p-5 space-y-4">
              <div className="flex items-start gap-3">
                <Calendar className="w-4 h-4 text-[#B69A67] shrink-0 mt-0.5" strokeWidth={1.6} />
                <div>
                  <p className="text-xs sm:text-sm font-semibold text-[#F1F0EC]">
                    Ежедневно с 09:00 до 18:00
                  </p>
                  <p className="text-xs text-[#96989D] mt-0.5">
                    Работаем с автомобилями любых марок и моделей.
                  </p>
                </div>
              </div>
              <div className="border-t border-white/[0.07]" />
              <div className="flex items-start gap-3">
                <ShieldCheck className="w-4 h-4 text-[#B69A67] shrink-0 mt-0.5" strokeWidth={1.6} />
                <div>
                  <p className="text-xs sm:text-sm font-semibold text-[#F1F0EC]">
                    Прямая отправка в базу
                  </p>
                  <p className="text-xs text-[#96989D] mt-0.5">
                    Заявка сразу сохраняется в системе с защитой от повторной отправки.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="glass-surface rounded-2xl p-5 sm:p-7">
              {successOrder && (
                <div className="mb-5 rounded-xl border border-[#B69A67]/40 bg-[#B69A67]/[0.08] p-4 flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-[#B69A67] shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-semibold text-[#F1F0EC]">
                      Заявка принята, {successOrder.name}
                    </p>
                    <p className="text-[#96989D] text-xs mt-1">
                      {successOrder.service} ·{' '}
                      <span className="font-mono-num text-[#F1F0EC]">
                        {successOrder.date} в {successOrder.time}
                      </span>
                    </p>
                  </div>
                </div>
              )}

              {errorMsg && (
                <div
                  role="alert"
                  className="mb-4 rounded-xl border border-[#E06C75]/45 bg-[#E06C75]/10 px-4 py-3 text-xs sm:text-sm text-[#F1F0EC]"
                >
                  {errorMsg}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label
                      htmlFor="clientName"
                      className="block text-xs font-semibold text-[#96989D] mb-1.5"
                    >
                      Ваше имя
                    </label>
                    <input
                      id="clientName"
                      className="glass-input text-sm"
                      maxLength={70}
                      required
                      autoComplete="name"
                      placeholder="Ваше имя"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="phone"
                      className="block text-xs font-semibold text-[#96989D] mb-1.5"
                    >
                      Телефон
                    </label>
                    <input
                      id="phone"
                      type="tel"
                      className="glass-input text-sm font-mono-num"
                      maxLength={25}
                      required
                      autoComplete="tel"
                      placeholder="+996 552 …"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label
                      htmlFor="car"
                      className="block text-xs font-semibold text-[#96989D] mb-1.5"
                    >
                      Марка и модель автомобиля
                    </label>
                    <input
                      id="car"
                      className="glass-input text-sm"
                      maxLength={80}
                      required
                      placeholder="Toyota Camry, Mercedes W210, Kia K5…"
                      value={car}
                      onChange={(e) => setCar(e.target.value)}
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="service"
                      className="block text-xs font-semibold text-[#96989D] mb-1.5"
                    >
                      Услуга
                    </label>
                    <select
                      id="service"
                      className="glass-input text-sm"
                      required
                      value={selectedService}
                      onChange={(e) => onServiceChange(e.target.value)}
                    >
                      <option value="">Выберите услугу</option>
                      {SERVICE_NAMES.map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                    <label htmlFor="date" className="text-xs font-semibold text-[#96989D]">
                      Дата визита
                    </label>
                    <div className="flex items-center gap-1.5">
                      {quickDates.map((qd) => (
                        <button
                          key={qd.value}
                          type="button"
                          onClick={() => setDate(qd.value)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                            date === qd.value
                              ? 'glass-btn-gold text-[#F1F0EC]'
                              : 'glass-btn text-[#96989D]'
                          }`}
                        >
                          {qd.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <input
                    id="date"
                    type="date"
                    min={minDate}
                    required
                    className="glass-input text-sm font-mono-num"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-semibold text-[#96989D] flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#B69A67]" strokeWidth={1.75} />
                      Время визита
                    </span>
                    {time && (
                      <span className="text-xs font-mono-num text-[#B69A67]">
                        Выбрано: {time}
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-5 gap-2">
                    {TIME_SLOTS.map((slot) => {
                      const active = time === slot;
                      return (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => setTime(slot)}
                          aria-pressed={active}
                          className={`py-2 rounded-xl text-xs font-mono-num transition-all ${
                            active
                              ? 'glass-btn-gold text-[#F1F0EC] font-semibold'
                              : 'glass-btn text-[#96989D] hover:text-[#F1F0EC]'
                          }`}
                        >
                          {slot}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="comment"
                    className="block text-xs font-semibold text-[#96989D] mb-1.5"
                  >
                    Комментарий (необязательно)
                  </label>
                  <textarea
                    id="comment"
                    rows={2}
                    maxLength={500}
                    className="glass-input text-sm resize-none"
                    placeholder="Дополнительная информация или вопросы к мастеру"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                  />
                </div>

                <div className="pt-1 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="glass-btn-gold px-6 py-3 rounded-xl text-sm font-semibold whitespace-nowrap"
                  >
                    <Send className="w-4 h-4 text-[#B69A67]" strokeWidth={1.75} />
                    <span>{submitting ? 'Отправляем…' : 'Отправить заявку'}</span>
                  </button>
                  <p className="text-[11px] text-[#96989D] leading-snug max-w-xs">
                    Отправляя форму, вы соглашаетесь на обработку данных для связи по заявке.
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

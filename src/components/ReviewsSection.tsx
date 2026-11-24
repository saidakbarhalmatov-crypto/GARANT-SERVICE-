import { useRef, useState, type FormEvent } from 'react';
import { MessageSquareQuote, Send, Star } from 'lucide-react';
import { createReview } from '../services/firebase';
import type { Review } from '../types';

interface ReviewsSectionProps {
  reviews: Array<[string, Review]>;
  loading: boolean;
  onToast: (message: string) => void;
  onReviewSubmitted: () => void;
}

const STAR_VALUES = [1, 2, 3, 4, 5];

function formatReviewDate(timestamp?: number): string {
  if (!timestamp) return '';
  try {
    return new Intl.DateTimeFormat('ru-RU', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(new Date(timestamp));
  } catch {
    return '';
  }
}

export function ReviewsSection({
  reviews,
  loading,
  onToast,
  onReviewSubmitted,
}: ReviewsSectionProps) {
  const [name, setName] = useState('');
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const submitLockRef = useRef(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (submitLockRef.current || submitting) return;

    if (!rating) {
      onToast('Пожалуйста, выберите оценку.');
      return;
    }

    const trimmedName = name.trim();
    const trimmedText = text.trim();
    if (!trimmedName || !trimmedText) {
      onToast('Заполните имя и текст отзыва.');
      return;
    }

    submitLockRef.current = true;
    setSubmitting(true);

    try {
      await createReview({
        name: trimmedName,
        rating,
        text: trimmedText,
        status: 'pending',
        createdAt: Date.now(),
      });
      setName('');
      setRating(0);
      setHoveredRating(0);
      setText('');
      onToast('Спасибо! Отзыв отправлен на проверку.');
      onReviewSubmitted();
    } catch {
      onToast('Firebase отклонил отзыв или нет сети. Проверьте правила базы данных.');
    } finally {
      setSubmitting(false);
      window.setTimeout(() => {
        submitLockRef.current = false;
      }, 1200);
    }
  };

  const displayStars = hoveredRating || rating;

  return (
    <section id="reviews" className="py-16 sm:py-24 bg-[#111317] border-b border-white/[0.06]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10 sm:mb-12">
          <p className="text-xs tracking-[0.22em] text-[#B69A67] font-semibold mb-2">
            ОТЗЫВЫ КЛИЕНТОВ
          </p>
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-[#F1F0EC] text-balance">
            Впечатления о сервисе
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Review Submission Card */}
          <div className="lg:col-span-5 glass-surface rounded-2xl p-6 sm:p-8">
            <h3 className="font-display font-semibold text-xl text-[#F1F0EC] mb-1">
              Оставить отзыв
            </h3>
            <p className="text-xs sm:text-sm text-[#96989D] mb-6">
              Оценка и комментарий появятся на сайте после проверки администратором.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="reviewName"
                  className="block text-xs font-semibold text-[#96989D] mb-2"
                >
                  Имя
                </label>
                <input
                  id="reviewName"
                  className="glass-input text-sm"
                  maxLength={70}
                  required
                  placeholder="Ваше имя"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div>
                <span className="block text-xs font-semibold text-[#96989D] mb-2">
                  Ваша оценка
                </span>
                <div
                  className="flex items-center gap-1.5"
                  role="group"
                  aria-label="Оценка от 1 до 5"
                  onMouseLeave={() => setHoveredRating(0)}
                >
                  {STAR_VALUES.map((star) => {
                    const active = star <= displayStars;
                    return (
                      <button
                        key={star}
                        type="button"
                        onMouseEnter={() => setHoveredRating(star)}
                        onClick={() => setRating(star)}
                        aria-label={`${star} из 5`}
                        className="p-1.5 rounded-lg transition-transform hover:scale-110 active:scale-95"
                      >
                        <Star
                          className={`w-6 h-6 transition-colors ${
                            active
                              ? 'text-[#B69A67] fill-[#B69A67]'
                              : 'text-[#96989D]/40'
                          }`}
                          strokeWidth={1.6}
                        />
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label
                  htmlFor="reviewText"
                  className="block text-xs font-semibold text-[#96989D] mb-2"
                >
                  Отзыв
                </label>
                <textarea
                  id="reviewText"
                  rows={4}
                  maxLength={700}
                  required
                  className="glass-input text-sm resize-none"
                  placeholder="Расскажите о вашем опыте обслуживания"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="glass-btn-gold w-full py-3 rounded-xl text-sm font-semibold"
              >
                <Send className="w-4 h-4 text-[#B69A67]" strokeWidth={1.75} />
                <span>{submitting ? 'Отправляем…' : 'Отправить отзыв'}</span>
              </button>
            </form>
          </div>

          {/* Approved Reviews Feed */}
          <div className="lg:col-span-7 space-y-4">
            {loading ? (
              <div className="glass-surface rounded-2xl p-8 text-sm text-[#96989D]">
                Загружаем опубликованные отзывы…
              </div>
            ) : reviews.length === 0 ? (
              <div className="glass-surface rounded-2xl p-8 text-sm text-[#96989D]">
                Пока нет опубликованных отзывов. Будьте первым, кто поделится впечатлением.
              </div>
            ) : (
              reviews.slice(0, 20).map(([id, r]) => {
                const count = Math.max(0, Math.min(5, Number(r.rating) || 0));
                const formattedDate = formatReviewDate(r.createdAt);

                return (
                  <article key={id} className="glass-surface rounded-2xl p-6">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                      <div>
                        <h4 className="font-display font-semibold text-base sm:text-lg text-[#F1F0EC]">
                          {r.name || 'Клиент'}
                        </h4>
                        {formattedDate && (
                          <p className="text-xs font-mono-num text-[#96989D]">{formattedDate}</p>
                        )}
                      </div>

                      <div className="flex items-center gap-1" aria-label={`Оценка ${count} из 5`}>
                        {STAR_VALUES.map((star) => (
                          <Star
                            key={star}
                            className={`w-4 h-4 ${
                              star <= count
                                ? 'text-[#B69A67] fill-[#B69A67]'
                                : 'text-[#96989D]/25'
                            }`}
                            strokeWidth={1.6}
                          />
                        ))}
                      </div>
                    </div>

                    <p className="text-sm sm:text-[15px] text-[#F1F0EC]/90 leading-relaxed">
                      {r.text || ''}
                    </p>

                    {r.adminReply && (
                      <div className="mt-4 pt-4 border-t border-white/[0.08] flex items-start gap-3">
                        <MessageSquareQuote
                          className="w-4 h-4 text-[#B69A67] shrink-0 mt-0.5"
                          strokeWidth={1.75}
                        />
                        <div className="text-xs sm:text-sm">
                          <div className="flex items-center gap-2 text-[#B69A67] font-semibold mb-1">
                            <span>Ответ Garant Service</span>
                            {r.adminRepliedAt && (
                              <>
                                <span aria-hidden="true" className="text-[#96989D]">·</span>
                                <span className="font-mono-num text-[11px] font-normal text-[#96989D]">
                                  {formatReviewDate(r.adminRepliedAt)}
                                </span>
                              </>
                            )}
                          </div>
                          <p className="text-[#96989D] leading-relaxed">{r.adminReply}</p>
                        </div>
                      </div>
                    )}
                  </article>
                );
              })
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

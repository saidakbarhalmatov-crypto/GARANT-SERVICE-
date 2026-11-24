import { useState, type FormEvent } from 'react';
import { createReview } from '../services/firebase';
import type { Review } from '../types';

interface ReviewsSectionProps {
  reviews: Array<[string, Review]>;
  loading: boolean;
  onToast: (message: string) => void;
  onReviewSubmitted: () => void;
}

const STAR_VALUES = [1, 2, 3, 4, 5];

export function ReviewsSection({
  reviews,
  loading,
  onToast,
  onReviewSubmitted,
}: ReviewsSectionProps) {
  const [name, setName] = useState('');
  const [rating, setRating] = useState(0);
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!rating) {
      onToast('Пожалуйста, выберите оценку.');
      return;
    }

    const review: Review = {
      name: name.trim(),
      rating,
      text: text.trim(),
      status: 'pending',
      createdAt: Date.now(),
    };

    if (!review.name || !review.text) {
      onToast('Заполните имя и текст отзыва.');
      return;
    }

    setSubmitting(true);
    try {
      await createReview(review);
      setName('');
      setRating(0);
      setText('');
      onToast('Спасибо! Отзыв отправлен на проверку.');
      onReviewSubmitted();
    } catch {
      onToast('Firebase отклонил отзыв или нет сети. Проверьте правила базы данных.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="card">
      <div className="eyebrow">ОТЗЫВЫ КЛИЕНТОВ</div>
      <h2>Поделитесь впечатлением</h2>
      <p className="muted">Оставьте оценку и короткий отзыв.</p>
      <form onSubmit={handleSubmit}>
        <label className="gs-label" htmlFor="reviewName">
          Имя
        </label>
        <input
          className="gs-input"
          id="reviewName"
          maxLength={70}
          required
          placeholder="Ваше имя"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <label className="gs-label">Ваша оценка</label>
        <div className="stars" aria-label="Оценка от 1 до 5">
          {STAR_VALUES.map((star) => (
            <button
              key={star}
              type="button"
              className={`star ${star <= rating ? 'active' : ''}`}
              aria-label={`${star} ${star === 1 ? 'звезда' : star < 5 ? 'звезды' : 'звёзд'}`}
              onClick={() => setRating(star)}
            >
              ★
            </button>
          ))}
        </div>

        <label className="gs-label" htmlFor="reviewText">
          Отзыв
        </label>
        <textarea
          className="gs-textarea"
          id="reviewText"
          rows={4}
          maxLength={700}
          required
          placeholder="Расскажите о вашем опыте"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />

        <button className="btn primary" type="submit" disabled={submitting}>
          {submitting ? 'Отправляем…' : 'Отправить отзыв'}
        </button>
        <p className="notice">Отзыв появится после проверки администратором.</p>
      </form>

      <div className="reviews-wrap">
        <h2 className="reviews-heading">Опубликованные отзывы</h2>
        <div>
          {loading ? (
            <p className="muted">Загружаем отзывы…</p>
          ) : reviews.length === 0 ? (
            <p className="muted">Пока нет опубликованных отзывов.</p>
          ) : (
            reviews.slice(0, 20).map(([id, r]) => {
              const count = Math.max(0, Math.min(5, Number(r.rating) || 0));
              return (
                <div className="review" key={id}>
                  <div>
                    <strong>{r.name || 'Клиент'}</strong>
                    <span className="review-stars">{'★'.repeat(count)}</span>
                  </div>
                  <p>{r.text || ''}</p>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

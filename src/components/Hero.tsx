import { useState } from 'react';
import { ArrowUpRight, ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { HERO_SLIDES } from '../data/services';
import type { ConnectionState, Review } from '../types';
import type { SectionTab } from './Header';
import { ResilientImage } from './ResilientImage';

interface HeroProps {
  connectionState: ConnectionState;
  approvedReviews: Array<[string, Review]>;
  onNavigate: (target: SectionTab) => void;
}

const ADVANTAGES = [
  {
    index: '01',
    title: 'Обслуживаем автомобили любых марок',
    detail: 'Замена масла, фильтров и ТО на седаны, кроссоверы и классические Mercedes-Benz W210.',
  },
  {
    index: '02',
    title: 'Консультация с мастером до ремонта',
    detail: 'Честный осмотр, диагностика и согласование всех работ заранее.',
  },
  {
    index: '03',
    title: 'Точная онлайн-запись без очередей',
    detail: 'Фиксированное время визита с быстрым подтверждением.',
  },
];

export function Hero({ connectionState, approvedReviews, onNavigate }: HeroProps) {
  const [slideIndex, setSlideIndex] = useState(0);
  const currentSlide = HERO_SLIDES[slideIndex];

  const reviewCount = approvedReviews.length;
  const averageRating =
    reviewCount > 0
      ? (
          approvedReviews.reduce(
            (sum, [, r]) => sum + Math.max(1, Math.min(5, Number(r.rating) || 0)),
            0
          ) / reviewCount
        ).toFixed(1)
      : null;

  const connectionLabel =
    connectionState === 'connected'
      ? 'База записи активна'
      : connectionState === 'disconnected'
        ? 'Нет соединения с базой'
        : 'Проверка соединения…';

  const nextSlide = () => setSlideIndex((i) => (i + 1) % HERO_SLIDES.length);
  const prevSlide = () => setSlideIndex((i) => (i - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);

  return (
    <section
      id="hero"
      className="relative overflow-hidden bg-[#08090B] border-b border-white/[0.06]"
    >
      <div
        className="pointer-events-none absolute -top-20 right-[-10%] w-[540px] h-[420px] rounded-full opacity-25 blur-[120px]"
        style={{ background: 'radial-gradient(circle, rgba(182,154,103,0.4) 0%, rgba(8,9,11,0) 70%)' }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-8 sm:pt-10 sm:pb-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-center">
          {/* Right Column placed first on mobile so car is visible right away */}
          <div className="lg:col-span-6 order-first lg:order-last relative">
            <div className="relative rounded-2xl overflow-hidden bg-[#08090B]">
              <div className="aspect-[16/9] w-full relative">
                <ResilientImage
                  key={currentSlide.id}
                  src={currentSlide.image}
                  alt={currentSlide.alt}
                  fallbackTitle={currentSlide.title}
                  className="w-full h-full object-cover object-center hero-car-mask transition-opacity duration-500"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#08090B] via-transparent to-[#08090B]/70" />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#08090B] via-transparent to-[#08090B]/35" />
              </div>
            </div>
          </div>

          {/* Left Column */}
          <div className="lg:col-span-6 order-last lg:order-first relative z-10 animate-fade-up">
            <p className="text-[11px] sm:text-xs tracking-[0.2em] text-[#B69A67] font-semibold mb-2">
              АВТОСЕРВИС ДЛЯ ВСЕХ МАРОК АВТОМОБИЛЕЙ
            </p>

            <h1 className="font-display font-bold text-3xl sm:text-5xl leading-[1.06] tracking-tight text-[#F1F0EC] text-balance mb-3">
              GARANT SERVICE
            </h1>

            <p className="text-sm sm:text-base text-[#96989D] max-w-xl mb-5 leading-relaxed">
              Профессиональная замена масла, фильтров, диагностика, ТО и консультация с мастером
              для автомобилей любых марок и моделей.
            </p>

            <div className="space-y-3 border-t border-white/[0.08] pt-4 mb-6">
              {ADVANTAGES.map((adv) => (
                <div key={adv.index} className="flex items-start gap-3">
                  <span className="font-mono-num text-xs text-[#B69A67] pt-0.5 shrink-0">
                    {adv.index}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-[#F1F0EC] leading-snug">{adv.title}</p>
                    <p className="text-xs text-[#96989D] mt-0.5 leading-relaxed">{adv.detail}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => onNavigate('booking')}
                className="glass-btn-gold px-6 py-3 rounded-xl text-sm font-semibold whitespace-nowrap"
              >
                <span>Записаться онлайн</span>
                <ArrowUpRight className="w-4 h-4 text-[#B69A67]" strokeWidth={1.75} />
              </button>
              <button
                type="button"
                onClick={() => onNavigate('services')}
                className="glass-btn px-5 py-3 rounded-xl text-sm font-medium whitespace-nowrap"
              >
                Услуги сервиса
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Trust & Slider Bar */}
        <div className="mt-6 pt-4 border-t border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#96989D]">
            {averageRating !== null ? (
              <div className="flex items-center gap-1.5 text-[#F1F0EC]">
                <Star className="w-3.5 h-3.5 text-[#B69A67] fill-[#B69A67]" />
                <span className="font-mono-num font-semibold">{averageRating}</span>
                <span aria-hidden="true" className="text-[#96989D]">·</span>
                <span className="text-[#96989D]">
                  Отзывов: <span className="font-mono-num text-[#F1F0EC]">{reviewCount}</span>
                </span>
              </div>
            ) : (
              <span>Рейтинг формируется из подтверждённых отзывов</span>
            )}
            <span aria-hidden="true" className="text-white/20">·</span>
            <span
              className={
                connectionState === 'connected'
                  ? 'text-[#78B894]'
                  : connectionState === 'disconnected'
                    ? 'text-[#E06C75]'
                    : 'text-[#96989D]'
              }
            >
              {connectionLabel}
            </span>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-2.5">
            <span className="text-xs text-[#96989D] truncate max-w-[200px]">
              {currentSlide.title}
            </span>
            <div className="flex items-center gap-1.5 shrink-0">
              {HERO_SLIDES.map((s, idx) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSlideIndex(idx)}
                  aria-label={`Слайд ${idx + 1}`}
                  className={`h-1.5 rounded-full transition-all duration-200 ${
                    idx === slideIndex ? 'w-6 bg-[#B69A67]' : 'w-2 bg-white/20'
                  }`}
                />
              ))}
              <button
                type="button"
                onClick={prevSlide}
                aria-label="Предыдущий кадр"
                className="glass-btn w-8 h-8 rounded-lg p-0 ml-1"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={nextSlide}
                aria-label="Следующий кадр"
                className="glass-btn w-8 h-8 rounded-lg p-0"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

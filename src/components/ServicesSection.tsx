import { ArrowRight, Clock } from 'lucide-react';
import { SERVICES } from '../data/services';
import { ResilientImage } from './ResilientImage';

interface ServicesSectionProps {
  onSelectService: (serviceName: string) => void;
}

export function ServicesSection({ onSelectService }: ServicesSectionProps) {
  return (
    <section id="services" className="py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6 sm:mb-8">
          <div>
            <p className="text-xs tracking-[0.2em] text-[#B69A67] font-semibold mb-1.5">
              УСЛУГИ ДЛЯ ЛЮБЫХ АВТОМОБИЛЕЙ
            </p>
            <h2 className="font-display font-bold text-2xl sm:text-3xl text-[#F1F0EC]">
              Выберите нужное направление
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-[#96989D] max-w-md">
            Работаем со всеми марками и моделями. Нажмите на услугу для перехода к записи.
          </p>
        </div>

        {/* Compact, clean grid: horizontal cards on mobile, 3-col on desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {SERVICES.map((service, index) => {
            const num = String(index + 1).padStart(2, '0');

            return (
              <article
                key={service.id}
                className="glass-surface rounded-2xl overflow-hidden flex sm:flex-col group transition-all duration-200 hover:border-[#B69A67]/45"
              >
                <div className="relative w-28 sm:w-full sm:aspect-[16/9] shrink-0 overflow-hidden bg-[#08090B]">
                  <ResilientImage
                    src={service.image}
                    alt={service.name}
                    fallbackTitle={service.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                  <div className="pointer-events-none hidden sm:block absolute inset-0 bg-gradient-to-t from-[#111317] via-transparent to-transparent" />
                </div>

                <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between gap-3 min-w-0">
                  <div>
                    <div className="flex items-center gap-1.5 text-[11px] text-[#96989D] mb-1">
                      <span className="font-mono-num text-[#B69A67]">{num}</span>
                      <span aria-hidden="true">·</span>
                      <span className="truncate">{service.subtitle}</span>
                    </div>
                    <h3 className="font-display font-semibold text-base sm:text-lg text-[#F1F0EC] mb-1">
                      {service.name}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#96989D] leading-relaxed line-clamp-2">
                      {service.description}
                    </p>
                  </div>

                  <div className="pt-2.5 border-t border-white/[0.08] flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1 text-[11px] text-[#96989D]">
                      <Clock className="w-3.5 h-3.5 text-[#B69A67] shrink-0" strokeWidth={1.75} />
                      <span className="font-mono-num truncate">{service.duration}</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => onSelectService(service.name)}
                      className="glass-btn px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap shrink-0"
                    >
                      <span>Записаться</span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#B69A67]" strokeWidth={1.75} />
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

import { MessageCircle, Phone, Wrench } from 'lucide-react';
import { ResilientImage } from './ResilientImage';

interface AboutAndContactProps {
  onGoToBooking: () => void;
}

export function AboutAndContact({ onGoToBooking }: AboutAndContactProps) {
  return (
    <section id="about" className="py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* About Block */}
        <div className="glass-surface rounded-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 items-stretch">
          <div className="lg:col-span-6 bg-[#08090B] min-h-[210px]">
            <ResilientImage
              src="/src/assets/images/about_w210_studio_clean_1795549118694.jpg"
              alt="Сервисная зона Garant Service с Mercedes-Benz E-Class W210"
              fallbackTitle="Garant Service"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="lg:col-span-6 p-5 sm:p-8 flex flex-col justify-center">
            <p className="text-xs tracking-[0.2em] text-[#B69A67] font-semibold mb-1.5">
              О СЕРВИСЕ
            </p>
            <h2 className="font-display font-bold text-2xl sm:text-3xl text-[#F1F0EC] mb-3">
              Обслуживание любых автомобилей
            </h2>
            <p className="text-xs sm:text-sm text-[#96989D] leading-relaxed mb-4">
              В Garant Service мы принимаем автомобили любых марок и моделей — от городских седанов
              и кроссоверов до классических немецких авто. Автомобиль владельца сервиса — серый
              Mercedes-Benz E-Class W210, и с таким же вниманием к деталям мы обслуживаем каждую
              машину клиента.
            </p>
            <div className="border-t border-white/[0.08] pt-4 text-xs sm:text-sm text-[#F1F0EC]/90 space-y-1.5">
              <p>Замена масла и фильтров с точным подбором расходников.</p>
              <p>Консультация с мастером, диагностика и плановое ТО.</p>
            </div>
          </div>
        </div>

        {/* Contact & WhatsApp Block */}
        <div id="contact" className="glass-surface rounded-2xl p-5 sm:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Owner Contact */}
            <div className="rounded-xl border border-white/[0.08] bg-[#08090B]/60 p-5 flex flex-col justify-between gap-4">
              <div>
                <p className="text-[11px] tracking-[0.18em] text-[#B69A67] font-semibold mb-1">
                  ВЛАДЕЛЕЦ СЕРВИСА
                </p>
                <h3 className="font-display font-semibold text-lg text-[#F1F0EC]">
                  Запись и консультация по ремонту
                </h3>
                <p className="font-mono-num text-sm text-[#F1F0EC]/90 mt-1.5">
                  +996 552 202 215
                </p>
                <p className="text-xs text-[#96989D] mt-1">
                  Ежедневно · 09:00 – 18:00
                </p>
              </div>

              <div className="flex flex-wrap gap-2.5">
                <a
                  href="https://wa.me/996552202215"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="glass-btn-gold px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap"
                >
                  <MessageCircle className="w-4 h-4 text-[#B69A67]" />
                  <span>WhatsApp владельца</span>
                </a>
                <a
                  href="tel:+996552202215"
                  className="glass-btn px-4 py-2.5 rounded-xl text-xs font-medium whitespace-nowrap"
                >
                  <Phone className="w-3.5 h-3.5 text-[#B69A67]" />
                  <span>Позвонить</span>
                </a>
                <button
                  type="button"
                  onClick={onGoToBooking}
                  className="glass-btn px-4 py-2.5 rounded-xl text-xs font-medium whitespace-nowrap"
                >
                  Онлайн-запись
                </button>
              </div>
            </div>

            {/* Developer / Tech Support Contact */}
            <div className="rounded-xl border border-white/[0.08] bg-[#08090B]/60 p-5 flex flex-col justify-between gap-4">
              <div>
                <p className="text-[11px] tracking-[0.18em] text-[#B69A67] font-semibold mb-1">
                  ТЕХНИЧЕСКАЯ ПОДДЕРЖКА И РАЗРАБОТЧИК
                </p>
                <h3 className="font-display font-semibold text-lg text-[#F1F0EC]">
                  Khalmatov Saidakbar Rashidjonovich
                </h3>
                <p className="font-mono-num text-sm text-[#F1F0EC]/90 mt-1.5">
                  +996 556 504 969
                </p>
                <p className="text-xs text-[#96989D] mt-1">
                  Вопросы по работе сайта и онлайн-записи
                </p>
              </div>

              <div className="flex flex-wrap gap-2.5">
                <a
                  href="https://wa.me/996556504969"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="glass-btn px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap"
                >
                  <Wrench className="w-3.5 h-3.5 text-[#B69A67]" />
                  <span>WhatsApp техподдержки</span>
                </a>
                <a
                  href="tel:+996556504969"
                  className="glass-btn px-4 py-2.5 rounded-xl text-xs font-medium whitespace-nowrap"
                >
                  <Phone className="w-3.5 h-3.5 text-[#B69A67]" />
                  <span>Позвонить</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

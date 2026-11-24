import { useEffect, useRef, useState } from 'react';
import { CalendarCheck, Menu, X } from 'lucide-react';

export type SectionTab = 'services' | 'booking' | 'reviews' | 'about';

interface HeaderProps {
  activeSection: SectionTab;
  onNavigate: (target: 'hero' | SectionTab) => void;
  onOpenAdmin: () => void;
}

const NAV_ITEMS: Array<{ id: 'hero' | SectionTab; label: string }> = [
  { id: 'hero', label: 'Главная' },
  { id: 'services', label: 'Услуги' },
  { id: 'booking', label: 'Онлайн-запись' },
  { id: 'reviews', label: 'Отзывы' },
  { id: 'about', label: 'О нас и Контакты' },
];

export function Header({ activeSection, onNavigate, onOpenAdmin }: HeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const tapCountRef = useRef(0);
  const tapTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (tapTimerRef.current !== null) {
        window.clearTimeout(tapTimerRef.current);
      }
    };
  }, []);

  const handleLogoTap = () => {
    tapCountRef.current += 1;
    if (tapTimerRef.current !== null) {
      window.clearTimeout(tapTimerRef.current);
    }
    tapTimerRef.current = window.setTimeout(() => {
      tapCountRef.current = 0;
    }, 2500);

    if (tapCountRef.current >= 5) {
      tapCountRef.current = 0;
      onOpenAdmin();
    }
  };

  const handleLinkClick = (target: 'hero' | SectionTab) => {
    setMobileOpen(false);
    onNavigate(target);
  };

  return (
    <header className="sticky top-0 z-30 w-full bg-[#08090B]/85 backdrop-blur-xl border-b border-white/[0.08]">
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2 sm:gap-6">
        {/* Brand Zone */}
        <div className="flex items-center gap-2.5 min-w-0">
          <button
            type="button"
            onClick={handleLogoTap}
            aria-label="Garant Service"
            className="w-10 h-10 rounded-xl glass-btn border-[#B69A67]/40 text-[#B69A67] font-display font-bold text-sm tracking-wider shrink-0"
          >
            GS
          </button>
          <button
            type="button"
            onClick={() => handleLinkClick('hero')}
            className="font-display font-bold text-sm sm:text-lg tracking-wider text-[#F1F0EC] truncate hover:text-[#B69A67] transition-colors text-left"
          >
            GARANT SERVICE
          </button>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-6" aria-label="Основная навигация">
          {NAV_ITEMS.map((item) => {
            const isActive = item.id !== 'hero' && activeSection === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleLinkClick(item.id)}
                className={`text-sm font-medium transition-colors whitespace-nowrap shrink-0 py-1 relative ${
                  isActive
                    ? 'text-[#F1F0EC] after:w-full'
                    : 'text-[#96989D] hover:text-[#F1F0EC] after:w-0 hover:after:w-full'
                } after:content-[''] after:absolute after:left-0 after:bottom-0 after:h-[1px] after:bg-[#B69A67] after:transition-all after:duration-200`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => handleLinkClick('booking')}
            className="hidden sm:inline-flex glass-btn-gold px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap shrink-0"
          >
            <CalendarCheck className="w-4 h-4 text-[#B69A67]" strokeWidth={1.75} />
            <span>Записаться</span>
          </button>

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label={mobileOpen ? 'Закрыть меню' : 'Открыть меню'}
            aria-expanded={mobileOpen}
            className="lg:hidden glass-btn w-11 h-11 rounded-xl p-0 shrink-0"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Compact Mobile Drawer */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-white/[0.08] bg-[#111317]/95 backdrop-blur-2xl">
          <nav
            className="max-w-7xl mx-auto px-3 py-3 grid grid-cols-2 gap-2"
            aria-label="Мобильная навигация"
          >
            {NAV_ITEMS.map((item) => {
              const isActive = item.id !== 'hero' && activeSection === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleLinkClick(item.id)}
                  className={`px-3.5 py-2.5 rounded-xl text-xs font-medium justify-start whitespace-nowrap ${
                    isActive ? 'glass-btn-gold text-[#F1F0EC]' : 'glass-btn text-[#F1F0EC]'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
}

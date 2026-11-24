import { useEffect, useRef } from 'react';
import type { ThemeOption } from '../types';

interface HeaderProps {
  theme: ThemeOption;
  onThemeChange: (theme: string) => void;
  onOpenAdmin: () => void;
}

export function Header({ theme, onThemeChange, onOpenAdmin }: HeaderProps) {
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

  return (
    <header className="gs-header">
      <div className="wrap nav">
        <div className="brand">
          <div className="logo" onClick={handleLogoTap} role="button" tabIndex={0} onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleLogoTap();
            }
          }}>
            GS
          </div>
          <div>
            GARANT SERVICE
            <small>АВТОСЕРВИС · ЗАПИСЬ ОНЛАЙН</small>
          </div>
        </div>
        <div className="nav-actions">
          <select
            className="gs-select theme-select"
            aria-label="Тема оформления"
            value={theme}
            onChange={(e) => onThemeChange(e.target.value)}
          >
            <option value="dark">Dark</option>
            <option value="yellow">Yellow</option>
            <option value="light">Light</option>
            <option value="ocean">Ocean</option>
            <option value="emerald">Emerald</option>
            <option value="system">System</option>
          </select>
          <a className="btn ghost" href="#contact">
            Контакты
          </a>
        </div>
      </div>
    </header>
  );
}

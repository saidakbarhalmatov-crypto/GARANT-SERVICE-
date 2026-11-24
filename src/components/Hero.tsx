import type { ConnectionState } from '../types';

interface HeroProps {
  connectionState: ConnectionState;
}

export function Hero({ connectionState }: HeroProps) {
  const connectionText =
    connectionState === 'connected'
      ? 'Firebase подключён'
      : connectionState === 'disconnected'
        ? 'Нет соединения с Firebase'
        : 'Проверяем соединение…';

  const pillClass =
    connectionState === 'connected'
      ? 'pill connected'
      : connectionState === 'disconnected'
        ? 'pill disconnected'
        : 'pill';

  return (
    <section className="hero">
      <div>
        <div className="eyebrow">НАДЁЖНОЕ ОБСЛУЖИВАНИЕ</div>
        <h1>
          Ваш автомобиль
          <br />
          <span className="hero-accent">в надёжных руках.</span>
        </h1>
        <p className="muted">
          Запишитесь на обслуживание онлайн. Выберите удобную дату и время — мы свяжемся с вами для
          подтверждения.
        </p>
        <a className="btn primary hero-cta" href="#booking">
          Записаться на сервис
        </a>
      </div>
      <div className="hero-card">
        <div className="hero-mark">GS</div>
        <h2>Garant Service</h2>
        <p className="muted">Удобная запись · Внимательный сервис · Прозрачная коммуникация</p>
        <span className={pillClass}>{connectionText}</span>
      </div>
    </section>
  );
}

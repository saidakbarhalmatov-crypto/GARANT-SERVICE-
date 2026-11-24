import type { ServiceItem } from '../types';

export const HERO_SLIDES = [
  {
    id: 'w210-studio',
    title: 'Garant Service · Все марки авто',
    subtitle: 'Вдохновлено классикой Mercedes-Benz E-Class W210',
    image: '/src/assets/images/hero_mercedes_w210_1795549098371.jpg',
    alt: 'Классический седан Mercedes-Benz E-Class W210 с четырьмя круглыми фарами',
  },
  {
    id: 'w210-bay',
    title: 'Сервисная зона Garant Service',
    subtitle: 'Обслуживание и замена масла для автомобилей любых марок',
    image: '/src/assets/images/about_w210_studio_clean_1795549118694.jpg',
    alt: 'Сервисная зона Garant Service для автомобилей любых марок',
  },
] as const;

export const SERVICES: ServiceItem[] = [
  {
    id: 'oil-change',
    name: 'Замена масла',
    subtitle: 'Все марки и модели авто',
    description:
      'Подбор масла по допускам и замена в двигателе или коробке передач для любого автомобиля.',
    duration: '30–45 мин',
    image: '/src/assets/images/service_oil_change_1795549098286.jpg',
  },
  {
    id: 'filters',
    name: 'Замена фильтров',
    subtitle: 'Масляный, воздушный, салонный',
    description:
      'Быстрая и аккуратная замена всех фильтрующих элементов на автомобилях любых марок.',
    duration: '25–40 мин',
    image: '/src/assets/images/service_filters_1795549119274.jpg',
  },
  {
    id: 'diagnostics',
    name: 'Диагностика',
    subtitle: 'Комплексная проверка авто',
    description:
      'Проверка основных систем, двигателя и ходовой части для точного определения состояния авто.',
    duration: '30–60 мин',
    image: '/src/assets/images/service_diagnostics_1795549099302.jpg',
  },
  {
    id: 'maintenance',
    name: 'Техническое обслуживание',
    subtitle: 'Плановое ТО',
    description:
      'Регулярный осмотр узлов, тормозной системы и технических жидкостей для надёжной езды.',
    duration: '60–90 мин',
    image: '/src/assets/images/service_maintenance_1795549099583.jpg',
  },
  {
    id: 'consultation',
    name: 'Консультация с мастером',
    subtitle: 'Осмотр и рекомендации',
    description:
      'Личная беседа с мастером, осмотр автомобиля и честный совет по ремонту и уходу.',
    duration: '15–30 мин',
    image: '/src/assets/images/about_w210_studio_clean_1795549118694.jpg',
  },
  {
    id: 'other',
    name: 'Другое',
    subtitle: 'Индивидуальное обращение',
    description:
      'Другие работы по договорённости и нестандартные запросы для любого автомобиля.',
    duration: 'По договорённости',
    image: '/src/assets/images/hero_mercedes_w210_1795549098371.jpg',
  },
];

export const SERVICE_NAMES = SERVICES.map((s) => s.name);

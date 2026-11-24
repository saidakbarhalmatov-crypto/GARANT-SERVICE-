export type ThemeOption = 'dark' | 'yellow' | 'light' | 'ocean' | 'emerald' | 'system';

export type ConnectionState = 'checking' | 'connected' | 'disconnected';

export type OrderStatus = 'Новая' | 'Подтверждена' | 'Выполнено' | 'Отменена';

export interface Order {
  name: string;
  phone: string;
  car: string;
  service: string;
  date: string;
  time: string;
  comment: string;
  status: OrderStatus | string;
  createdAt: number;
  updatedAt?: number;
}

export type ReviewStatus = 'pending' | 'approved' | 'rejected';

export interface Review {
  name: string;
  rating: number;
  text: string;
  status: ReviewStatus | string;
  createdAt: number;
  moderatedAt?: number;
}

export type FirebaseMap<T> = Record<string, T | null>;

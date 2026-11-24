import type { FirebaseMap, Order, OrderStatus, Review, ReviewStatus } from '../types';

const DB_URL = 'https://garant-service-d9715-default-rtdb.europe-west1.firebasedatabase.app';

async function dbRequest<T>(path: string, method = 'GET', bodyObj?: unknown): Promise<T> {
  const opts: RequestInit = { method };
  if (bodyObj !== undefined) {
    opts.headers = { 'Content-Type': 'application/json' };
    opts.body = JSON.stringify(bodyObj);
  }
  const res = await fetch(`${DB_URL}${path}.json`, opts);
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export function fetchReviews(): Promise<FirebaseMap<Review> | null> {
  return dbRequest<FirebaseMap<Review> | null>('/reviews', 'GET');
}

export function createOrder(order: Order): Promise<{ name: string }> {
  return dbRequest<{ name: string }>('/orders', 'POST', order);
}

export function fetchOrders(): Promise<FirebaseMap<Order> | null> {
  return dbRequest<FirebaseMap<Order> | null>('/orders', 'GET');
}

export function updateOrderStatus(id: string, status: OrderStatus): Promise<unknown> {
  return dbRequest(`/orders/${id}`, 'PATCH', { status, updatedAt: Date.now() });
}

export function deleteOrder(id: string): Promise<unknown> {
  return dbRequest(`/orders/${id}`, 'DELETE');
}

export function createReview(review: Review): Promise<{ name: string }> {
  return dbRequest<{ name: string }>('/reviews', 'POST', review);
}

export function moderateReview(id: string, status: ReviewStatus): Promise<unknown> {
  return dbRequest(`/reviews/${id}`, 'PATCH', { status, moderatedAt: Date.now() });
}

export function replyToReview(id: string, adminReply: string): Promise<unknown> {
  return dbRequest(`/reviews/${id}`, 'PATCH', {
    adminReply: adminReply.trim(),
    adminRepliedAt: Date.now(),
  });
}

export function deleteReview(id: string): Promise<unknown> {
  return dbRequest(`/reviews/${id}`, 'DELETE');
}

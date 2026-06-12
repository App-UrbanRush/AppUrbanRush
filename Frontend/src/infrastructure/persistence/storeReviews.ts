export interface StoreReview {
  id: string;
  storeId: number;
  rating: number;
  comment: string;
  author: string;
  date: string; // ISO
}

const KEY = "ur_store_reviews";

const readAll = (): StoreReview[] => {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw) as StoreReview[];
  } catch { /* ignore */ }
  return [];
};

const writeAll = (list: StoreReview[]) => {
  localStorage.setItem(KEY, JSON.stringify(list));
};

export const storeReviews = {
  getByStore(storeId: number): StoreReview[] {
    return readAll()
      .filter((r) => r.storeId === storeId)
      .sort((a, b) => b.date.localeCompare(a.date));
  },

  add(review: Omit<StoreReview, "id" | "date">): StoreReview {
    const full: StoreReview = {
      ...review,
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      date: new Date().toISOString(),
    };
    writeAll([...readAll(), full]);
    return full;
  },

  /** Promedio de las reseñas locales; si no hay, devuelve el fallback (rating base). */
  average(storeId: number, fallback: number): number {
    const list = readAll().filter((r) => r.storeId === storeId);
    if (list.length === 0) return fallback;
    const avg = list.reduce((s, r) => s + r.rating, 0) / list.length;
    return Math.round(avg * 10) / 10;
  },
};

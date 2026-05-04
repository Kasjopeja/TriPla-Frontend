import { apiClient } from './client';
import type { TripChangeLogDto, Uuid } from '@/types';

export const historyApi = {
  list: (tripId: Uuid, limit = 100) =>
    apiClient
      .get<TripChangeLogDto[]>(`/trips/${tripId}/history`, {
        params: { limit },
      })
      .then((r) => r.data),
};

import { apiClient } from './client';
import type { HistoryQuery, TripChangeLogDto, Uuid } from '@/types';

export const historyApi = {
  list: (tripId: Uuid, query: HistoryQuery = {}) => {
    const params: Record<string, string | number> = {};
    if (query.type) params.type = query.type;
    if (query.actorId) params.actorId = query.actorId;
    if (query.from) params.from = query.from;
    if (query.to) params.to = query.to;
    if (query.sortBy) params.sortBy = query.sortBy;
    if (query.sortDir) params.sortDir = query.sortDir;
    if (query.skip !== undefined) params.skip = query.skip;
    params.limit = query.limit ?? 100;

    return apiClient
      .get<TripChangeLogDto[]>(`/trips/${tripId}/history`, { params })
      .then((r) => r.data);
  },
};

import { apiClient } from './client';
import type { AttractionDto, CreateAttractionRequest, Uuid } from '@/types';

export const attractionsApi = {
  list: (tripId: Uuid) =>
    apiClient.get<AttractionDto[]>(`/trips/${tripId}/attractions`).then((r) => r.data),

  create: (tripId: Uuid, payload: CreateAttractionRequest) =>
    apiClient
      .post<AttractionDto>(`/trips/${tripId}/attractions`, payload)
      .then((r) => r.data),

  update: (attractionId: Uuid, payload: CreateAttractionRequest) =>
    apiClient
      .put<AttractionDto>(`/trips/attractions/${attractionId}`, payload)
      .then((r) => r.data),

  remove: (attractionId: Uuid) =>
    apiClient.delete(`/trips/attractions/${attractionId}`).then((r) => r.data),
};

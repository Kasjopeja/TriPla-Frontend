import { apiClient } from './client';
import type {
  CreateTripRequest,
  TripDetailsDto,
  TripDto,
  UpdateTripRequest,
  Uuid,
} from '@/types';

export const tripsApi = {
  list: () => apiClient.get<TripDto[]>('/trips').then((r) => r.data),

  details: (id: Uuid) =>
    apiClient.get<TripDetailsDto>(`/trips/${id}`).then((r) => r.data),

  create: (payload: CreateTripRequest) =>
    apiClient.post<TripDetailsDto>('/trips', payload).then((r) => r.data),

  update: (id: Uuid, payload: UpdateTripRequest) =>
    apiClient.put<TripDetailsDto>(`/trips/${id}`, payload).then((r) => r.data),

  remove: (id: Uuid) => apiClient.delete(`/trips/${id}`).then((r) => r.data),

  leave: (id: Uuid) => apiClient.post(`/trips/${id}/leave`).then((r) => r.data),
};

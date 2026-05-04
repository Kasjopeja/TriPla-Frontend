import { apiClient } from './client';
import type {
  AddParticipantRequest,
  ChangeRoleRequest,
  ParticipantDto,
  Uuid,
} from '@/types';

export const participantsApi = {
  list: (tripId: Uuid) =>
    apiClient
      .get<ParticipantDto[]>(`/trips/${tripId}/participants`)
      .then((r) => r.data),

  add: (tripId: Uuid, payload: AddParticipantRequest) =>
    apiClient
      .post<ParticipantDto>(`/trips/${tripId}/participants`, payload)
      .then((r) => r.data),

  changeRole: (tripId: Uuid, userId: Uuid, payload: ChangeRoleRequest) =>
    apiClient
      .put<ParticipantDto>(`/trips/${tripId}/participants/${userId}/role`, payload)
      .then((r) => r.data),

  remove: (tripId: Uuid, userId: Uuid) =>
    apiClient.delete(`/trips/${tripId}/participants/${userId}`).then((r) => r.data),
};

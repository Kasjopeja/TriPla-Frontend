import { apiClient } from './client';
import type {
  CommentDto,
  CreateCommentRequest,
  UpdateCommentRequest,
  Uuid,
} from '@/types';

export const commentsApi = {
  list: (tripId: Uuid) =>
    apiClient.get<CommentDto[]>(`/trips/${tripId}/comments`).then((r) => r.data),

  create: (tripId: Uuid, payload: CreateCommentRequest) =>
    apiClient
      .post<CommentDto>(`/trips/${tripId}/comments`, payload)
      .then((r) => r.data),

  update: (commentId: Uuid, payload: UpdateCommentRequest) =>
    apiClient
      .put<CommentDto>(`/trips/comments/${commentId}`, payload)
      .then((r) => r.data),

  remove: (commentId: Uuid) =>
    apiClient.delete(`/trips/comments/${commentId}`).then((r) => r.data),
};

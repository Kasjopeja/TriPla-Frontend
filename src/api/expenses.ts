import { apiClient } from './client';
import type {
  CreateExpenseRequest,
  ExpenseDto,
  UpdateExpenseRequest,
  Uuid,
} from '@/types';

export const expensesApi = {
  list: (tripId: Uuid) =>
    apiClient.get<ExpenseDto[]>(`/trips/${tripId}/expenses`).then((r) => r.data),

  create: (tripId: Uuid, payload: CreateExpenseRequest) =>
    apiClient
      .post<ExpenseDto>(`/trips/${tripId}/expenses`, payload)
      .then((r) => r.data),

  update: (expenseId: Uuid, payload: UpdateExpenseRequest) =>
    apiClient
      .put<ExpenseDto>(`/trips/expenses/${expenseId}`, payload)
      .then((r) => r.data),

  remove: (expenseId: Uuid) =>
    apiClient.delete(`/trips/expenses/${expenseId}`).then((r) => r.data),

  setSettled: (expenseId: Uuid, isSettled: boolean) =>
    apiClient
      .put<ExpenseDto>(`/trips/expenses/${expenseId}/settled`, { isSettled })
      .then((r) => r.data),

  setAllSettled: (tripId: Uuid, isSettled: boolean) =>
    apiClient
      .put<number>(`/trips/${tripId}/expenses/settled-all`, { isSettled })
      .then((r) => r.data),
};

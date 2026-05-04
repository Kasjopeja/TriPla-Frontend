import { useMemo, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { CheckCheck, Eye, EyeOff, RotateCcw } from 'lucide-react';
import { expensesApi } from '@/api/expenses';
import {
  ExpenseCategory,
  ParticipantRole,
  type CreateExpenseRequest,
  type ExpenseDto,
  type ExpenseSplitDto,
  type ParticipantDto,
  type UpdateExpenseRequest,
  type Uuid,
} from '@/types';
import { formatUserShort, formatUserWithName } from '@/utils/user';
import { splitsAreEqual } from '@/utils/settlement';
import { canEditTripResources, getMyRole } from '@/utils/permissions';
import { getApiErrorMessage } from '@/utils/errors';
import { useAuthStore } from '@/store/auth';
import { SettlementSummary } from './SettlementSummary';
import { ExpenseForm, type ExpenseFormSubmit } from './ExpenseForm';

const categoryLabel: Record<ExpenseCategory, string> = {
  [ExpenseCategory.Accommodation]: 'Nocleg',
  [ExpenseCategory.Transport]: 'Transport',
  [ExpenseCategory.Food]: 'Jedzenie',
  [ExpenseCategory.Activities]: 'Atrakcje',
  [ExpenseCategory.Shopping]: 'Zakupy',
  [ExpenseCategory.Other]: 'Inne',
};

interface Props {
  tripId: Uuid;
  expenses: ExpenseDto[];
  participants: ParticipantDto[];
}

function extractError(err: unknown): string | null {
  return err ? getApiErrorMessage(err, { fallback: 'Nie udało się zapisać wydatku.' }) : null;
}

function splitToUserLike(s: ExpenseSplitDto) {
  return {
    firstName: s.firstName,
    lastName: s.lastName,
    email: s.email,
    userId: s.userId,
  };
}

function SplitDisplay({ expense }: { expense: ExpenseDto }) {
  const payerName = formatUserShort({
    firstName: expense.payerFirstName,
    lastName: expense.payerLastName,
    email: expense.payerEmail,
    userId: expense.paidByUserId,
  });

  if (expense.splits.length === 0) {
    return (
      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
        Bez podziału – cały koszt pokrywa {payerName}
      </p>
    );
  }

  const amounts = expense.splits.map((s) => s.amount);
  const allEqual = splitsAreEqual(amounts);

  if (allEqual) {
    const perPerson = amounts[0];
    const names = expense.splits.map((s) => formatUserShort(splitToUserLike(s))).join(', ');
    return (
      <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
        Po równo po{' '}
        <span className="font-mono">
          {perPerson.toFixed(2)} {expense.currency}
        </span>{' '}
        · {names}
      </p>
    );
  }

  return (
    <ul className="mt-1 space-y-0.5 text-xs text-slate-600 dark:text-slate-300">
      {expense.splits.map((s) => (
        <li key={s.userId}>
          {formatUserShort(splitToUserLike(s))}:{' '}
          <span className="font-mono">
            {s.amount.toFixed(2)} {s.currency}
          </span>
        </li>
      ))}
    </ul>
  );
}

export function ExpensesTab({ tripId, expenses, participants }: Props) {
  const [mode, setMode] = useState<'list' | 'add' | { editing: Uuid }>('list');
  const [showSettled, setShowSettled] = useState(true);
  const qc = useQueryClient();
  const currentUserId = useAuthStore((s) => s.userId);
  const myRole = getMyRole(participants, currentUserId);
  const canBulkSettle = canEditTripResources(myRole);
  const isParticipant = myRole !== null && myRole >= ParticipantRole.Member;

  const addMutation = useMutation({
    mutationFn: (payload: CreateExpenseRequest) => expensesApi.create(tripId, payload),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['trip', tripId] });
      setMode('list');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: Uuid; payload: UpdateExpenseRequest }) =>
      expensesApi.update(id, payload),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['trip', tripId] });
      setMode('list');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: Uuid) => expensesApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['trip', tripId] }),
  });

  const settleMutation = useMutation({
    mutationFn: ({ id, isSettled }: { id: Uuid; isSettled: boolean }) =>
      expensesApi.setSettled(id, isSettled),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['trip', tripId] }),
  });

  const settleAllMutation = useMutation({
    mutationFn: (isSettled: boolean) => expensesApi.setAllSettled(tripId, isSettled),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['trip', tripId] }),
  });

  const buildPayload = (values: ExpenseFormSubmit) => ({
    title: values.title,
    description: values.description,
    amount: values.amount,
    currency: values.currency,
    category: values.category,
    date: values.date,
    splits: values.splits ?? null,
  });

  const editingId = typeof mode === 'object' ? mode.editing : null;
  const editingExpense = editingId ? expenses.find((e) => e.id === editingId) : null;

  const total = expenses.reduce<Record<string, number>>((acc, e) => {
    acc[e.currency] = (acc[e.currency] ?? 0) + e.amount;
    return acc;
  }, {});

  const settledCount = expenses.filter((e) => e.isSettled).length;
  const allSettled = expenses.length > 0 && settledCount === expenses.length;

  const visibleExpenses = useMemo(
    () => (showSettled ? expenses : expenses.filter((e) => !e.isSettled)),
    [expenses, showSettled],
  );

  return (
    <div>
      <SettlementSummary expenses={expenses} participants={participants} />

      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">Wydatki ({expenses.length})</h2>
          {Object.keys(total).length > 0 && (
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Suma:{' '}
              {Object.entries(total)
                .map(([cur, amt]) => `${amt.toFixed(2)} ${cur}`)
                .join(' · ')}
            </p>
          )}
          {expenses.length > 0 && (
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Rozliczone: {settledCount} / {expenses.length}
            </p>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {expenses.length > 0 && (
            <button
              type="button"
              onClick={() => setShowSettled((v) => !v)}
              aria-pressed={showSettled}
              title={showSettled ? 'Ukryj rozliczone' : 'Pokaż rozliczone'}
              className={
                'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition ' +
                (showSettled
                  ? 'border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:border-emerald-700/60 dark:bg-emerald-900/30 dark:text-emerald-300 dark:hover:bg-emerald-900/50'
                  : 'border-slate-300 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800')
              }
            >
              {showSettled ? (
                <Eye className="h-3.5 w-3.5" />
              ) : (
                <EyeOff className="h-3.5 w-3.5" />
              )}
              Rozliczone
            </button>
          )}
          {canBulkSettle && expenses.length > 0 && (
            <button
              onClick={() => settleAllMutation.mutate(!allSettled)}
              disabled={settleAllMutation.isPending}
              className={
                'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition disabled:opacity-50 ' +
                (allSettled
                  ? 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800'
                  : 'border border-emerald-600 bg-emerald-600 text-white shadow-sm hover:bg-emerald-700 dark:border-emerald-500 dark:bg-emerald-600 dark:hover:bg-emerald-500')
              }
            >
              {allSettled ? (
                <RotateCcw className="h-3.5 w-3.5" />
              ) : (
                <CheckCheck className="h-3.5 w-3.5" />
              )}
              {allSettled ? 'Cofnij rozliczenia' : 'Rozlicz wszystkie'}
            </button>
          )}
          {mode === 'list' && (
            <button
              onClick={() => setMode('add')}
              className="rounded bg-brand-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-700"
            >
              + Dodaj wydatek
            </button>
          )}
        </div>
      </div>

      {mode === 'add' && (
        <div className="mb-6">
          <ExpenseForm
            participants={participants}
            submitLabel="Zapisz"
            onSubmit={(values) => addMutation.mutate(buildPayload(values))}
            onCancel={() => setMode('list')}
            isPending={addMutation.isPending}
            errorMessage={extractError(addMutation.error)}
          />
        </div>
      )}

      {visibleExpenses.length === 0 && mode === 'list' ? (
        <p className="rounded border border-dashed p-6 text-center text-slate-500 dark:text-slate-400">
          {expenses.length === 0
            ? 'Brak wydatków.'
            : 'Wszystkie wydatki rozliczone – odznacz „Pokaż rozliczone", aby je wyświetlić.'}
        </p>
      ) : (
        <ul className="divide-y rounded border bg-white dark:bg-slate-900">
          {visibleExpenses.map((e) =>
            editingId === e.id && editingExpense ? (
              <li key={e.id} className="p-4">
                <ExpenseForm
                  participants={participants}
                  initial={editingExpense}
                  submitLabel="Zapisz zmiany"
                  onSubmit={(values) =>
                    updateMutation.mutate({ id: e.id, payload: buildPayload(values) })
                  }
                  onCancel={() => setMode('list')}
                  isPending={updateMutation.isPending}
                  errorMessage={extractError(updateMutation.error)}
                />
              </li>
            ) : (
              <li
                key={e.id}
                className={
                  'flex items-start justify-between p-4 ' +
                  (e.isSettled ? 'bg-emerald-50/40 dark:bg-emerald-900/20 opacity-70' : '')
                }
              >
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={
                        'font-medium ' + (e.isSettled ? 'line-through text-slate-500 dark:text-slate-400' : '')
                      }
                    >
                      {e.title}
                      {e.isSettled && (
                        <span className="ml-2 rounded bg-emerald-100 px-2 py-0.5 text-xs font-normal text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 no-underline">
                          ✓ rozliczone
                        </span>
                      )}
                    </span>
                    <span className="font-mono font-semibold">
                      {e.amount.toFixed(2)} {e.currency}
                    </span>
                  </div>
                  <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    {categoryLabel[e.category]} · {format(new Date(e.date), 'dd.MM.yyyy')}{' '}
                    · płaci{' '}
                    {formatUserWithName({
                      firstName: e.payerFirstName,
                      lastName: e.payerLastName,
                      email: e.payerEmail,
                      userId: e.paidByUserId,
                    })}
                  </div>
                  {e.description && (
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{e.description}</p>
                  )}
                  <SplitDisplay expense={e} />
                </div>
                <div className="ml-4 flex flex-col gap-1">
                  {isParticipant && (
                    <button
                      onClick={() =>
                        settleMutation.mutate({ id: e.id, isSettled: !e.isSettled })
                      }
                      disabled={settleMutation.isPending}
                      className={
                        'rounded px-2 py-1 text-xs ' +
                        (e.isSettled
                          ? 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                          : 'text-emerald-700 hover:bg-emerald-50 dark:text-emerald-300 dark:hover:bg-emerald-900/30')
                      }
                    >
                      {e.isSettled ? 'Cofnij' : 'Rozliczone'}
                    </button>
                  )}
                  {e.paidByUserId === currentUserId && (
                    <>
                      <button
                        onClick={() => setMode({ editing: e.id })}
                        className="rounded px-2 py-1 text-xs text-brand-700 hover:bg-brand-50 dark:text-mauve-200 dark:hover:bg-mauve-700/30"
                      >
                        Edytuj
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Usunąć wydatek "${e.title}"?`)) {
                            deleteMutation.mutate(e.id);
                          }
                        }}
                        disabled={deleteMutation.isPending}
                        className="rounded px-2 py-1 text-xs text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40"
                      >
                        Usuń
                      </button>
                    </>
                  )}
                </div>
              </li>
            ),
          )}
        </ul>
      )}
    </div>
  );
}

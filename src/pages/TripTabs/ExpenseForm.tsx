import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ExpenseCategory, type ExpenseDto, type ParticipantDto, type Uuid } from '@/types';
import { equalSplitAmounts } from '@/utils/settlement';
import { formatUserShort } from '@/utils/user';

const schema = z.object({
  title: z.string().min(1, 'Tytuł jest wymagany'),
  description: z.string().optional(),
  amount: z.coerce.number().positive('Kwota musi być większa od 0'),
  currency: z.string().length(3, 'Waluta to 3 litery').transform((v) => v.toUpperCase()),
  category: z.coerce.number().int().min(0).max(5),
  date: z.string().min(1, 'Data jest wymagana'),
});

type FormValues = z.infer<typeof schema>;

export interface ExpenseFormSubmit {
  title: string;
  description: string | null;
  amount: number;
  currency: string;
  category: ExpenseCategory;
  date: string;
  splits: { userId: Uuid; amount: number }[] | null;
}

interface Props {
  participants: ParticipantDto[];
  initial?: ExpenseDto;
  submitLabel: string;
  onSubmit: (values: ExpenseFormSubmit) => void;
  onCancel: () => void;
  isPending?: boolean;
  errorMessage?: string | null;
}

const categoryLabel: Record<ExpenseCategory, string> = {
  [ExpenseCategory.Accommodation]: 'Nocleg',
  [ExpenseCategory.Transport]: 'Transport',
  [ExpenseCategory.Food]: 'Jedzenie',
  [ExpenseCategory.Activities]: 'Atrakcje',
  [ExpenseCategory.Shopping]: 'Zakupy',
  [ExpenseCategory.Other]: 'Inne',
};

export function ExpenseForm({
  participants,
  initial,
  submitLabel,
  onSubmit,
  onCancel,
  isPending,
  errorMessage,
}: Props) {
  const [split, setSplit] = useState<boolean>(
    initial ? initial.splits.length > 0 : true,
  );

  const [included, setIncluded] = useState<Set<Uuid>>(() => {
    if (initial && initial.splits.length > 0) {
      return new Set(initial.splits.map((s) => s.userId));
    }
    return new Set(participants.map((p) => p.userId));
  });

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: initial
      ? {
          title: initial.title,
          description: initial.description ?? '',
          amount: initial.amount,
          currency: initial.currency,
          category: initial.category,
          date: initial.date.slice(0, 10),
        }
      : {
          title: '',
          description: '',
          amount: 0,
          currency: 'PLN',
          category: ExpenseCategory.Other,
          date: new Date().toISOString().slice(0, 10),
        },
  });

  const watchedAmount = Number(watch('amount')) || 0;

  const selectedIds = useMemo(
    () => participants.filter((p) => included.has(p.userId)).map((p) => p.userId),
    [participants, included],
  );

  const previewAmounts = useMemo(
    () => (split ? equalSplitAmounts(watchedAmount, selectedIds.length) : []),
    [split, watchedAmount, selectedIds.length],
  );

  const toggle = (userId: Uuid) => {
    setIncluded((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) next.delete(userId);
      else next.add(userId);
      return next;
    });
  };

  const submit = (values: FormValues) => {
    let splits: { userId: Uuid; amount: number }[] | null = null;
    if (split && selectedIds.length > 0) {
      const amounts = equalSplitAmounts(values.amount, selectedIds.length);
      splits = selectedIds.map((uid, i) => ({ userId: uid, amount: amounts[i] }));
    }

    onSubmit({
      title: values.title,
      description: values.description?.trim() || null,
      amount: values.amount,
      currency: values.currency,
      category: values.category as ExpenseCategory,
      date: new Date(values.date).toISOString(),
      splits,
    });
  };

  return (
    <form
      onSubmit={handleSubmit(submit)}
      className="space-y-3 rounded border bg-slate-50 dark:bg-slate-800/50 p-4"
    >
      <div>
        <label className="mb-1 block text-sm font-medium">Tytuł *</label>
        <input {...register('title')} className="input" />
        {errors.title && (
          <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
        )}
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Opis</label>
        <input
          {...register('description')}
          className="input"
        />
      </div>
      <div className="grid grid-cols-3 gap-2">
        <div>
          <label className="mb-1 block text-sm font-medium">Kwota *</label>
          <input
            type="number"
            step="0.01"
            {...register('amount')}
            className="input"
          />
          {errors.amount && (
            <p className="mt-1 text-sm text-red-600">{errors.amount.message}</p>
          )}
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Waluta *</label>
          <input
            {...register('currency')}
            maxLength={3}
            className="input"
          />
          {errors.currency && (
            <p className="mt-1 text-sm text-red-600">{errors.currency.message}</p>
          )}
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Data *</label>
          <input
            type="date"
            {...register('date')}
            className="input"
          />
          {errors.date && (
            <p className="mt-1 text-sm text-red-600">{errors.date.message}</p>
          )}
        </div>
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Kategoria</label>
        <select
          {...register('category')}
          className="input"
        >
          {Object.entries(categoryLabel).map(([val, lbl]) => (
            <option key={val} value={val}>
              {lbl}
            </option>
          ))}
        </select>
      </div>

      <div className="border-t pt-3">
        <label className="flex items-center gap-2 text-sm font-medium">
          <input
            type="checkbox"
            checked={split}
            onChange={(e) => setSplit(e.target.checked)}
          />
          Podziel po równo między uczestników
        </label>

        {split && (
          <div className="mt-2 space-y-1 rounded border bg-white dark:bg-slate-900 p-3">
            {participants.map((p) => {
              const checked = included.has(p.userId);
              const amount = checked ? previewAmounts[selectedIds.indexOf(p.userId)] : 0;
              return (
                <label
                  key={p.userId}
                  className="flex items-center justify-between gap-2 py-1 text-sm"
                >
                  <span className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggle(p.userId)}
                    />
                    <span>{formatUserShort(p)}</span>
                  </span>
                  {checked && !Number.isNaN(amount) && (
                    <span className="font-mono text-xs text-slate-600 dark:text-slate-300">
                      {(amount ?? 0).toFixed(2)}
                    </span>
                  )}
                </label>
              );
            })}
            {selectedIds.length === 0 && (
              <p className="text-xs text-amber-700">
                Zaznacz co najmniej jedną osobę, albo odznacz podział.
              </p>
            )}
          </div>
        )}
      </div>

      {errorMessage && <p className="text-sm text-red-600">{errorMessage}</p>}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isPending || (split && selectedIds.length === 0)}
          className="rounded bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
        >
          {isPending ? 'Zapisywanie...' : submitLabel}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded bg-slate-100 px-4 py-2 text-sm hover:bg-slate-200"
        >
          Anuluj
        </button>
      </div>
    </form>
  );
}

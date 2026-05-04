import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { attractionsApi } from '@/api/attractions';
import type {
  AttractionDto,
  CreateAttractionRequest,
  ParticipantRole,
  Uuid,
} from '@/types';
import { canEditTripResources } from '@/utils/permissions';

const schema = z.object({
  name: z.string().min(1, 'Nazwa jest wymagana'),
  description: z.string().optional(),
  plannedAt: z.string().optional(),
  street: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  tripId: Uuid;
  attractions: AttractionDto[];
  myRole: ParticipantRole | null;
}

function safeDate(value: string | null | undefined, pattern: string): string {
  if (!value) return '—';
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? '—' : format(d, pattern);
}

function buildAddress(a: AttractionDto): string {
  return [a.street, a.city, a.country].filter(Boolean).join(', ');
}

function toDateTimeLocal(iso: string | null | undefined): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function AttractionForm({
  initial,
  submitLabel,
  onSubmit,
  onCancel,
  isPending,
}: {
  initial?: AttractionDto;
  submitLabel: string;
  onSubmit: (payload: CreateAttractionRequest) => void;
  onCancel: () => void;
  isPending?: boolean;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: initial
      ? {
          name: initial.name,
          description: initial.description ?? '',
          plannedAt: toDateTimeLocal(initial.plannedAt),
          street: initial.street ?? '',
          city: initial.city ?? '',
          country: initial.country ?? '',
        }
      : {},
  });

  return (
    <form
      onSubmit={handleSubmit((values) => {
        onSubmit({
          name: values.name,
          description: values.description?.trim() || null,
          plannedAt: values.plannedAt ? new Date(values.plannedAt).toISOString() : null,
          street: values.street?.trim() || null,
          city: values.city?.trim() || null,
          country: values.country?.trim() || null,
        });
      })}
      className="space-y-3 rounded border bg-slate-50 dark:bg-slate-800/50 p-4"
    >
      <div>
        <label className="mb-1 block text-sm font-medium">Nazwa *</label>
        <input {...register('name')} className="input" />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
        )}
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Opis</label>
        <textarea
          {...register('description')}
          rows={2}
          className="input"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium">Planowany termin</label>
        <input
          type="datetime-local"
          {...register('plannedAt')}
          className="input"
        />
      </div>
      <div className="grid grid-cols-3 gap-2">
        <input
          {...register('street')}
          placeholder="Ulica"
          className="input"
        />
        <input
          {...register('city')}
          placeholder="Miasto"
          className="input"
        />
        <input
          {...register('country')}
          placeholder="Kraj"
          className="input"
        />
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isPending}
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

export function AttractionsTab({ tripId, attractions, myRole }: Props) {
  const [mode, setMode] = useState<'list' | 'add' | { editing: Uuid }>('list');
  const qc = useQueryClient();
  const canEdit = canEditTripResources(myRole);

  const addMutation = useMutation({
    mutationFn: (payload: CreateAttractionRequest) =>
      attractionsApi.create(tripId, payload),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['trip', tripId] });
      setMode('list');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: Uuid; payload: CreateAttractionRequest }) =>
      attractionsApi.update(id, payload),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['trip', tripId] });
      setMode('list');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: Uuid) => attractionsApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['trip', tripId] }),
  });

  const editingId = typeof mode === 'object' ? mode.editing : null;

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold">Atrakcje ({attractions.length})</h2>
        {mode === 'list' && canEdit && (
          <button
            onClick={() => setMode('add')}
            className="rounded bg-brand-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-700"
          >
            + Dodaj atrakcję
          </button>
        )}
      </div>

      {mode === 'add' && (
        <div className="mb-6">
          <AttractionForm
            submitLabel="Zapisz"
            onSubmit={(payload) => addMutation.mutate(payload)}
            onCancel={() => setMode('list')}
            isPending={addMutation.isPending}
          />
        </div>
      )}

      {attractions.length === 0 && mode !== 'add' ? (
        <p className="rounded border border-dashed p-6 text-center text-slate-500 dark:text-slate-400">
          Brak atrakcji. Dodaj pierwszą!
        </p>
      ) : (
        <ul className="divide-y rounded border bg-white dark:bg-slate-900">
          {attractions.map((a) => {
            if (editingId === a.id) {
              return (
                <li key={a.id} className="p-4">
                  <AttractionForm
                    initial={a}
                    submitLabel="Zapisz zmiany"
                    onSubmit={(payload) =>
                      updateMutation.mutate({ id: a.id, payload })
                    }
                    onCancel={() => setMode('list')}
                    isPending={updateMutation.isPending}
                  />
                </li>
              );
            }
            const address = buildAddress(a);
            return (
              <li key={a.id} className="flex items-start justify-between p-4">
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{a.name}</span>
                    <span className="text-sm text-slate-500 dark:text-slate-400">
                      {safeDate(a.plannedAt, 'dd.MM.yyyy HH:mm')}
                    </span>
                  </div>
                  {a.description && (
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{a.description}</p>
                  )}
                  {address && (
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{address}</p>
                  )}
                </div>
                {canEdit && (
                  <div className="ml-4 flex flex-col gap-1">
                    <button
                      onClick={() => setMode({ editing: a.id })}
                      className="rounded px-2 py-1 text-xs text-brand-700 hover:bg-brand-50 dark:text-mauve-200 dark:hover:bg-mauve-700/30"
                    >
                      Edytuj
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Usunąć atrakcję "${a.name}"?`)) {
                          deleteMutation.mutate(a.id);
                        }
                      }}
                      disabled={deleteMutation.isPending}
                      className="rounded px-2 py-1 text-xs text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40"
                    >
                      Usuń
                    </button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

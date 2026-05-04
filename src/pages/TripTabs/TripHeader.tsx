import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { CalendarDays, Pencil, Trash2 } from 'lucide-react';
import { tripsApi } from '@/api/trips';
import type { ParticipantRole, TripDetailsDto, UpdateTripRequest, Uuid } from '@/types';
import { canEditTripResources, isTripOwner } from '@/utils/permissions';

const tripGradients = [
  'from-sky-500 via-blue-600 to-indigo-700',
  'from-emerald-500 via-teal-600 to-cyan-700',
  'from-orange-500 via-rose-600 to-pink-700',
  'from-violet-600 via-purple-600 to-fuchsia-700',
  'from-amber-500 via-orange-600 to-red-600',
];

function gradientFor(id: string): string {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0;
  return tripGradients[Math.abs(h) % tripGradients.length];
}

const schema = z
  .object({
    name: z.string().min(1, 'Nazwa jest wymagana'),
    description: z.string().optional(),
    startDate: z.string().min(1, 'Data początkowa jest wymagana'),
    endDate: z.string().min(1, 'Data końcowa jest wymagana'),
  })
  .refine((v) => new Date(v.startDate) <= new Date(v.endDate), {
    message: 'Data końcowa musi być po dacie początkowej',
    path: ['endDate'],
  });

type FormValues = z.infer<typeof schema>;

function safeDate(value: string | null | undefined, pattern: string): string {
  if (!value) return '—';
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? '—' : format(d, pattern);
}

interface Props {
  trip: TripDetailsDto;
  myRole: ParticipantRole | null;
}

export function TripHeader({ trip, myRole }: Props) {
  const [editing, setEditing] = useState(false);
  const qc = useQueryClient();
  const navigate = useNavigate();

  const canEdit = canEditTripResources(myRole);
  const canDelete = isTripOwner(myRole);

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: Uuid; payload: UpdateTripRequest }) =>
      tripsApi.update(id, payload),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['trip', trip.id] });
      await qc.invalidateQueries({ queryKey: ['trips'] });
      setEditing(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: Uuid) => tripsApi.remove(id),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['trips'] });
      navigate('/trips', { replace: true });
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: trip.name,
      description: trip.description ?? '',
      startDate: trip.startDate.slice(0, 10),
      endDate: trip.endDate.slice(0, 10),
    },
  });

  if (editing) {
    return (
      <form
        onSubmit={handleSubmit((values) =>
          updateMutation.mutate({
            id: trip.id,
            payload: {
              name: values.name,
              description: values.description ?? '',
              startDate: new Date(values.startDate).toISOString(),
              endDate: new Date(values.endDate).toISOString(),
            },
          }),
        )}
        className="card space-y-3 p-6"
      >
        <div>
          <label className="label">Nazwa</label>
          <input {...register('name')} className="input" />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
          )}
        </div>
        <div>
          <label className="label">Opis</label>
          <textarea {...register('description')} rows={2} className="input" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Od</label>
            <input type="date" {...register('startDate')} className="input" />
            {errors.startDate && (
              <p className="mt-1 text-sm text-red-600">{errors.startDate.message}</p>
            )}
          </div>
          <div>
            <label className="label">Do</label>
            <input type="date" {...register('endDate')} className="input" />
            {errors.endDate && (
              <p className="mt-1 text-sm text-red-600">{errors.endDate.message}</p>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={updateMutation.isPending}
            className="btn-primary"
          >
            {updateMutation.isPending ? 'Zapisywanie...' : 'Zapisz'}
          </button>
          <button
            type="button"
            onClick={() => setEditing(false)}
            className="btn-secondary"
          >
            Anuluj
          </button>
        </div>
      </form>
    );
  }

  const gradient = gradientFor(trip.id);

  return (
    <div className="card overflow-hidden p-0">
      <div className={'relative h-32 bg-gradient-to-br ' + gradient}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_25%,rgba(255,255,255,0.25),transparent_60%)]" />
      </div>
      <div className="relative px-6 pb-6">
        <div className="-mt-10 mb-4 flex items-end justify-between gap-4">
          <h1 className="text-3xl font-extrabold tracking-tight text-white drop-shadow-md">
            {trip.name}
          </h1>
          <div className="flex gap-1">
            {canEdit && (
              <button
                onClick={() => setEditing(true)}
                className="inline-flex items-center gap-1 rounded-lg bg-white/90 px-3 py-1.5 text-sm font-medium text-brand-700 shadow-soft backdrop-blur transition hover:bg-white"
              >
                <Pencil className="h-3.5 w-3.5" /> Edytuj
              </button>
            )}
            {canDelete && (
              <button
                onClick={() => {
                  if (
                    confirm(
                      `Usunąć wycieczkę "${trip.name}"? Tego nie da się cofnąć.`,
                    )
                  ) {
                    deleteMutation.mutate(trip.id);
                  }
                }}
                disabled={deleteMutation.isPending}
                className="inline-flex items-center gap-1 rounded-lg bg-white/90 px-3 py-1.5 text-sm font-medium text-red-600 shadow-soft backdrop-blur transition hover:bg-white disabled:opacity-50"
              >
                <Trash2 className="h-3.5 w-3.5" /> Usuń
              </button>
            )}
          </div>
        </div>
        {trip.description && (
          <p className="mb-3 text-slate-600 dark:text-slate-300">{trip.description}</p>
        )}
        <p className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 dark:bg-slate-800 px-3 py-1 text-sm text-slate-600 dark:text-slate-300">
          <CalendarDays className="h-4 w-4" />
          {safeDate(trip.startDate, 'dd.MM.yyyy')} –{' '}
          {safeDate(trip.endDate, 'dd.MM.yyyy')}
        </p>
      </div>
    </div>
  );
}

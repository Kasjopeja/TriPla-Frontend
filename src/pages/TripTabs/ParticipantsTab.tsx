import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { participantsApi } from '@/api/participants';
import {
  ParticipantRole,
  type AddParticipantRequest,
  type ParticipantDto,
  type Uuid,
} from '@/types';
import { useAuthStore } from '@/store/auth';
import { formatUserWithName } from '@/utils/user';
import { canEditTripResources, isTripOwner } from '@/utils/permissions';
import { getApiErrorMessage } from '@/utils/errors';

const schema = z.object({
  email: z.string().email('Niepoprawny email'),
  role: z.coerce.number().int().min(0).max(2),
});

type FormValues = z.infer<typeof schema>;

const roleLabel: Record<ParticipantRole, string> = {
  [ParticipantRole.Member]: 'Uczestnik',
  [ParticipantRole.Editor]: 'Edytor',
  [ParticipantRole.Organizer]: 'Organizator',
};

interface Props {
  tripId: Uuid;
  ownerId: Uuid;
  participants: ParticipantDto[];
  myRole: ParticipantRole | null;
}

export function ParticipantsTab({ tripId, ownerId, participants, myRole }: Props) {
  const [showForm, setShowForm] = useState(false);
  const qc = useQueryClient();
  const currentUserId = useAuthStore((s) => s.userId);
  const canManage = canEditTripResources(myRole);
  const canChangeRoles = isTripOwner(myRole);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { role: ParticipantRole.Member },
  });

  const addMutation = useMutation({
    mutationFn: (payload: AddParticipantRequest) => participantsApi.add(tripId, payload),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['trip', tripId] });
      reset();
      setShowForm(false);
    },
  });

  const roleMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: Uuid; role: ParticipantRole }) =>
      participantsApi.changeRole(tripId, userId, { role }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['trip', tripId] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (userId: Uuid) => participantsApi.remove(tripId, userId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['trip', tripId] }),
  });

  const addError = addMutation.error
    ? getApiErrorMessage(addMutation.error, {
        fallback: 'Nie udało się dodać uczestnika.',
      })
    : null;

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold">
          Uczestnicy ({participants.length})
        </h2>
        {canManage && (
          <button
            onClick={() => setShowForm((v) => !v)}
            className="rounded bg-brand-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-700"
          >
            {showForm ? 'Anuluj' : '+ Zaproś'}
          </button>
        )}
      </div>

      {showForm && canManage && (
        <form
          onSubmit={handleSubmit((values) =>
            addMutation.mutate({ email: values.email, role: values.role as ParticipantRole }),
          )}
          className="mb-6 space-y-3 rounded border bg-slate-50 dark:bg-slate-800/50 p-4"
        >
          <div>
            <label className="mb-1 block text-sm font-medium">Email użytkownika *</label>
            <input
              type="email"
              {...register('email')}
              className="w-full rounded border px-3 py-2"
              placeholder="np. bob@example.com"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Rola</label>
            <select {...register('role')} className="w-full rounded border px-3 py-2">
              <option value={ParticipantRole.Member}>Uczestnik</option>
              <option value={ParticipantRole.Editor}>Edytor</option>
              <option value={ParticipantRole.Organizer}>Organizator</option>
            </select>
          </div>
          {addError && <p className="text-sm text-red-600">{addError}</p>}
          <button
            type="submit"
            disabled={addMutation.isPending}
            className="rounded bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
          >
            {addMutation.isPending ? 'Zapraszanie...' : 'Zaproś'}
          </button>
        </form>
      )}

      <ul className="divide-y rounded border bg-white dark:bg-slate-900">
        {participants.map((p) => {
          const isMe = p.userId === currentUserId;
          const isOwner = p.userId === ownerId;
          const canChangeThisRole = canChangeRoles && !isOwner;
          const canRemoveThis = canManage && !isOwner;
          return (
            <li key={p.id} className="flex items-center justify-between p-4">
              <div>
                <div className="font-medium">
                  {formatUserWithName(p)}
                  {isMe && <span className="ml-2 text-xs text-slate-500 dark:text-slate-400">(Ty)</span>}
                  {isOwner && (
                    <span className="ml-2 rounded bg-brand-100 px-2 py-0.5 text-xs text-brand-700 dark:bg-mauve-700/40 dark:text-mauve-100">
                      właściciel
                    </span>
                  )}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  dołączył/a: {format(new Date(p.joinedAt), 'dd.MM.yyyy')}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {canChangeThisRole ? (
                  <select
                    value={p.role}
                    onChange={(e) =>
                      roleMutation.mutate({
                        userId: p.userId,
                        role: Number(e.target.value) as ParticipantRole,
                      })
                    }
                    disabled={roleMutation.isPending}
                    className="rounded border bg-white dark:bg-slate-900 px-2 py-1 text-xs"
                  >
                    <option value={ParticipantRole.Member}>Uczestnik</option>
                    <option value={ParticipantRole.Editor}>Edytor</option>
                    <option value={ParticipantRole.Organizer}>Organizator</option>
                  </select>
                ) : (
                  <span className="rounded bg-slate-100 dark:bg-slate-800 px-2 py-1 text-xs text-slate-700 dark:text-slate-200">
                    {roleLabel[p.role]}
                  </span>
                )}
                {canRemoveThis && (
                  <button
                    onClick={() => {
                      if (confirm(`Usunąć ${formatUserWithName(p)} z wycieczki?`)) {
                        deleteMutation.mutate(p.userId);
                      }
                    }}
                    disabled={deleteMutation.isPending}
                    className="rounded px-2 py-1 text-xs text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40"
                  >
                    Usuń
                  </button>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

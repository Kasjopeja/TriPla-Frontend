import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { commentsApi } from '@/api/comments';
import type {
  CommentDto,
  CreateCommentRequest,
  UpdateCommentRequest,
  Uuid,
} from '@/types';
import { useAuthStore } from '@/store/auth';
import { formatUserWithName } from '@/utils/user';

const schema = z.object({
  content: z.string().min(1, 'Treść jest wymagana').max(2000, 'Maksymalnie 2000 znaków'),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  tripId: Uuid;
  comments: CommentDto[];
}

export function CommentsTab({ tripId, comments }: Props) {
  const qc = useQueryClient();
  const currentUserId = useAuthStore((s) => s.userId);
  const [editingId, setEditingId] = useState<Uuid | null>(null);
  const [replyingTo, setReplyingTo] = useState<Uuid | null>(null);

  const { topLevel, repliesByParent } = useMemo(() => {
    const top: CommentDto[] = [];
    const byParent = new Map<Uuid, CommentDto[]>();
    for (const c of comments) {
      if (c.parentId) {
        const arr = byParent.get(c.parentId) ?? [];
        arr.push(c);
        byParent.set(c.parentId, arr);
      } else {
        top.push(c);
      }
    }
    return { topLevel: top, repliesByParent: byParent };
  }, [comments]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const addMutation = useMutation({
    mutationFn: (payload: CreateCommentRequest) =>
      commentsApi.create(tripId, payload),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['trip', tripId] });
      reset();
      setReplyingTo(null);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: Uuid; payload: UpdateCommentRequest }) =>
      commentsApi.update(id, payload),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['trip', tripId] });
      setEditingId(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: Uuid) => commentsApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['trip', tripId] }),
  });

  const renderComment = (c: CommentDto, isReply: boolean) => {
    const isAuthor = c.authorId === currentUserId;
    const isEditing = editingId === c.id;

    return (
      <div className="rounded border bg-white dark:bg-slate-900 p-4">
        <div className="flex items-start justify-between">
          <div className="text-sm font-medium text-slate-700 dark:text-slate-200">
            {formatUserWithName({
              firstName: c.authorFirstName,
              lastName: c.authorLastName,
              email: c.authorEmail,
              userId: c.authorId,
            })}
            {isAuthor && <span className="ml-2 text-xs text-slate-500 dark:text-slate-400">(Ty)</span>}
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {format(new Date(c.createdAt), 'dd.MM.yyyy HH:mm')}
            {c.editedAt && ' · edytowany'}
          </span>
        </div>

        {isEditing ? (
          <EditForm
            initial={c.content}
            isPending={updateMutation.isPending}
            onSubmit={(content) =>
              updateMutation.mutate({ id: c.id, payload: { content } })
            }
            onCancel={() => setEditingId(null)}
          />
        ) : (
          <p className="mt-2 whitespace-pre-wrap text-sm">{c.content}</p>
        )}

        {!isEditing && (
          <div className="mt-2 flex justify-end gap-1">
            {!isReply && (
              <button
                onClick={() =>
                  setReplyingTo((prev) => (prev === c.id ? null : c.id))
                }
                className="rounded px-2 py-1 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                {replyingTo === c.id ? 'Anuluj odpowiedź' : 'Odpowiedz'}
              </button>
            )}
            {isAuthor && (
              <>
                <button
                  onClick={() => setEditingId(c.id)}
                  className="rounded px-2 py-1 text-xs text-brand-700 hover:bg-brand-50 dark:text-mauve-200 dark:hover:bg-mauve-700/30"
                >
                  Edytuj
                </button>
                <button
                  onClick={() => {
                    if (confirm('Usunąć komentarz?')) {
                      deleteMutation.mutate(c.id);
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
        )}
      </div>
    );
  };

  return (
    <div>
      <h2 className="mb-4 text-xl font-semibold">Komentarze ({comments.length})</h2>

      <form
        onSubmit={handleSubmit((values) =>
          addMutation.mutate({ content: values.content, parentId: null }),
        )}
        className="mb-6 space-y-2"
      >
        <textarea
          {...register('content')}
          rows={3}
          placeholder="Napisz komentarz..."
          className="input"
        />
        {errors.content && (
          <p className="text-sm text-red-600">{errors.content.message}</p>
        )}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={addMutation.isPending}
            className="rounded bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
          >
            {addMutation.isPending && !replyingTo ? 'Wysyłanie...' : 'Dodaj komentarz'}
          </button>
        </div>
      </form>

      {topLevel.length === 0 ? (
        <p className="rounded border border-dashed p-6 text-center text-slate-500 dark:text-slate-400">
          Brak komentarzy. Bądź pierwszy!
        </p>
      ) : (
        <ul className="space-y-3">
          {topLevel.map((c) => {
            const replies = repliesByParent.get(c.id) ?? [];
            return (
              <li key={c.id}>
                {renderComment(c, false)}

                {replyingTo === c.id && (
                  <div className="ml-6 mt-2">
                    <ReplyForm
                      isPending={addMutation.isPending}
                      onSubmit={(content) =>
                        addMutation.mutate({ content, parentId: c.id })
                      }
                      onCancel={() => setReplyingTo(null)}
                    />
                  </div>
                )}

                {replies.length > 0 && (
                  <ul className="ml-6 mt-2 space-y-2 border-l-2 border-slate-200 pl-4">
                    {replies.map((r) => (
                      <li key={r.id}>{renderComment(r, true)}</li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function EditForm({
  initial,
  isPending,
  onSubmit,
  onCancel,
}: {
  initial: string;
  isPending: boolean;
  onSubmit: (content: string) => void;
  onCancel: () => void;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { content: initial },
  });

  return (
    <form
      onSubmit={handleSubmit((v) => onSubmit(v.content))}
      className="mt-2 space-y-2"
    >
      <textarea
        {...register('content')}
        rows={3}
        className="input"
      />
      {errors.content && (
        <p className="text-sm text-red-600">{errors.content.message}</p>
      )}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isPending}
          className="rounded bg-brand-600 px-3 py-1 text-xs font-medium text-white hover:bg-brand-700 disabled:opacity-50"
        >
          {isPending ? 'Zapisywanie...' : 'Zapisz'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded bg-slate-100 dark:bg-slate-800 px-3 py-1 text-xs hover:bg-slate-200"
        >
          Anuluj
        </button>
      </div>
    </form>
  );
}

function ReplyForm({
  isPending,
  onSubmit,
  onCancel,
}: {
  isPending: boolean;
  onSubmit: (content: string) => void;
  onCancel: () => void;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  return (
    <form
      onSubmit={handleSubmit((v) => onSubmit(v.content))}
      className="space-y-2 rounded border bg-slate-50 dark:bg-slate-800/50 p-3"
    >
      <textarea
        {...register('content')}
        rows={2}
        placeholder="Napisz odpowiedź..."
        className="input text-sm"
      />
      {errors.content && (
        <p className="text-sm text-red-600">{errors.content.message}</p>
      )}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isPending}
          className="rounded bg-brand-600 px-3 py-1 text-xs font-medium text-white hover:bg-brand-700 disabled:opacity-50"
        >
          {isPending ? 'Wysyłanie...' : 'Odpowiedz'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded bg-slate-100 dark:bg-slate-800 px-3 py-1 text-xs hover:bg-slate-200"
        >
          Anuluj
        </button>
      </div>
    </form>
  );
}

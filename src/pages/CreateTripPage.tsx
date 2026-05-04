import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { tripsApi } from '@/api/trips';

const schema = z
  .object({
    name: z.string().min(1, 'Nazwa jest wymagana'),
    description: z.string().default(''),
    startDate: z.string().min(1, 'Data początkowa jest wymagana'),
    endDate: z.string().min(1, 'Data końcowa jest wymagana'),
  })
  .refine((v) => new Date(v.startDate) <= new Date(v.endDate), {
    message: 'Data końcowa musi być po dacie początkowej',
    path: ['endDate'],
  });

type FormValues = z.infer<typeof schema>;

export function CreateTripPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const navigate = useNavigate();
  const qc = useQueryClient();

  const mutation = useMutation({
    mutationFn: tripsApi.create,
    onSuccess: async (data) => {
      await qc.invalidateQueries({ queryKey: ['trips'] });
      navigate(`/trips/${data.id}`);
    },
  });

  return (
    <div className="card mx-auto max-w-xl p-6">
      <h1 className="mb-4 text-2xl font-bold">Nowa wycieczka</h1>
      <form
        onSubmit={handleSubmit((values) => mutation.mutate(values))}
        className="space-y-4"
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
          <textarea {...register('description')} rows={3} className="input" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Data początkowa</label>
            <input type="date" {...register('startDate')} className="input" />
            {errors.startDate && (
              <p className="mt-1 text-sm text-red-600">{errors.startDate.message}</p>
            )}
          </div>
          <div>
            <label className="label">Data końcowa</label>
            <input type="date" {...register('endDate')} className="input" />
            {errors.endDate && (
              <p className="mt-1 text-sm text-red-600">{errors.endDate.message}</p>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          <button type="submit" disabled={mutation.isPending} className="btn-primary">
            {mutation.isPending ? 'Zapisywanie...' : 'Utwórz'}
          </button>
          <button type="button" onClick={() => navigate(-1)} className="btn-secondary">
            Anuluj
          </button>
        </div>
      </form>
    </div>
  );
}

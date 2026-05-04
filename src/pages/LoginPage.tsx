import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Mail, Lock } from 'lucide-react';
import { authApi } from '@/api/auth';
import { useAuthStore } from '@/store/auth';
import { AuthHero } from '@/components/AuthHero';
import { getApiErrorMessage } from '@/utils/errors';

const schema = z.object({
  email: z.string().email('Niepoprawny email'),
  password: z.string().min(1, 'Hasło jest wymagane'),
});

type FormValues = z.infer<typeof schema>;

export function LoginPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const navigate = useNavigate();
  const location = useLocation();
  const setAuth = useAuthStore((s) => s.setAuth);

  const from =
    (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ??
    '/trips';

  const mutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      setAuth(data);
      navigate(from, { replace: true });
    },
  });

  const errorMessage = mutation.error
    ? getApiErrorMessage(mutation.error, {
        unauthorized: 'Niepoprawny email lub hasło.',
      })
    : null;

  return (
    <div className="grid gap-8 md:grid-cols-2 md:items-center">
      <AuthHero
        title="Planuj wycieczki ze znajomymi w jednym miejscu"
        subtitle="Atrakcje, wydatki z automatycznym rozliczeniem, komentarze i pełna historia zmian. TriPla trzyma to wszystko w porządku."
      />

      <div className="card mx-auto w-full max-w-md p-8">
        <h1 className="mb-1 text-2xl font-bold">Witaj z powrotem</h1>
        <p className="mb-6 text-sm text-slate-500">Zaloguj się, żeby kontynuować.</p>

        <form
          onSubmit={handleSubmit((values) => mutation.mutate(values))}
          className="space-y-4"
        >
          <div>
            <label className="label">Email</label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                {...register('email')}
                className="input pl-9"
                placeholder="ty@example.com"
              />
            </div>
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="label">Hasło</label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                {...register('password')}
                className="input pl-9"
                placeholder="••••••••"
              />
            </div>
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
            )}
          </div>

          {errorMessage && (
            <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">
              {errorMessage}
            </p>
          )}

          <button
            type="submit"
            disabled={mutation.isPending}
            className="btn-primary w-full"
          >
            {mutation.isPending ? 'Logowanie...' : 'Zaloguj się'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          Nie masz konta?{' '}
          <Link to="/register" className="font-semibold text-brand-600 hover:underline">
            Zarejestruj się
          </Link>
        </p>
      </div>
    </div>
  );
}

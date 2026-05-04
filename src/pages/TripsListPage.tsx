import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { CalendarDays, Plus, Users } from 'lucide-react';
import { tripsApi } from '@/api/trips';
import type { TripDto, Uuid } from '@/types';

const cardGradients = [
  'from-sky-400 via-blue-500 to-indigo-600',
  'from-emerald-400 via-teal-500 to-cyan-600',
  'from-orange-400 via-rose-500 to-pink-600',
  'from-violet-500 via-purple-500 to-fuchsia-600',
  'from-amber-400 via-orange-500 to-red-500',
  'from-cyan-400 via-sky-500 to-blue-600',
  'from-pink-400 via-fuchsia-500 to-purple-600',
  'from-lime-400 via-green-500 to-emerald-600',
];

function gradientFor(id: Uuid): string {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0;
  return cardGradients[Math.abs(h) % cardGradients.length];
}

function TripCard({ trip }: { trip: TripDto }) {
  const gradient = gradientFor(trip.id);
  const start = new Date(trip.startDate);
  const end = new Date(trip.endDate);

  return (
    <Link
      to={`/trips/${trip.id}`}
      className="group card overflow-hidden p-0 transition hover:-translate-y-1 hover:shadow-glow"
    >
      <div
        className={
          'relative h-24 bg-gradient-to-br ' +
          gradient +
          ' p-4 text-white'
        }
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(255,255,255,0.25),transparent_60%)]" />
        <div className="relative flex h-full flex-col justify-between">
          <div className="text-xs font-medium uppercase tracking-wider text-white/80">
            {format(start, 'LLL yyyy')}
          </div>
          <div className="text-2xl font-extrabold leading-tight drop-shadow-sm">
            {trip.name}
          </div>
        </div>
      </div>

      <div className="space-y-3 p-4">
        <p className="line-clamp-2 min-h-[2.5rem] text-sm text-slate-600 dark:text-slate-400">
          {trip.description || 'Brak opisu'}
        </p>
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays className="h-3.5 w-3.5" />
            {format(start, 'dd.MM')} – {format(end, 'dd.MM.yyyy')}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5" />
            {trip.participantCount}
          </span>
        </div>
      </div>
    </Link>
  );
}

export function TripsListPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['trips'],
    queryFn: tripsApi.list,
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Moje wycieczki</h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Wszystko, na co planujesz lub byłeś zaproszony.
          </p>
        </div>
        <Link to="/trips/new" className="btn-primary inline-flex items-center gap-1.5">
          <Plus className="h-4 w-4" />
          Nowa wycieczka
        </Link>
      </div>

      {isLoading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="card h-[200px] animate-pulse overflow-hidden bg-slate-100/60"
            />
          ))}
        </div>
      )}
      {error && (
        <p className="card px-4 py-3 text-red-700 dark:text-red-300">
          Nie udało się pobrać wycieczek.
        </p>
      )}

      {data && data.length === 0 && (
        <div className="card flex flex-col items-center gap-3 p-12 text-center text-slate-600 dark:text-slate-400">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-gradient-soft dark:bg-none dark:bg-mauve-800/50">
            <CalendarDays className="h-7 w-7 text-mauve-700 dark:text-mauve-200" />
          </div>
          <p className="text-lg font-semibold text-slate-800 dark:text-slate-100">
            Nie masz jeszcze żadnych wycieczek
          </p>
          <p className="max-w-sm text-sm">
            Utwórz pierwszą i zaproś znajomych, żeby planować razem.
          </p>
          <Link
            to="/trips/new"
            className="btn-primary mt-2 inline-flex items-center gap-1.5"
          >
            <Plus className="h-4 w-4" />
            Utwórz wycieczkę
          </Link>
        </div>
      )}

      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {data?.map((trip) => (
          <li key={trip.id}>
            <TripCard trip={trip} />
          </li>
        ))}
      </ul>
    </div>
  );
}

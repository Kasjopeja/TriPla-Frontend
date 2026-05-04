import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  addDays,
  addMonths,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isWithinInterval,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from 'date-fns';
import { tripsApi } from '@/api/trips';
import type { TripDto, Uuid } from '@/types';

const WEEK_STARTS_ON = 1; // poniedziałek

const weekdayLabels = ['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'Sb', 'Nd'];

// 8 stałych kolorków, deterministycznie po tripId, żeby ten sam trip był zawsze w tym samym kolorze.
const tripColors = [
  'bg-sky-500/90 text-white',
  'bg-emerald-500/90 text-white',
  'bg-amber-500/90 text-white',
  'bg-rose-500/90 text-white',
  'bg-violet-500/90 text-white',
  'bg-teal-500/90 text-white',
  'bg-orange-500/90 text-white',
  'bg-fuchsia-500/90 text-white',
];

function colorForTrip(tripId: Uuid): string {
  let hash = 0;
  for (let i = 0; i < tripId.length; i++) hash = (hash * 31 + tripId.charCodeAt(i)) | 0;
  return tripColors[Math.abs(hash) % tripColors.length];
}

interface BarLayout {
  trip: TripDto;
  startCol: number;
  span: number;
  startsHere: boolean;
  endsHere: boolean;
}

function layoutBarsForWeek(weekStart: Date, weekEnd: Date, trips: TripDto[]): BarLayout[] {
  const dayMs = 1000 * 60 * 60 * 24;
  return trips
    .map((trip) => {
      const tripStart = startOfDay(new Date(trip.startDate));
      const tripEnd = startOfDay(new Date(trip.endDate));
      if (tripEnd < weekStart || tripStart > weekEnd) return null;

      const visibleStart = tripStart < weekStart ? weekStart : tripStart;
      const visibleEnd = tripEnd > weekEnd ? weekEnd : tripEnd;
      const startCol = Math.round((visibleStart.getTime() - weekStart.getTime()) / dayMs);
      const span =
        Math.round((visibleEnd.getTime() - visibleStart.getTime()) / dayMs) + 1;

      return {
        trip,
        startCol,
        span,
        startsHere: isSameDay(tripStart, visibleStart),
        endsHere: isSameDay(tripEnd, visibleEnd),
      };
    })
    .filter((b): b is BarLayout => b !== null)
    .sort((a, b) => {
      const sa = new Date(a.trip.startDate).getTime();
      const sb = new Date(b.trip.startDate).getTime();
      return sa - sb;
    });
}

export function CalendarPage() {
  const [cursor, setCursor] = useState(() => startOfMonth(new Date()));

  const { data: trips, isLoading, error } = useQuery({
    queryKey: ['trips'],
    queryFn: tripsApi.list,
  });

  const today = startOfDay(new Date());

  const weeks = useMemo(() => {
    const monthStart = startOfMonth(cursor);
    const monthEnd = endOfMonth(cursor);
    const gridStart = startOfWeek(monthStart, { weekStartsOn: WEEK_STARTS_ON });
    const gridEnd = endOfWeek(monthEnd, { weekStartsOn: WEEK_STARTS_ON });

    const result: { start: Date; end: Date; days: Date[] }[] = [];
    let day = gridStart;
    while (day <= gridEnd) {
      const days: Date[] = [];
      for (let i = 0; i < 7; i++) {
        days.push(addDays(day, i));
      }
      result.push({ start: day, end: addDays(day, 6), days });
      day = addDays(day, 7);
    }
    return result;
  }, [cursor]);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold capitalize">
          {format(cursor, 'LLLL yyyy')}
        </h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCursor(addMonths(cursor, -1))}
            className="rounded border px-3 py-1 text-sm hover:bg-slate-50 dark:hover:bg-slate-800"
            aria-label="Poprzedni miesiąc"
          >
            ←
          </button>
          <button
            onClick={() => setCursor(startOfMonth(new Date()))}
            className="rounded border px-3 py-1 text-sm hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            Dziś
          </button>
          <button
            onClick={() => setCursor(addMonths(cursor, 1))}
            className="rounded border px-3 py-1 text-sm hover:bg-slate-50 dark:hover:bg-slate-800"
            aria-label="Następny miesiąc"
          >
            →
          </button>
        </div>
      </div>

      {isLoading && <p className="text-slate-600 dark:text-slate-300">Ładowanie...</p>}
      {error && (
        <p className="rounded bg-red-50 px-3 py-2 text-red-700 dark:bg-red-950/40 dark:text-red-300">
          Nie udało się pobrać wycieczek.
        </p>
      )}

      {trips && (
        <div className="overflow-hidden rounded-lg border bg-white dark:bg-slate-900 shadow-sm">
          <div className="grid grid-cols-7 border-b bg-slate-50 dark:bg-slate-800/50 text-xs font-medium text-slate-600 dark:text-slate-300">
            {weekdayLabels.map((d) => (
              <div key={d} className="px-2 py-2 text-center">
                {d}
              </div>
            ))}
          </div>

          {weeks.map((week, wIdx) => {
            const bars = layoutBarsForWeek(week.start, week.end, trips);
            return (
              <div key={wIdx} className="relative border-b last:border-b-0">
                <div className="grid grid-cols-7">
                  {week.days.map((day, dIdx) => {
                    const isToday = isSameDay(day, today);
                    const inMonth = isSameMonth(day, cursor);
                    const hasTrip = trips.some((t) =>
                      isWithinInterval(day, {
                        start: startOfDay(new Date(t.startDate)),
                        end: startOfDay(new Date(t.endDate)),
                      }),
                    );
                    return (
                      <div
                        key={dIdx}
                        className={
                          'min-h-[110px] border-r p-1 last:border-r-0 ' +
                          (inMonth
                            ? 'bg-white dark:bg-slate-900'
                            : 'bg-slate-100 text-slate-400 dark:bg-slate-800/40 dark:text-slate-500')
                        }
                      >
                        <div
                          className={
                            'mb-0.5 flex h-6 w-6 items-center justify-center rounded-full text-xs ' +
                            (isToday
                              ? 'bg-brand-600 font-semibold text-white'
                              : hasTrip
                                ? 'font-semibold text-slate-700 dark:text-slate-200'
                                : 'text-slate-500 dark:text-slate-400')
                          }
                        >
                          {format(day, 'd')}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Paski wycieczek nakładane na siatkę */}
                <div className="pointer-events-none absolute inset-x-0 top-7 grid grid-cols-7 gap-y-0.5 px-1 pb-1">
                  {bars.map((bar, bIdx) => (
                    <Link
                      key={`${bar.trip.id}-${bIdx}`}
                      to={`/trips/${bar.trip.id}`}
                      title={`${bar.trip.name} (${format(new Date(bar.trip.startDate), 'dd.MM')} – ${format(new Date(bar.trip.endDate), 'dd.MM')})`}
                      style={{
                        gridColumnStart: bar.startCol + 1,
                        gridColumnEnd: `span ${bar.span}`,
                      }}
                      className={
                        'pointer-events-auto truncate px-2 py-0.5 text-xs ' +
                        colorForTrip(bar.trip.id) +
                        ' ' +
                        (bar.startsHere ? 'rounded-l-md ' : '') +
                        (bar.endsHere ? 'rounded-r-md' : '')
                      }
                    >
                      {bar.startsHere ? bar.trip.name : '…'}
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {trips && trips.length === 0 && (
        <p className="mt-4 rounded border border-dashed p-6 text-center text-slate-500 dark:text-slate-400">
          Nie masz jeszcze żadnych wycieczek do wyświetlenia.
        </p>
      )}
    </div>
  );
}

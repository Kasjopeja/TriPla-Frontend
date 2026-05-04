import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { historyApi } from '@/api/history';
import type { TripChangeLogDto, Uuid } from '@/types';

interface Props {
  tripId: Uuid;
}

const typeLabel: Record<string, string> = {
  TripCreated: 'Utworzono wycieczkę',
  TripUpdated: 'Zaktualizowano wycieczkę',
  TripDeleted: 'Usunięto wycieczkę',
  ParticipantInvited: 'Zaproszono uczestnika',
  ParticipantRemoved: 'Usunięto uczestnika',
  ParticipantLeft: 'Uczestnik opuścił wycieczkę',
  RoleChanged: 'Zmieniono rolę',
  AttractionAdded: 'Dodano atrakcję',
  AttractionUpdated: 'Zaktualizowano atrakcję',
  AttractionDeleted: 'Usunięto atrakcję',
  ExpenseAdded: 'Dodano wydatek',
  ExpenseUpdated: 'Zaktualizowano wydatek',
  ExpenseDeleted: 'Usunięto wydatek',
  ExpenseSettled: 'Oznaczono wydatek jako rozliczony',
  ExpenseUnsettled: 'Cofnięto rozliczenie wydatku',
  AllExpensesSettled: 'Rozliczono wszystkie wydatki',
  AllExpensesUnsettled: 'Cofnięto rozliczenie wszystkich wydatków',
  CommentAdded: 'Dodano komentarz',
  CommentReplied: 'Dodano odpowiedź',
  CommentUpdated: 'Edytowano komentarz',
  CommentDeleted: 'Usunięto komentarz',
};

function labelFor(type: string): string {
  return typeLabel[type] ?? type;
}

function parsePayload(json: string | null): Record<string, unknown> | null {
  if (!json) return null;
  try {
    const v = JSON.parse(json);
    return typeof v === 'object' && v !== null ? v : null;
  } catch {
    return null;
  }
}

const fieldLabel: Record<string, string> = {
  name: 'nazwa',
  description: 'opis',
  startDate: 'data początkowa',
  endDate: 'data końcowa',
  title: 'tytuł',
  amount: 'kwota',
  currency: 'waluta',
  category: 'kategoria',
  date: 'data',
  splits: 'podział',
  street: 'ulica',
  city: 'miasto',
  country: 'kraj',
  plannedAt: 'termin',
  content: 'treść',
};

function formatValue(v: unknown): string {
  if (v === null || v === undefined || v === '') return '—';
  if (typeof v === 'string') {
    const iso = /^\d{4}-\d{2}-\d{2}T/.test(v);
    if (iso) {
      const d = new Date(v);
      if (!Number.isNaN(d.getTime())) return format(d, 'dd.MM.yyyy HH:mm');
    }
    return v;
  }
  if (typeof v === 'number') return v.toString();
  return JSON.stringify(v);
}

interface Change {
  before: unknown;
  after: unknown;
}

function parseChanges(payload: Record<string, unknown>): [string, Change][] | null {
  const raw = payload.changes;
  if (!raw || typeof raw !== 'object') return null;
  return Object.entries(raw as Record<string, Change>);
}

function describeEntry(entry: TripChangeLogDto): { summary: string; changes: [string, Change][] | null } {
  const payload = parsePayload(entry.payloadJson);
  if (!payload) return { summary: '', changes: null };

  const changes = parseChanges(payload);

  switch (entry.type) {
    case 'TripCreated':
    case 'TripDeleted':
      return {
        summary: typeof payload.name === 'string' ? `„${payload.name}"` : '',
        changes: null,
      };
    case 'TripUpdated':
      return { summary: '', changes };
    case 'ParticipantInvited':
      return {
        summary: [payload.invitedEmail, payload.role && `(${payload.role})`]
          .filter(Boolean)
          .join(' '),
        changes: null,
      };
    case 'ParticipantRemoved':
      return {
        summary: typeof payload.removedEmail === 'string' ? payload.removedEmail : '',
        changes: null,
      };
    case 'ParticipantLeft':
      return {
        summary: typeof payload.email === 'string' ? payload.email : '',
        changes: null,
      };
    case 'RoleChanged':
      return {
        summary: [payload.targetEmail, payload.newRole && `→ ${payload.newRole}`]
          .filter(Boolean)
          .join(' '),
        changes: null,
      };
    case 'AttractionAdded':
    case 'AttractionDeleted':
      return {
        summary: typeof payload.name === 'string' ? `„${payload.name}"` : '',
        changes: null,
      };
    case 'AttractionUpdated':
      return {
        summary: typeof payload.name === 'string' ? `„${payload.name}"` : '',
        changes,
      };
    case 'ExpenseAdded':
    case 'ExpenseDeleted': {
      const title = typeof payload.title === 'string' ? `„${payload.title}"` : '';
      const amount =
        payload.amount !== undefined && payload.currency
          ? `(${payload.amount} ${payload.currency})`
          : '';
      return { summary: [title, amount].filter(Boolean).join(' '), changes: null };
    }
    case 'ExpenseUpdated':
      return {
        summary: typeof payload.title === 'string' ? `„${payload.title}"` : '',
        changes,
      };
    case 'ExpenseSettled':
    case 'ExpenseUnsettled':
      return {
        summary: typeof payload.title === 'string' ? `„${payload.title}"` : '',
        changes: null,
      };
    case 'AllExpensesSettled':
    case 'AllExpensesUnsettled':
      return {
        summary:
          typeof payload.count === 'number'
            ? `(${payload.count} ${payload.count === 1 ? 'wydatek' : 'wydatków'})`
            : '',
        changes: null,
      };
    case 'CommentAdded':
    case 'CommentReplied':
      return {
        summary: typeof payload.preview === 'string' ? `„${payload.preview}"` : '',
        changes: null,
      };
    case 'CommentUpdated':
      return { summary: '', changes };
    default:
      return { summary: '', changes: null };
  }
}

export function HistoryTab({ tripId }: Props) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['trip', tripId, 'history'],
    queryFn: () => historyApi.list(tripId),
  });

  if (isLoading) return <p className="text-slate-600 dark:text-slate-300">Ładowanie...</p>;
  if (error)
    return (
      <p className="rounded bg-red-50 px-3 py-2 text-red-700 dark:bg-red-950/40 dark:text-red-300">
        Nie udało się pobrać historii. Upewnij się, że Mongo działa.
      </p>
    );

  return (
    <div>
      <h2 className="mb-4 text-xl font-semibold">
        Historia zmian ({data?.length ?? 0})
      </h2>

      {!data || data.length === 0 ? (
        <p className="rounded border border-dashed p-6 text-center text-slate-500 dark:text-slate-400">
          Brak zdarzeń.
        </p>
      ) : (
        <ol className="space-y-2">
          {data.map((entry, idx) => {
            const { summary, changes } = describeEntry(entry);
            return (
              <li
                key={idx}
                className="flex items-start gap-3 rounded border bg-white dark:bg-slate-900 p-3"
              >
                <div className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-brand-500" />
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-sm font-medium">{labelFor(entry.type)}</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {format(new Date(entry.occurredAt), 'dd.MM.yyyy HH:mm')}
                    </span>
                  </div>
                  {summary && <p className="text-sm text-slate-600 dark:text-slate-300">{summary}</p>}
                  {changes && changes.length > 0 && (
                    <ul className="mt-1 space-y-0.5 text-xs text-slate-600 dark:text-slate-300">
                      {changes.map(([field, { before, after }]) => (
                        <li key={field}>
                          <span className="font-medium">
                            {fieldLabel[field] ?? field}
                          </span>
                          :{' '}
                          <span className="text-slate-500 dark:text-slate-400 line-through">
                            {formatValue(before)}
                          </span>
                          {' → '}
                          <span className="text-slate-800 dark:text-slate-100">{formatValue(after)}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    {entry.actorEmail ?? entry.actorId.slice(0, 8)}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}

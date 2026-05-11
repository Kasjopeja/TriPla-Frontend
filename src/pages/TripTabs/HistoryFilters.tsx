import { ArrowDownAZ, ArrowUpAZ, RotateCcw } from 'lucide-react';
import type {
  HistoryQuery,
  HistorySortDirection,
  HistorySortField,
  ParticipantDto,
  Uuid,
} from '@/types';
import { formatUserShort } from '@/utils/user';
import { typeLabel } from './historyMeta';

interface Props {
  participants: ParticipantDto[];
  value: HistoryFiltersValue;
  onChange: (next: HistoryFiltersValue) => void;
  onReset: () => void;
}

export interface HistoryFiltersValue {
  type: string;
  actorId: Uuid | '';
  from: string;
  to: string;
  sortBy: HistorySortField;
  sortDir: HistorySortDirection;
  limit: number;
}

export const defaultFilters: HistoryFiltersValue = {
  type: '',
  actorId: '',
  from: '',
  to: '',
  sortBy: 'occurredAt',
  sortDir: 'desc',
  limit: 50,
};

export function filtersToQuery(f: HistoryFiltersValue, skip: number): HistoryQuery {
  return {
    type: f.type || undefined,
    actorId: f.actorId || undefined,
    from: f.from ? new Date(f.from).toISOString() : undefined,
    to: f.to ? new Date(`${f.to}T23:59:59.999Z`).toISOString() : undefined,
    sortBy: f.sortBy,
    sortDir: f.sortDir,
    skip,
    limit: f.limit,
  };
}

export function isAnyFilterActive(f: HistoryFiltersValue): boolean {
  return (
    f.type !== '' ||
    f.actorId !== '' ||
    f.from !== '' ||
    f.to !== '' ||
    f.sortBy !== defaultFilters.sortBy ||
    f.sortDir !== defaultFilters.sortDir ||
    f.limit !== defaultFilters.limit
  );
}

const sortFieldLabel: Record<HistorySortField, string> = {
  occurredAt: 'Data',
  type: 'Typ',
  actorEmail: 'Autor',
};

const pageSizeOptions = [25, 50, 100, 200];

export function HistoryFilters({ participants, value, onChange, onReset }: Props) {
  const update = (patch: Partial<HistoryFiltersValue>) => onChange({ ...value, ...patch });

  const toggleDir = () =>
    update({ sortDir: value.sortDir === 'asc' ? 'desc' : 'asc' });

  return (
    <div className="mb-4 rounded-xl border border-slate-200 bg-slate-50/60 p-3 dark:border-slate-700 dark:bg-slate-900/40">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <label className="label" htmlFor="hist-type">
            Typ zdarzenia
          </label>
          <select
            id="hist-type"
            className="input"
            value={value.type}
            onChange={(e) => update({ type: e.target.value })}
          >
            <option value="">Wszystkie</option>
            {Object.entries(typeLabel).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="label" htmlFor="hist-actor">
            Autor
          </label>
          <select
            id="hist-actor"
            className="input"
            value={value.actorId}
            onChange={(e) => update({ actorId: e.target.value })}
          >
            <option value="">Wszyscy</option>
            {participants.map((p) => (
              <option key={p.userId} value={p.userId}>
                {formatUserShort({
                  firstName: p.firstName,
                  lastName: p.lastName,
                  email: p.email,
                  userId: p.userId,
                })}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="label" htmlFor="hist-from">
            Od (data)
          </label>
          <input
            id="hist-from"
            type="date"
            className="input"
            value={value.from}
            max={value.to || undefined}
            onChange={(e) => update({ from: e.target.value })}
          />
        </div>

        <div>
          <label className="label" htmlFor="hist-to">
            Do (data)
          </label>
          <input
            id="hist-to"
            type="date"
            className="input"
            value={value.to}
            min={value.from || undefined}
            onChange={(e) => update({ to: e.target.value })}
          />
        </div>

        <div>
          <label className="label" htmlFor="hist-sort">
            Sortuj wg
          </label>
          <div className="flex gap-2">
            <select
              id="hist-sort"
              className="input"
              value={value.sortBy}
              onChange={(e) =>
                update({ sortBy: e.target.value as HistorySortField })
              }
            >
              {(Object.keys(sortFieldLabel) as HistorySortField[]).map((k) => (
                <option key={k} value={k}>
                  {sortFieldLabel[k]}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={toggleDir}
              className="btn-secondary !px-3"
              aria-label={
                value.sortDir === 'asc'
                  ? 'Sortuj malejąco'
                  : 'Sortuj rosnąco'
              }
              title={
                value.sortDir === 'asc' ? 'Rosnąco (kliknij, by zmienić)' : 'Malejąco (kliknij, by zmienić)'
              }
            >
              {value.sortDir === 'asc' ? (
                <ArrowUpAZ className="h-4 w-4" />
              ) : (
                <ArrowDownAZ className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        <div>
          <label className="label" htmlFor="hist-limit">
            Na stronę
          </label>
          <select
            id="hist-limit"
            className="input"
            value={value.limit}
            onChange={(e) => update({ limit: Number(e.target.value) })}
          >
            {pageSizeOptions.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-end sm:col-span-2 lg:col-span-2">
          <button
            type="button"
            onClick={onReset}
            disabled={!isAnyFilterActive(value)}
            className="btn-ghost inline-flex items-center gap-1.5"
          >
            <RotateCcw className="h-4 w-4" />
            Resetuj filtry
          </button>
        </div>
      </div>
    </div>
  );
}
